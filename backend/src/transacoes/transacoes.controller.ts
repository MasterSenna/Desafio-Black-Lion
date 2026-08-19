import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../comum/guards/jwt-auth.guard';
import { TransacoesService } from './transacoes.service';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';

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

  @Post()
  criar(@Req() request: RequisicaoAutenticada, @Body() dto: CriarTransacaoDto) {
    return this.transacoesService.criar(request.user.sub, dto);
  }
}
