# Senna Bank

Banking as a Service (BaaS) em desenvolvimento, criado com NestJS no backend e React/Vite no frontend.

## Objetivo

Construir uma plataforma financeira modular com autenticação de usuários, carteira, transações, pagamentos e integrações com gateways externos.

## Arquitetura atual

```text
senna-bank/
├── backend/                 API NestJS
│   └── src/
│       ├── autenticacao/    Cadastro e login
│       ├── usuarios/        Entidade de usuário
│       └── comum/           Middlewares e recursos compartilhados
├── frontend/                Aplicação React/Vite autenticada
├── docker-compose.yml       MySQL para ambientes com Docker
└── README.md                Documentação do projeto
```

### Backend

- NestJS 11 com TypeScript em modo estrito.
- Configuração centralizada com `@nestjs/config`.
- TypeORM conectado ao MySQL 8.
- Swagger disponível em `/docs`.
- Validação global com `ValidationPipe`.
- JWT para autenticação.
- bcrypt com 12 rounds para hash de senhas.
- Middleware de `X-Correlation-Id` para rastreamento de requisições.

### Frontend

- React 18 com Vite.
- ESLint configurado.
- Estrutura inicial criada e build de produção validado.
- Integração com a API real de autenticação e transações.
- Dashboard, carteira, saldo, pagamentos e transferências.

## Funcionalidades concluídas

- Estrutura inicial do backend e frontend.
- Configuração do ambiente de desenvolvimento.
- ConfigModule global.
- Conexão do NestJS com MySQL via TypeORM.
- Entidade `Usuario` com:
  - UUID como chave primária.
  - E-mail único.
  - Nome.
  - Hash da senha não selecionado por padrão.
  - Data de criação.
- Cadastro de usuário em `POST /autenticacao/cadastro`.
- Login em `POST /autenticacao/login`.
- Geração de token JWT.
- Validação de senha com bcrypt.
- Documentação automática com Swagger.
- Validação e transformação dos DTOs.
- Identificador de correlação nas respostas HTTP.
- Testes manuais de cadastro e login pelo Swagger.
- Dashboard autenticado com persistência do JWT no `localStorage`.
- Consulta e criação de transações autenticadas.
- Saldo calculado como entradas menos saídas.
- Pagamentos registrados como saídas com validação de saldo.
- Transferências atômicas entre usuários.
- `X-Idempotency-Key` opcional para evitar operações duplicadas.
- Testes unitários de transferências, saldo e idempotência.
- Primeiro fluxo de branches e Pull Request concluído.

## Endpoints atuais

### Cadastro

`POST http://localhost:3000/autenticacao/cadastro`

```json
{
  "nome": "Felipe Senna",
  "email": "felipe@senna.com",
  "senha": "Senha123"
}
```

A resposta contém o token JWT e os dados públicos do usuário.

### Login

`POST http://localhost:3000/autenticacao/login`

```json
{
  "email": "felipe@senna.com",
  "senha": "Senha123"
}
```

A resposta contém um novo token JWT e os dados públicos do usuário.

### Transações

As rotas abaixo exigem o header:

```http
Authorization: Bearer SEU_TOKEN
```

Consultar transações:

`GET http://localhost:3000/transacoes`

Criar uma entrada ou saída:

`POST http://localhost:3000/transacoes`

```json
{
  "tipo": "entrada",
  "valor": 100,
  "descricao": "Aporte inicial"
}
```

Para saídas, o backend valida o saldo disponível.

### Transferências

`POST http://localhost:3000/transacoes/transferencias`

```json
{
  "destinatarioEmail": "destino@senna.com",
  "valor": 25.5,
  "descricao": "Pagamento"
}
```

O endpoint grava o débito e o crédito de forma atômica. Transferências para a própria conta, destinatários inexistentes e valores acima do saldo são rejeitados.

Para operações que possam ser repetidas pelo cliente, envie uma chave opcional:

```http
X-Idempotency-Key: operacao-123
```

Uma mesma chave não cria uma segunda operação para o mesmo usuário.

## Validação

Backend:

```powershell
cd backend
npm run lint
npm test -- --runInBand
npm run build
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## Configuração local

### Pré-requisitos

- Node.js 20 ou superior.
- MySQL 8 instalado e em execução.
- npm.

Docker também é suportado pelo arquivo `docker-compose.yml`, mas durante esta etapa o ambiente foi executado com o MySQL instalado diretamente no Windows.

### Banco de dados

No MySQL Workbench, conectado como `root`, foram criados o banco e o usuário da aplicação:

```sql
CREATE DATABASE IF NOT EXISTS senna_bank;

CREATE USER IF NOT EXISTS 'senna_bank'@'localhost'
IDENTIFIED BY 'senna_bank_dev';

ALTER USER 'senna_bank'@'localhost'
IDENTIFIED BY 'senna_bank_dev';

GRANT ALL PRIVILEGES ON senna_bank.*
TO 'senna_bank'@'localhost';

