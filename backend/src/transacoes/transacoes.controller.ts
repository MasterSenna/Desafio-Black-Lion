import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../comum/guards/jwt-auth.guard';
import { TransacoesService } from './transacoes.service';

type RequisicaoAutenticada = Request & {
  user: { sub: string };
};

@ApiTags('transacoes')
@ApiBearerAuth()
@Controller('transacoes')
@UseGuards(JwtAuthGuard)
export class TransacoesController {
  constructor(private readonly transacoesService: TransacoesService) {}

  @Get()
  listar(@Req() request: RequisicaoAutenticada) {
    return this.transacoesService.listarPorUsuario(request.user.sub);
  }
}
