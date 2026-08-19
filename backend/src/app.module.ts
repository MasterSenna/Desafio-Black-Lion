import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { TransacoesModule } from './transacoes/transacoes.module';

const configuracaoBanco =
  process.env.NODE_ENV === 'test'
    ? {
        type: 'sqljs' as const,
        autoLoadEntities: true,
        synchronize: true,
      }
    : {
        type: 'mysql' as const,
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        synchronize:
          process.env.NODE_ENV === 'development' &&
          process.env.DB_SYNCHRONIZE === 'true',
        retryAttempts: 1,
      };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRoot(configuracaoBanco),
    AutenticacaoModule,
    TransacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
