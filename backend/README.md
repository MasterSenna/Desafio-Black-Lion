# Senna Bank Backend

API NestJS do Senna Bank, responsavel por autenticacao, carteira e operacoes financeiras.

## Executar

```powershell
npm install
Copy-Item .env.example .env -Force
npm run start:dev
```

O backend inicia em `http://localhost:3000` e a documentacao Swagger fica em `http://localhost:3000/docs`.

O arquivo `.env` deve apontar para um banco MySQL local. Ele e ignorado pelo Git. Em desenvolvimento, `DB_SYNCHRONIZE=true` pode ser usado; em ambientes compartilhados ou produtivos, prefira migrations e `DB_SYNCHRONIZE=false`.

## Migrations

O datasource de migrations fica em `src/database/data-source.ts`. Para conferir migrations pendentes:

```powershell
npm run migration:show
```

Para aplicar migrations em um banco novo ou previamente preparado:

```powershell
$env:DB_SYNCHRONIZE="false"
$env:DB_RUN_MIGRATIONS="true"
npm run migration:run
```

Nao execute a migration inicial diretamente em um banco que ja possui as tabelas `usuarios` e `transacoes` sem fazer primeiro um baseline. Em ambiente de testes, o banco continua sendo `sql.js` em memoria.

## Modulos

- `autenticacao`: cadastro, login, bcrypt e JWT.
- `usuarios`: entidade de usuario.
- `transacoes`: entradas, saidas, saldo, pagamentos e transferencias.
- `comum`: middleware de correlation ID e guard JWT.

## Endpoints financeiros

As rotas protegidas exigem:

```http
Authorization: Bearer SEU_TOKEN
```

- `GET /transacoes`: lista transacoes do usuario autenticado.
- `POST /transacoes`: cria entrada ou saida.
- `POST /transacoes/transferencias`: cria debito e credito atomicos.

Operacoes de escrita aceitam o header opcional `X-Idempotency-Key` para evitar duplicidade em retries.

## Gateway Pix

Para iniciar o onboarding do gateway, use a rota pública:

- `POST /gateway/conta`

Ela encaminha o cadastro para `POST /api/users`. Use e-mail e telefone reais; o gateway envia documento, senha, `CodigoCliente` e `ChaveLoja` por e-mail.

O endpoint BaaS protegido abaixo chama o gateway Lera Box somente pelo backend:

- `POST /gateway/pix`

Payload:

```json
{
	"amount": 15000,
	"payerDocument": "12345678901",
	"description": "Pedido 123",
	"externalReference": "PEDIDO-123"
}
```

`amount` deve ser informado em centavos. Configure `GATEWAY_BASE_URL`, `GATEWAY_DOCUMENT` e `GATEWAY_PASSWORD` no `.env`. O token recebido do gateway permanece somente em memoria no backend e nunca e enviado ao frontend.

## Testes

```powershell
npm run lint
npm test -- --runInBand
npm run test:e2e
npm run build
```

Os testes e2e usam `sql.js` em memoria quando `NODE_ENV=test`, sem alterar o MySQL de desenvolvimento.
