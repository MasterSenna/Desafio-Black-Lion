import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { GatewayService } from './gateway.service';

function criarService(secret = 'change-me') {
  const gatewayClient = {
    criarPagamentoCartao: jest.fn(),
    criarPagamentoPix: jest.fn(),
  };
  const usuariosRepository = { findOne: jest.fn() };
  const checkoutLinksRepository = {
    create: jest.fn((dados: unknown) => dados),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const webhookEventsRepository = {
    create: jest.fn((dados: unknown) => dados),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const configService = { get: jest.fn().mockReturnValue(secret) };

  return {
    service: new GatewayService(
      gatewayClient as never,
      usuariosRepository as never,
      checkoutLinksRepository as never,
      webhookEventsRepository as never,
      configService as never,
    ),
    gatewayClient,
    checkoutLinksRepository,
    webhookEventsRepository,
  };
}

describe('GatewayService', () => {
  it('persiste o checkout depois de criar um pagamento com cartão', async () => {
    const { service, gatewayClient, checkoutLinksRepository } = criarService();
    gatewayClient.criarPagamentoCartao.mockResolvedValue({
      id: 'gateway-card-1',
      status: 'APPROVED',
    });
    checkoutLinksRepository.save.mockImplementation(async (checkout) => checkout);

    const resultado = await service.criarPagamentoCartao({
      usuarioId: 'usuario-1',
      amount: 15000,
      externalReference: 'usuario-1-pedido-1',
      cardNumber: '4111111111111111',
      cardHolder: 'Teste',
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: '123',
      installments: 1,
      feePercent: 2.49,
    });

    expect(gatewayClient.criarPagamentoCartao).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 15000,
        feePercent: 2.49,
      }),
    );
    expect(resultado).toEqual(
      expect.objectContaining({
        gatewayPaymentId: 'gateway-card-1',
        status: 'APPROVED',
        amount: 15000,
      }),
    );
  });

  it('atualiza o checkout ao receber webhook assinado', async () => {
    const segredo = 'segredo-teste';
    const corpo = Buffer.from(
      JSON.stringify({
        id: 'evento-1',
        status: 'APPROVED',
        externalReference: 'usuario-1-pedido-1',
      }),
    );
    const assinatura = createHmac('sha256', segredo).update(corpo).digest('hex');
    const { service, checkoutLinksRepository, webhookEventsRepository } =
      criarService(segredo);
    const checkout = { externalReference: 'usuario-1-pedido-1', status: 'PENDING' };
    checkoutLinksRepository.findOne.mockResolvedValue(checkout);
    webhookEventsRepository.findOne.mockResolvedValue(null);
    webhookEventsRepository.save.mockResolvedValue(undefined);

    await expect(
      service.processarWebhookCartao(
        assinatura,
        corpo,
        JSON.parse(corpo.toString()) as Record<string, unknown>,
      ),
    ).resolves.toEqual(
      expect.objectContaining({ processed: true, status: 'APPROVED' }),
    );
    expect(checkout.status).toBe('APPROVED');
    expect(checkoutLinksRepository.save).toHaveBeenCalledWith(checkout);
  });

  it('rejeita webhook com assinatura inválida', async () => {
    const { service } = criarService('segredo-teste');

    await expect(
      service.processarWebhookPix(
        'assinatura-invalida',
        Buffer.from('{"status":"APPROVED"}'),
        { status: 'APPROVED' },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
