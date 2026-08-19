import { Injectable } from '@nestjs/common';
import { GatewayClient } from './gateway.client';
import { CriarContaGatewayDto } from './dto/criar-conta-gateway.dto';

@Injectable()
export class GatewayService {
  constructor(private readonly gatewayClient: GatewayClient) {}

  criarConta(dto: CriarContaGatewayDto) {
    return this.gatewayClient.criarConta(dto);
  }

  criarPagamentoPix(payload: {
    amount: number;
    payerDocument: string;
    description?: string;
    externalReference: string;
  }) {
    return this.gatewayClient.criarPagamentoPix(payload);
  }
}
