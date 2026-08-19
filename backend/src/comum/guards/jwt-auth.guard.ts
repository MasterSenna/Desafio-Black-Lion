import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

type PayloadJwt = {
  sub: string;
  email: string;
};

type RequisicaoAutenticada = Request & {
  user: PayloadJwt;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequisicaoAutenticada>();
    const token = this.extrairToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso não informado');
    }

    try {
      request.user = await this.jwtService.verifyAsync<PayloadJwt>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token de acesso inválido');
    }
  }

  private extrairToken(request: Request) {
    const cabecalho = request.headers.authorization;

    if (!cabecalho?.startsWith('Bearer ')) {
      return undefined;
    }

    return cabecalho.slice(7);
  }
}
