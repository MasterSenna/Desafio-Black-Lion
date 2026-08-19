import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Usuario = {
  nome: string
  email: string
}

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: string
  descricao: string | null
  criadoEm: string
}

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioSalvo = localStorage.getItem('senna-bank-usuario')
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null
  })
  const [modoCadastro, setModoCadastro] = useState(false)
  const [telaCarteira, setTelaCarteira] = useState(false)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [mostrarFormularioTransacao, setMostrarFormularioTransacao] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<'entrada' | 'saida'>('entrada')
  const [valorTransacao, setValorTransacao] = useState('')
  const [descricaoTransacao, setDescricaoTransacao] = useState('')
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(false)
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
    setTransacoes([])
    setMostrarFormularioTransacao(false)
  }

  function alternarModo() {
    setModoCadastro((modoAtual) => !modoAtual)
    setErro('')
    setSucesso('')
  }

  useEffect(() => {
    if (!usuario) {
      return
    }

    const token = localStorage.getItem('senna-bank-token')
    if (!token) {
      return
    }

    fetch('http://localhost:3000/transacoes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (resposta) => {
        if (!resposta.ok) {
          throw new Error('Não foi possível carregar as transações.')
        }
        return resposta.json() as Promise<Transacao[]>
      })
      .then(setTransacoes)
      .catch(() => setTransacoes([]))
      .finally(() => setCarregandoTransacoes(false))
  }, [usuario])

  async function criarTransacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = localStorage.getItem('senna-bank-token')

    if (!token) {
      return
    }

    setCarregandoTransacoes(true)

    try {
      const resposta = await fetch('http://localhost:3000/transacoes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: tipoTransacao,
          valor: Number(valorTransacao),
          descricao: descricaoTransacao,
        }),
      })

      const dados = await resposta.json()
      if (!resposta.ok) {
        throw new Error(dados.message || 'Não foi possível criar a transação.')
      }

      setTransacoes((transacoesAtuais) => [dados, ...transacoesAtuais])
      setValorTransacao('')
      setDescricaoTransacao('')
      setMostrarFormularioTransacao(false)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar a transação.')
    } finally {
      setCarregandoTransacoes(false)
    }
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
              <section className="wallet-placeholder">
                <div className="wallet-heading"><div><p className="eyebrow">Movimentações</p><h2>Transações da carteira</h2></div><button type="button" onClick={() => setMostrarFormularioTransacao((visivel) => !visivel)}>{mostrarFormularioTransacao ? 'Fechar' : 'Nova transação'}</button></div>
                {mostrarFormularioTransacao && (
                  <form className="transaction-form" onSubmit={criarTransacao}>
                    <label htmlFor="tipo-transacao">Tipo</label>
                    <select id="tipo-transacao" value={tipoTransacao} onChange={(event) => setTipoTransacao(event.target.value as 'entrada' | 'saida')}>
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                    </select>
                    <label htmlFor="valor-transacao">Valor</label>
                    <input id="valor-transacao" type="number" min="0.01" step="0.01" value={valorTransacao} onChange={(event) => setValorTransacao(event.target.value)} required />
                    <label htmlFor="descricao-transacao">Descrição</label>
                    <input id="descricao-transacao" type="text" maxLength={160} value={descricaoTransacao} onChange={(event) => setDescricaoTransacao(event.target.value)} placeholder="Ex.: aporte inicial" />
                    <button className="submit-button" type="submit" disabled={carregandoTransacoes}>{carregandoTransacoes ? 'Salvando...' : 'Salvar transação'}<span aria-hidden="true">→</span></button>
                  </form>
                )}
                {transacoes.length === 0 && !carregandoTransacoes && <p className="empty-state">Você ainda não possui transações.</p>}
                {transacoes.length > 0 && <div className="transaction-list">{transacoes.map((transacao) => <article className="transaction-item" key={transacao.id}><div><strong>{transacao.descricao || (transacao.tipo === 'entrada' ? 'Entrada' : 'Saída')}</strong><span>{new Date(transacao.criadoEm).toLocaleDateString('pt-BR')}</span></div><strong className={transacao.tipo === 'entrada' ? 'amount-in' : 'amount-out'}>{transacao.tipo === 'entrada' ? '+' : '-'} R$ {Number(transacao.valor).toFixed(2).replace('.', ',')}</strong></article>)}</div>}
              </section>
            </>
          ) : (
            <>
              <div className="dashboard-intro"><p className="eyebrow">Visão geral</p><h1>Bom dia, {usuario.nome.split(' ')[0]}.</h1><p>Acompanhe sua vida financeira em um só lugar.</p></div>
          <div className="balance-grid">
            <article className="balance-card"><p>Saldo disponível</p><strong>R$ 0,00</strong><span>Dados financeiros serão conectados em breve.</span></article>
            <article className="quick-actions"><p>Atalhos</p><button type="button">Transferir <span>→</span></button><button type="button">Pagar conta <span>→</span></button><button type="button" onClick={() => setTelaCarteira(true)}>Minha carteira <span>→</span></button></article>
          </div>
          <section className="transactions-section"><div><p className="eyebrow">Movimentações</p><h2>Últimas transações</h2></div>{transacoes.length === 0 ? <p className="empty-state">Você ainda não possui transações.</p> : <div className="transaction-list">{transacoes.slice(0, 3).map((transacao) => <article className="transaction-item" key={transacao.id}><div><strong>{transacao.descricao || transacao.tipo}</strong><span>{new Date(transacao.criadoEm).toLocaleDateString('pt-BR')}</span></div><strong className={transacao.tipo === 'entrada' ? 'amount-in' : 'amount-out'}>{transacao.tipo === 'entrada' ? '+' : '-'} R$ {Number(transacao.valor).toFixed(2).replace('.', ',')}</strong></article>)}</div>}</section>
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
