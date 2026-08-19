import {
  Body,
  Controller,
  Headers as NestHeaders,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../comum/guards/jwt-auth.guard';
import { CriarPixDto } from './dto/criar-pix.dto';
import { GatewayService } from './gateway.service';
import { CriarContaGatewayDto } from './dto/criar-conta-gateway.dto';

type RequisicaoAutenticada = Request & {
  user: { sub: string };
};

type RequisicaoWebhook = Request & {
  rawBody?: Buffer;
};

@ApiTags('gateway')
@ApiBearerAuth()
@Controller('gateway')
@UseGuards(JwtAuthGuard)
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('pix')
  criarPix(@Req() request: RequisicaoAutenticada, @Body() dto: CriarPixDto) {
    return this.gatewayService.criarPagamentoPix({
      usuarioId: request.user.sub,
      ...dto,
      externalReference: `${request.user.sub}:${dto.externalReference}`,
    });
  }
}

@ApiTags('gateway')
@Controller('gateway')
export class GatewayOnboardingController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('conta')
  criarConta(@Body() dto: CriarContaGatewayDto) {
    return this.gatewayService.criarConta(dto);
  }
}

@ApiTags('webhooks')
@Controller('webhooks/lera-box')
export class GatewayWebhookController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('pix')
  processarPix(
    @Req() request: RequisicaoWebhook,
    @NestHeaders('x-lera-box-signature') assinatura: string | undefined,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.gatewayService.processarWebhookPix(
      assinatura,
      request.rawBody ?? Buffer.from(JSON.stringify(payload)),
      payload,
    );
  }
}