FLUSH PRIVILEGES;
```

O arquivo `backend/.env` deve ser criado a partir de `backend/.env.example`. Ele é local e não deve ser versionado:

```powershell
cd backend
Copy-Item .env.example .env -Force
```

A configuração esperada para o banco é:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=senna_bank
DB_PASSWORD=senna_bank_dev
DB_DATABASE=senna_bank
DB_SYNCHRONIZE=true
```

Em produção, `DB_SYNCHRONIZE` deve permanecer desativado e as credenciais devem ser fornecidas por um gerenciador de segredos.

### Executar o backend

```powershell
cd backend
npm install
npm run start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

### Executar o frontend

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

O Vite normalmente inicia em http://localhost:5173.

## Desafios encontrados e soluções

### 1. Repositório inicialmente vazio

Foi necessário estabelecer a estrutura do backend e frontend, instalar as dependências e validar os builds iniciais.

### 2. Docker indisponível

O projeto possui `docker-compose.yml`, mas o Docker não estava disponível no ambiente. A alternativa foi usar o serviço MySQL 8 instalado no Windows.

### 3. Senha do root do MySQL esquecida

As primeiras tentativas de alteração pela linha de comando falharam por causa da interpretação de caracteres especiais pelo PowerShell. A senha foi redefinida pelo MySQL Workbench usando:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NovaSenha123';
FLUSH PRIVILEGES;
```

### 4. Usuário da aplicação sem a senha correta

O backend inicialmente retornou:

```text
Access denied for user 'senna_bank'@'localhost' (using password: YES)
```

A senha do usuário foi alinhada com o `backend/.env` usando `ALTER USER`.

### 5. Usuário sem permissão no banco

Depois da correção da senha, o erro mudou para:

```text
Access denied for user 'senna_bank'@'localhost' to database 'senna_bank'
```

A causa era a ausência do privilégio no schema. O comando aplicado foi:

```sql
GRANT ALL PRIVILEGES ON senna_bank.*
TO 'senna_bank'@'localhost';
```

O `SHOW GRANTS` confirmou as permissões `USAGE` e `ALL PRIVILEGES` no banco `senna_bank`.

### 6. Swagger em branco e crash ao finalizar a resposta

A API iniciava, mas uma requisição provocava o erro:

```text
TypeError: Cannot read properties of undefined (reading 'logger')
```

A causa estava em `main.ts`, onde o método do middleware era passado como referência:

```ts
app.use(new CorrelationIdMiddleware().use);
```

O método perdia o contexto da classe e `this.logger` ficava indefinido. A correção foi transformar `use` em uma arrow function na classe, preservando o contexto da instância.

### 7. Comando de build executado no diretório errado

Um terminal persistente executou `npm run build` em outro projeto e chamou o Angular CLI. Executando explicitamente dentro de `backend`, o comando correto foi usado:

```powershell
Set-Location 'F:\desafio-black-lion\senna-bank\backend'
npm run build
```

O build do NestJS passou com sucesso.

## Validações realizadas

- Backend compilado com `npm run build`.
- Conexão com MySQL validada pelo TypeORM.
- Swagger carregado em `/docs`.
- Cadastro validado com resposta `201`.
- Login validado com resposta `201`.
- Token JWT gerado no cadastro e no login.
- Senha validada com bcrypt.
- `X-Correlation-Id` retornado nas respostas.
- Working tree limpo após o commit.

## Git e Pull Request

O fluxo adotado foi baseado em branches de funcionalidade/correção e integração em `develop`.

Nesta etapa:

- Correção criada no commit `1200828`.
- Branch de correção: `fix/correlation-id-context`.
- PR integrado em `develop`.
- A branch antiga `feature/configuracao-inicial` foi mantida intacta.

Para as próximas branches, usar nomes em português, por exemplo:

```text
funcionalidade/tela-inicial
funcionalidade/dashboard
correcao/autenticacao
melhoria/extrato-transacoes
```

## Próximas etapas

1. Criar a branch `funcionalidade/tela-inicial`.
2. Desenvolver a tela de login no frontend.
3. Conectar o formulário ao endpoint de login.
4. Armazenar o token de forma adequada no frontend.
5. Criar dashboard autenticado.
6. Implementar carteira e histórico de transações.
7. Implementar Pix, cartão, saques e cálculo de taxas.
8. Criar guards JWT e endpoints protegidos.
9. Adicionar testes unitários, integração e e2e.
10. Configurar migrations, observabilidade e deploy.

## Segurança e pendências

- Não versionar `backend/.env`.
- Substituir `JWT_SECRET=change-me-in-a-secret-manager` por um segredo forte fora do código.
- Desativar `DB_SYNCHRONIZE` em produção.
- Implementar expiração e renovação de tokens.
- Adicionar rate limiting para autenticação.
- Adicionar testes automatizados para cadastro, login e casos de erro.
- Não usar senhas reais em exemplos públicos.
