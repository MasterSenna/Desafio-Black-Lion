import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type LoginGatewayResponse = {
  access_token?: string;
  token?: string;
};

@Injectable()
export class GatewayClient {
  private accessToken: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  async criarPagamentoPix(payload: {
    amount: number;
    payerDocument: string;
    description?: string;
    externalReference: string;
  }) {
    const resposta = await this.requisitar('/payments/pix', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return resposta;
  }

  private async autenticar() {
    const resposta = await this.requisitar('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        document: this.configService.getOrThrow<string>('GATEWAY_DOCUMENT'),
        password: this.configService.getOrThrow<string>('GATEWAY_PASSWORD'),
      }),
      autenticar: false,
    });
    const dados = (await resposta.json()) as LoginGatewayResponse;
    const token = dados.access_token ?? dados.token;

    if (!token) {
      throw new ServiceUnavailableException('Gateway não retornou token');
    }

    this.accessToken = token;
  }

  private async requisitar(
    caminho: string,
    opcoes: RequestInit & { autenticar?: boolean },
  ) {
    const baseUrl = this.configService.getOrThrow<string>('GATEWAY_BASE_URL');
    const autenticar = opcoes.autenticar ?? true;
    const headers = new Headers(opcoes.headers);
    headers.set('Content-Type', 'application/json');

    if (autenticar) {
      if (!this.accessToken) {
        await this.autenticar();
      }
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const resposta = await fetch(`${baseUrl}${caminho}`, {
      ...opcoes,
      headers,
    });

    if (resposta.status === 401 && autenticar) {
      this.accessToken = null;
      await this.autenticar();
      headers.set('Authorization', `Bearer ${this.accessToken}`);
      return fetch(`${baseUrl}${caminho}`, { ...opcoes, headers });
    }

    if (!resposta.ok) {
      throw new ServiceUnavailableException(
        `Gateway respondeu HTTP ${resposta.status}`,
      );
    }

    return resposta;
  }
}
