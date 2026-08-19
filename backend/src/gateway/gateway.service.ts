import { Injectable } from '@nestjs/common';
import { GatewayClient } from './gateway.client';
import { CriarContaGatewayDto } from './dto/criar-conta-gateway.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckoutLink } from './checkout-link.entity';

@Injectable()
export class GatewayService {
  constructor(
    private readonly gatewayClient: GatewayClient,
    @InjectRepository(CheckoutLink)
    private readonly checkoutLinksRepository: Repository<CheckoutLink>,
  ) {}

  criarConta(dto: CriarContaGatewayDto) {
    return this.gatewayClient.criarConta(dto);
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
}
