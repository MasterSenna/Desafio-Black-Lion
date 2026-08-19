import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutenticacaoModule } from '../autenticacao/autenticacao.module';
import { GatewayClient } from './gateway.client';
import {
  GatewayController,
  GatewayOnboardingController,
  GatewayWebhookController,
} from './gateway.controller';
import { GatewayService } from './gateway.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutLink } from './checkout-link.entity';
import { WebhookEvent } from './webhook-event.entity';

@Module({
  imports: [
    ConfigModule,
    AutenticacaoModule,
    TypeOrmModule.forFeature([CheckoutLink, WebhookEvent]),
  ],
  controllers: [
    GatewayController,
    GatewayOnboardingController,
    GatewayWebhookController,
  ],
  providers: [GatewayClient, GatewayService],
})
export class GatewayModule {}
