import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { TransacoesModule } from './transacoes/transacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ambiente = configService.get<string>('NODE_ENV');

        if (ambiente === 'test') {
          return {
            type: 'sqljs' as const,
            autoLoadEntities: true,
            synchronize: true,
            migrationsRun: false,
          };
        }

        return {
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize:
            ambiente === 'development' &&
            configService.get<string>('DB_SYNCHRONIZE') === 'true',
          migrationsRun:
            configService.get<string>('DB_RUN_MIGRATIONS') === 'true',
          retryAttempts: 1,
        };
      },
    }),
    AutenticacaoModule,
    TransacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
