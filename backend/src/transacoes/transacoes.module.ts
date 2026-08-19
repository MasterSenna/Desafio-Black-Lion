import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoModule } from '../autenticacao/autenticacao.module';
import { Transacao } from './transacao.entity';
import { TransacoesController } from './transacoes.controller';
import { TransacoesService } from './transacoes.service';

@Module({
  imports: [AutenticacaoModule, TypeOrmModule.forFeature([Transacao])],
  controllers: [TransacoesController],
  providers: [TransacoesService],
})
export class TransacoesModule {}
