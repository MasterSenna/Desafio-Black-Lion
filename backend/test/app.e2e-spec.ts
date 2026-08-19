import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type RespostaAutenticacao = {
  token: string;
  usuario: { email: string };
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('cadastra, autentica e consulta transações', async () => {
    const email = `e2e-${Date.now()}@senna.com`;
    const cadastro = await request(app.getHttpServer())
      .post('/autenticacao/cadastro')
      .send({ nome: 'Usuario E2E', email, senha: 'SenhaE2E123' })
      .expect(201);
    const dadosCadastro = cadastro.body as RespostaAutenticacao;

    const resposta = await request(app.getHttpServer())
      .post('/autenticacao/login')
      .send({ email, senha: 'SenhaE2E123' })
      .expect(201);
    const dadosLogin = resposta.body as RespostaAutenticacao;

    await request(app.getHttpServer())
      .get('/transacoes')
      .set('Authorization', `Bearer ${dadosLogin.token}`)
      .expect(200)
      .expect([]);

    expect(dadosCadastro.usuario.email).toBe(email);
  });

  afterEach(async () => {
    await app.close();
  });
});
