# Senna Bank Frontend

Aplicacao React/Vite do Senna Bank.

## Executar

```powershell
npm install
npm run dev
```

O Vite inicia normalmente em `http://localhost:5173`. O backend precisa estar ativo em `http://localhost:3000`.

## Fluxos atuais

- Cadastro e login pela API real.
- JWT e dados publicos do usuario no `localStorage`.
- Dashboard autenticado com logout.
- Carteira com saldo calculado por entradas menos saidas.
- Criacao de transacoes e pagamentos.
- Transferencia entre usuarios por e-mail.
- Lista de movimentacoes e mensagens de erro/sucesso.

## Validacao

```powershell
npm run lint
npm run build
```

O frontend nao acessa o banco diretamente. Toda operacao financeira passa pela API NestJS.
