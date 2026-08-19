import { Injectable } from '@nestjs/common';
import { GatewayClient } from './gateway.client';

@Injectable()
export class GatewayService {
  constructor(private readonly gatewayClient: GatewayClient) {}

  criarPagamentoPix(payload: {
    amount: number;
    payerDocument: string;
    description?: string;
    externalReference: string;
  }) {
    return this.gatewayClient.criarPagamentoPix(payload);
  }
}
