import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutenticacaoModule } from '../autenticacao/autenticacao.module';
import { GatewayClient } from './gateway.client';
import {
  GatewayController,
  GatewayOnboardingController,
} from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [ConfigModule, AutenticacaoModule],
  controllers: [GatewayController, GatewayOnboardingController],
  providers: [GatewayClient, GatewayService],
})
export class GatewayModule {}
