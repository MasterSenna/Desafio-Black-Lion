import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { GatewayClient } from './gateway.client';
import { CriarContaGatewayDto } from './dto/criar-conta-gateway.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckoutLink } from './checkout-link.entity';
import { WebhookEvent } from './webhook-event.entity';

@Injectable()
export class GatewayService {
  constructor(
    private readonly gatewayClient: GatewayClient,
    @InjectRepository(CheckoutLink)
    private readonly checkoutLinksRepository: Repository<CheckoutLink>,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventsRepository: Repository<WebhookEvent>,
    private readonly configService: ConfigService,
  ) {}

  criarConta(dto: CriarContaGatewayDto) {
    return this.gatewayClient.criarConta(dto);
  }

  listarFees(brand?: string) {
    return this.gatewayClient.listarFees(brand);
  }

  criarPagamentoCartao(payload: object) {
    return this.gatewayClient.criarPagamentoCartao(payload);
  }

  obterWallet() {
    return this.gatewayClient.obterWallet();
  }

  listarTransacoesWallet(status?: string, type?: string, limit?: string) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (limit) params.set('limit', limit);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.gatewayClient.listarTransacoesWallet(query);
  }

  criarSaque(payload: object) {
    return this.gatewayClient.criarSaque(payload);
  }

  consultarSaque(id: string) {
    return this.gatewayClient.consultarSaque(id);
  }

  async criarPagamentoPix(payload: {
    usuarioId: string;
    amount: number;
    payerDocument: string;
    description?: string;
    externalReference: string;
  }) {
    const resposta = (await this.gatewayClient.criarPagamentoPix(payload)) as {
      id?: string;
      status?: string;
      description?: string;
      externalReference?: string;
      metadata?: { txid?: string; emv?: string; qrCodeBase64?: string };
    };
    const checkout = this.checkoutLinksRepository.create({
      usuarioId: payload.usuarioId,
      externalReference: payload.externalReference,
      gatewayPaymentId: resposta.id ?? null,
      status: resposta.status ?? 'PENDING',
      amount: payload.amount,
      description: resposta.description ?? payload.description ?? null,
      payerDocument: payload.payerDocument,
      txid: resposta.metadata?.txid ?? null,
      emv: resposta.metadata?.emv ?? null,
      qrCodeBase64: resposta.metadata?.qrCodeBase64 ?? null,
    });

    return this.checkoutLinksRepository.save(checkout);
  }

  async processarWebhookPix(
    assinatura: string | undefined,
    corpoBruto: Buffer,
    payload: Record<string, unknown>,
  ) {
    const segredo = this.configService.get<string>('GATEWAY_WEBHOOK_SECRET');
    if (segredo && segredo !== 'change-me') {
      if (!assinatura) {
        throw new UnauthorizedException('Assinatura do webhook ausente');
      }
      const esperado = createHmac('sha256', segredo)
        .update(corpoBruto)
        .digest('hex');
      const recebido = Buffer.from(assinatura);
      const calculado = Buffer.from(esperado);
      if (
        recebido.length !== calculado.length ||
        !timingSafeEqual(recebido, calculado)
      ) {
        throw new UnauthorizedException('Assinatura do webhook inválida');
      }
    }

    const metadata =
      (payload.metadata as Record<string, unknown> | undefined) ?? payload;
    const externalReference = this.obterTexto(metadata.externalReference);
    const eventKey =
      this.obterTexto(payload.id) ??
      this.obterTexto(payload.txid) ??
      `${externalReference ?? 'sem-referencia'}:${this.obterTexto(payload.status) ?? 'UNKNOWN'}`;
    const eventoExistente = await this.webhookEventsRepository.findOne({
      where: { eventKey },
    });
    if (eventoExistente) {
      return { processed: true, duplicate: true, eventKey };
    }

    const status = this.obterTexto(payload.status) ?? 'UNKNOWN';
    await this.webhookEventsRepository.save(
      this.webhookEventsRepository.create({
        eventKey,
        event: 'PAYMENT_PIX',
        externalReference: externalReference ?? null,
        status,
        payload: JSON.stringify(payload),
      }),
    );

    if (externalReference) {
      const checkout = await this.checkoutLinksRepository.findOne({
        where: { externalReference },
      });
      if (checkout) {
        checkout.status = status;
        await this.checkoutLinksRepository.save(checkout);
      }
    }

    return { processed: true, duplicate: false, eventKey, status };
  }

  private obterTexto(valor: unknown) {
    return typeof valor === 'string' && valor.length > 0 ? valor : undefined;
  }
}
