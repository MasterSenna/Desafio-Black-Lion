import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../comum/guards/jwt-auth.guard';
import { CriarPixDto } from './dto/criar-pix.dto';
import { GatewayService } from './gateway.service';

type RequisicaoAutenticada = Request & {
  user: { sub: string };
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
      ...dto,
      externalReference: `${request.user.sub}:${dto.externalReference}`,
    });
  }
}
