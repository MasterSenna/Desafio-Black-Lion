import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Usuario = {
  nome: string
  email: string
}

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioSalvo = localStorage.getItem('senna-bank-usuario')
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null
  })
  const [modoCadastro, setModoCadastro] = useState(false)
  const [telaCarteira, setTelaCarteira] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function autenticar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCarregando(true)
    setErro('')
    setSucesso('')

    try {
      const resposta = await fetch(`http://localhost:3000/autenticacao/${modoCadastro ? 'cadastro' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modoCadastro ? { nome, email, senha } : { email, senha }),
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.message || (modoCadastro ? 'Não foi possível criar a conta.' : 'Não foi possível entrar na conta.'))
      }

      localStorage.setItem('senna-bank-token', dados.token)
      localStorage.setItem('senna-bank-usuario', JSON.stringify(dados.usuario))
      setUsuario(dados.usuario)
      setSucesso(modoCadastro ? 'Conta criada com sucesso.' : `Bem-vindo, ${dados.usuario.nome}.`)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao conectar com a API.')
    } finally {
      setCarregando(false)
    }
  }

  function sair() {
    localStorage.removeItem('senna-bank-token')
    localStorage.removeItem('senna-bank-usuario')
    setUsuario(null)
    setModoCadastro(false)
    setNome('')
    setEmail('')
    setSenha('')
    setErro('')
    setSucesso('')
  }

  function alternarModo() {
    setModoCadastro((modoAtual) => !modoAtual)
    setErro('')
    setSucesso('')
  }

  if (usuario) {
    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-brand"><span className="brand-mark small">S</span><strong>Senna Bank</strong></div>
          <div className="user-actions"><span>{usuario.nome}</span><button type="button" onClick={sair}>Sair</button></div>
        </header>
        <section className="dashboard-content">
          {telaCarteira ? (
            <>
              <button className="back-button" type="button" onClick={() => setTelaCarteira(false)}>← Voltar para visão geral</button>
              <div className="dashboard-intro"><p className="eyebrow">Carteira</p><h1>Sua carteira.</h1><p>Organize seus recursos financeiros em um só lugar.</p></div>
              <section className="wallet-placeholder"><p className="eyebrow">Em preparação</p><h2>Carteira ainda sem movimentações</h2><p>O saldo e as transações aparecerão aqui quando a integração financeira estiver disponível.</p></section>
            </>
          ) : (
            <>
              <div className="dashboard-intro"><p className="eyebrow">Visão geral</p><h1>Bom dia, {usuario.nome.split(' ')[0]}.</h1><p>Acompanhe sua vida financeira em um só lugar.</p></div>
          <div className="balance-grid">
            <article className="balance-card"><p>Saldo disponível</p><strong>R$ 0,00</strong><span>Dados financeiros serão conectados em breve.</span></article>
            <article className="quick-actions"><p>Atalhos</p><button type="button">Transferir <span>→</span></button><button type="button">Pagar conta <span>→</span></button><button type="button" onClick={() => setTelaCarteira(true)}>Minha carteira <span>→</span></button></article>
          </div>
          <section className="transactions-section"><div><p className="eyebrow">Movimentações</p><h2>Últimas transações</h2></div><p className="empty-state">Você ainda não possui transações.</p></section>
            </>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="login-page">
      <section className="brand-panel">
        <div className="brand-mark" aria-hidden="true">S</div>
        <p className="eyebrow">Senna Bank</p>
        <h1>Seu dinheiro, no seu ritmo.</h1>
        <p className="brand-description">Uma experiência financeira simples, segura e feita para acompanhar suas decisões.</p>
        <span className="panel-line" aria-hidden="true" />
        <p className="panel-caption">Banking as a Service</p>
      </section>

      <section className="form-panel">
        <div className="form-heading">
          <p className="eyebrow">Acesso à conta</p>
          <h2>{modoCadastro ? 'Crie sua conta Senna.' : 'Olá, que bom ver você.'}</h2>
          <p>{modoCadastro ? 'Comece sua jornada financeira com a gente.' : 'Entre para continuar sua jornada financeira.'}</p>
        </div>

        <form onSubmit={autenticar}>
          {modoCadastro && (
            <>
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Felipe Senna"
                autoComplete="name"
                required
              />
            </>
          )}

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
          />

          <div className="password-label">
            <label htmlFor="senha">Senha</label>
            <button type="button" className="forgot-password">Esqueci minha senha</button>
          </div>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Digite sua senha"
            autoComplete={modoCadastro ? 'new-password' : 'current-password'}
            required
          />

          {erro && <p className="feedback error">{erro}</p>}
          {sucesso && <p className="feedback success">{sucesso}</p>}

          <button className="submit-button" type="submit" disabled={carregando}>
            {carregando ? (modoCadastro ? 'Criando...' : 'Entrando...') : (modoCadastro ? 'Criar conta' : 'Entrar')}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="form-footer">
          {modoCadastro ? 'Já possui uma conta?' : 'Ainda não possui uma conta?'}
          <button type="button" onClick={alternarModo}>{modoCadastro ? 'Entrar' : 'Criar cadastro'}</button>
        </p>
      </section>
    </main>
  )
}

export default App
