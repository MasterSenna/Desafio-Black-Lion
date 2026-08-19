import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../comum/guards/jwt-auth.guard';
import { TransacoesService } from './transacoes.service';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';
import { CriarTransferenciaDto } from './dto/criar-transferencia.dto';

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
  criar(
    @Req() request: RequisicaoAutenticada,
    @Headers('x-idempotency-key') idempotenciaKey: string | undefined,
    @Body() dto: CriarTransacaoDto,
  ) {
    return this.transacoesService.criar(request.user.sub, dto, idempotenciaKey);
  }

  @Post('transferencias')
  transferir(
    @Req() request: RequisicaoAutenticada,
    @Headers('x-idempotency-key') idempotenciaKey: string | undefined,
    @Body() dto: CriarTransferenciaDto,
  ) {
    return this.transacoesService.transferir(
      request.user.sub,
      dto,
      idempotenciaKey,
    );
  }
}
