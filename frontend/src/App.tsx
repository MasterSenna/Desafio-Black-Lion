import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Usuario = {
  nome: string
  email: string
  cpf?: string
}

type Transacao = {
  id: string
  usuarioId: string
  tipo: 'entrada' | 'saida'
  valor: string
  descricao: string | null
  criadoEm: string
}

type CheckoutPix = {
  status: string
  amount: number
  externalReference: string
  txid: string | null
  emv: string | null
  qrCodeBase64: string | null
}

type Wallet = {
  balance?: number
  availableBalance?: number
  amount?: number
}

type GatewayTransaction = {
  id?: string
  type?: string
  status?: string
  amount?: number
  description?: string
  createdAt?: string
}

type SaqueGateway = {
  id?: string
  status?: string
  amount?: number
  externalReference?: string
}

type Fee = {
  brand?: string
  installments?: number
  feePercent?: number
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
  const [mostrarFormularioTransferencia, setMostrarFormularioTransferencia] = useState(false)
  const [mostrarFormularioPagamento, setMostrarFormularioPagamento] = useState(false)
  const [mostrarFormularioPix, setMostrarFormularioPix] = useState(false)
  const [mostrarFormularioCartao, setMostrarFormularioCartao] = useState(false)
  const [checkoutPix, setCheckoutPix] = useState<CheckoutPix | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transacoesGateway, setTransacoesGateway] = useState<GatewayTransaction[]>([])
  const [mostrarFormularioSaque, setMostrarFormularioSaque] = useState(false)
  const [valorSaque, setValorSaque] = useState('')
  const [chavePixSaque, setChavePixSaque] = useState('')
  const [documentoSaque, setDocumentoSaque] = useState('')
  const [referenciaSaque, setReferenciaSaque] = useState('')
  const [saqueGateway, setSaqueGateway] = useState<SaqueGateway | null>(null)
  const [valorPix, setValorPix] = useState('')
  const [documentoPix, setDocumentoPix] = useState('')
  const [descricaoPix, setDescricaoPix] = useState('')
  const [referenciaPix, setReferenciaPix] = useState('')
  const [valorCartao, setValorCartao] = useState('')
  const [referenciaCartao, setReferenciaCartao] = useState('')
  const [numeroCartao, setNumeroCartao] = useState('')
  const [titularCartao, setTitularCartao] = useState('')
  const [mesValidadeCartao, setMesValidadeCartao] = useState('')
  const [anoValidadeCartao, setAnoValidadeCartao] = useState('')
  const [cvvCartao, setCvvCartao] = useState('')
  const [parcelasCartao, setParcelasCartao] = useState('1')
  const [taxasCartao, setTaxasCartao] = useState<Fee[]>([])
  const [taxaCartao, setTaxaCartao] = useState(0)
  const [resultadoCartao, setResultadoCartao] = useState<{ status?: string; id?: string } | null>(null)
  const [destinatarioEmail, setDestinatarioEmail] = useState('')
  const [valorTransferencia, setValorTransferencia] = useState('')
  const [descricaoTransferencia, setDescricaoTransferencia] = useState('')
  const [valorPagamento, setValorPagamento] = useState('')
  const [descricaoPagamento, setDescricaoPagamento] = useState('')
  const [tipoTransacao, setTipoTransacao] = useState<'entrada' | 'saida'>('entrada')
  const [valorTransacao, setValorTransacao] = useState('')
  const [descricaoTransacao, setDescricaoTransacao] = useState('')
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(false)
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
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
        body: JSON.stringify(modoCadastro ? { nome, cpf: cpf.replace(/\D/g, ''), email, senha } : { email, senha }),
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
    setCpf('')
    setEmail('')
    setSenha('')
    setErro('')
    setSucesso('')
    setTransacoes([])
    setMostrarFormularioTransacao(false)
    setMostrarFormularioTransferencia(false)
    setMostrarFormularioPagamento(false)
    setMostrarFormularioPix(false)
    setMostrarFormularioCartao(false)
    setCheckoutPix(null)
    setResultadoCartao(null)
    setWallet(null)
    setTransacoesGateway([])
    setMostrarFormularioSaque(false)
    setSaqueGateway(null)
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

  useEffect(() => {
    if (!usuario || !telaCarteira) return

    const token = localStorage.getItem('senna-bank-token')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('http://localhost:3000/gateway/wallet', { headers }),
      fetch('http://localhost:3000/gateway/wallet/transactions?limit=20', { headers }),
    ])
      .then(async ([walletResponse, transactionsResponse]) => {
        if (!walletResponse.ok || !transactionsResponse.ok) {
          throw new Error('Não foi possível carregar a carteira do gateway.')
        }
        const walletData = await walletResponse.json() as Wallet
        const transactionsData = await transactionsResponse.json() as GatewayTransaction[] | { data?: GatewayTransaction[] }
        setWallet(walletData)
        setTransacoesGateway(Array.isArray(transactionsData) ? transactionsData : transactionsData.data ?? [])
      })
      .catch((error) => setErro(error instanceof Error ? error.message : 'Não foi possível carregar a carteira.'))
  }, [usuario, telaCarteira])

  useEffect(() => {
    if (!usuario || !mostrarFormularioCartao) return

    const token = localStorage.getItem('senna-bank-token')
    if (!token) return

    fetch('http://localhost:3000/gateway/fees', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error('Não foi possível carregar as taxas do cartão.')
        return resposta.json() as Promise<{ fees?: Fee[] } | Fee[]>
      })
      .then((dados) => {
        const taxas = Array.isArray(dados) ? dados : dados.fees ?? []
        setTaxasCartao(taxas)
        const taxa = taxas.find((item) => item.installments === Number(parcelasCartao))
        setTaxaCartao(taxa?.feePercent ?? 0)
      })
      .catch((error) => setErro(error instanceof Error ? error.message : 'Não foi possível carregar as taxas.'))
  }, [usuario, mostrarFormularioCartao, parcelasCartao])

  async function solicitarSaque(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = localStorage.getItem('senna-bank-token')
    if (!token) return

    setCarregandoTransacoes(true)
    setErro('')
    setSucesso('')
    try {
      const resposta = await fetch('http://localhost:3000/gateway/withdrawals', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(valorSaque),
          pixKey: chavePixSaque,
          document: documentoSaque,
          externalReference: referenciaSaque,
        }),
      })
      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados.message || 'Não foi possível solicitar o saque.')
      setSaqueGateway(dados as SaqueGateway)
      setMostrarFormularioSaque(false)
      setValorSaque('')
      setChavePixSaque('')
      setDocumentoSaque('')
      setReferenciaSaque('')
      setSucesso('Saque solicitado com sucesso.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível solicitar o saque.')
    } finally {
      setCarregandoTransacoes(false)
    }
  }

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

  async function transferir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = localStorage.getItem('senna-bank-token')

    if (!token) {
      return
    }

    setCarregandoTransacoes(true)
    setErro('')

    try {
      const resposta = await fetch('http://localhost:3000/transacoes/transferencias', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinatarioEmail,
          valor: Number(valorTransferencia),
          descricao: descricaoTransferencia,
        }),
      })
      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.message || 'Não foi possível realizar a transferência.')
      }

      setTransacoes((transacoesAtuais) => [dados[0], ...transacoesAtuais])
      setDestinatarioEmail('')
      setValorTransferencia('')
      setDescricaoTransferencia('')
      setMostrarFormularioTransferencia(false)
      setSucesso('Transferência realizada com sucesso.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível realizar a transferência.')
    } finally {
      setCarregandoTransacoes(false)
    }
  }

  async function pagarConta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = localStorage.getItem('senna-bank-token')

    if (!token) {
      return
    }

    setCarregandoTransacoes(true)
    setErro('')
    setSucesso('')

    try {
      const resposta = await fetch('http://localhost:3000/transacoes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'saida',
          valor: Number(valorPagamento),
          descricao: descricaoPagamento,
        }),
      })
      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.message || 'Não foi possível registrar o pagamento.')
      }

      setTransacoes((transacoesAtuais) => [dados, ...transacoesAtuais])
      setValorPagamento('')
      setDescricaoPagamento('')
      setMostrarFormularioPagamento(false)
      setSucesso('Pagamento registrado com sucesso.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível registrar o pagamento.')
    } finally {
      setCarregandoTransacoes(false)
    }
  }

  async function criarCheckoutPix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = localStorage.getItem('senna-bank-token')
    if (!token) return

    setCarregandoTransacoes(true)
    setErro('')
    setSucesso('')

    try {
      const resposta = await fetch('http://localhost:3000/gateway/pix', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(valorPix),
          payerDocument: documentoPix,
          description: descricaoPix,
          externalReference: referenciaPix,
        }),
      })
      const dados = await resposta.json()
      if (!resposta.ok) {
        throw new Error(dados.message || 'Não foi possível criar o checkout Pix.')
      }

      setCheckoutPix(dados)
      setSucesso('Checkout Pix criado com sucesso.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar o checkout Pix.')
    } finally {
      setCarregandoTransacoes(false)
    }
  }

  async function pagarComCartao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = localStorage.getItem('senna-bank-token')
    if (!token) return

    setCarregandoTransacoes(true)
    setErro('')
    setSucesso('')
    try {
      const resposta = await fetch('http://localhost:3000/gateway/card', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(valorCartao),
          externalReference: referenciaCartao,
          cardNumber: numeroCartao,
          cardHolder: titularCartao,
          expiryMonth: mesValidadeCartao,
          expiryYear: anoValidadeCartao,
          cvv: cvvCartao,
          installments: Number(parcelasCartao),
          feePercent: taxaCartao,
        }),
      })
      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados.message || 'Não foi possível processar o cartão.')
      setResultadoCartao(dados)
      setMostrarFormularioCartao(false)
      setSucesso('Pagamento com cartão enviado ao gateway.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível processar o cartão.')
    } finally {
      setCarregandoTransacoes(false)
    }
  }
  const saldoDisponivel = transacoes.reduce(
    (saldo, transacao) => saldo + (transacao.tipo === 'entrada' ? 1 : -1) * Number(transacao.valor),
    0,
  )
  const saldoFormatado = saldoDisponivel.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

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
                <div className="wallet-heading"><div><p className="eyebrow">Saldo gateway</p><h2>{((wallet?.availableBalance ?? wallet?.balance ?? wallet?.amount ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2></div><div><button type="button" onClick={() => setMostrarFormularioSaque((visivel) => !visivel)}>{mostrarFormularioSaque ? 'Fechar saque' : 'Sacar'}</button><button type="button" onClick={() => setMostrarFormularioTransacao((visivel) => !visivel)}>{mostrarFormularioTransacao ? 'Fechar' : 'Nova transação'}</button></div></div>
                {mostrarFormularioSaque && (
                  <form className="transaction-form" onSubmit={solicitarSaque}>
                    <label htmlFor="valor-saque">Valor em centavos</label>
                    <input id="valor-saque" type="number" min="1" step="1" value={valorSaque} onChange={(event) => setValorSaque(event.target.value)} placeholder="15000 = R$ 150,00" required />
                    <label htmlFor="chave-pix-saque">Chave Pix</label>
                    <input id="chave-pix-saque" type="text" value={chavePixSaque} onChange={(event) => setChavePixSaque(event.target.value)} required />
                    <label htmlFor="documento-saque">Documento</label>
                    <input id="documento-saque" type="text" value={documentoSaque} onChange={(event) => setDocumentoSaque(event.target.value)} required />
                    <label htmlFor="referencia-saque">Referência externa</label>
                    <input id="referencia-saque" type="text" value={referenciaSaque} onChange={(event) => setReferenciaSaque(event.target.value)} required />
                    <button className="submit-button" type="submit" disabled={carregandoTransacoes}>{carregandoTransacoes ? 'Solicitando...' : 'Solicitar saque'}<span aria-hidden="true">→</span></button>
                  </form>
                )}
                {saqueGateway && <p className="feedback success">Saque {saqueGateway.status || 'criado'}{saqueGateway.id ? ` · ID: ${saqueGateway.id}` : ''}</p>}
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
                {transacoesGateway.length > 0 && <div className="transaction-list">{transacoesGateway.map((transacao) => <article className="transaction-item" key={transacao.id}><div><strong>{transacao.description || transacao.type || 'Movimentação gateway'}</strong><span>{transacao.status || 'Processando'}</span></div><strong className="amount-out">{((transacao.amount ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></article>)}</div>}
              </section>
            </>
          ) : (
            <>
              <div className="dashboard-intro"><p className="eyebrow">Visão geral</p><h1>Bom dia, {usuario.nome.split(' ')[0]}.</h1><p>Acompanhe sua vida financeira em um só lugar.</p></div>
          <div className="balance-grid">
            <article className="balance-card"><p>Saldo disponível</p><strong>{saldoFormatado}</strong><span>{transacoes.length === 0 ? 'Crie uma transação para atualizar o saldo.' : 'Calculado a partir das suas transações.'}</span></article>
            <article className="quick-actions"><p>Atalhos</p><button type="button" onClick={() => setMostrarFormularioTransferencia((visivel) => !visivel)}>Transferir <span>→</span></button><button type="button" onClick={() => setMostrarFormularioPagamento((visivel) => !visivel)}>Pagar conta <span>→</span></button><button type="button" onClick={() => setMostrarFormularioPix((visivel) => !visivel)}>Cobrar com Pix <span>→</span></button><button type="button" onClick={() => setMostrarFormularioCartao((visivel) => !visivel)}>Pagar com cartão <span>→</span></button><button type="button" onClick={() => setTelaCarteira(true)}>Minha carteira <span>→</span></button></article>
          </div>
          {erro && <p className="feedback error dashboard-feedback">{erro}</p>}
          {sucesso && <p className="feedback success dashboard-feedback">{sucesso}</p>}
          {mostrarFormularioTransferencia && (
            <form className="transfer-form" onSubmit={transferir}>
              <div className="transfer-form-heading"><div><p className="eyebrow">Nova operação</p><h2>Transferir dinheiro</h2></div><button type="button" onClick={() => setMostrarFormularioTransferencia(false)}>Fechar</button></div>
              <label htmlFor="destinatario-email">E-mail do destinatário</label>
              <input id="destinatario-email" type="email" value={destinatarioEmail} onChange={(event) => setDestinatarioEmail(event.target.value)} placeholder="destinatario@exemplo.com" required />
              <label htmlFor="valor-transferencia">Valor</label>
              <input id="valor-transferencia" type="number" min="0.01" step="0.01" value={valorTransferencia} onChange={(event) => setValorTransferencia(event.target.value)} required />
              <label htmlFor="descricao-transferencia">Descrição</label>
              <input id="descricao-transferencia" type="text" maxLength={160} value={descricaoTransferencia} onChange={(event) => setDescricaoTransferencia(event.target.value)} placeholder="Ex.: pagamento" />
              <button className="submit-button" type="submit" disabled={carregandoTransacoes}>{carregandoTransacoes ? 'Transferindo...' : 'Confirmar transferência'}<span aria-hidden="true">→</span></button>
            </form>
          )}
          {mostrarFormularioPagamento && (
            <form className="transfer-form" onSubmit={pagarConta}>
              <div className="transfer-form-heading"><div><p className="eyebrow">Nova operação</p><h2>Pagar conta</h2></div><button type="button" onClick={() => setMostrarFormularioPagamento(false)}>Fechar</button></div>
              <label htmlFor="valor-pagamento">Valor</label>
              <input id="valor-pagamento" type="number" min="0.01" step="0.01" value={valorPagamento} onChange={(event) => setValorPagamento(event.target.value)} required />
              <label htmlFor="descricao-pagamento">Descrição da conta</label>
              <input id="descricao-pagamento" type="text" maxLength={160} value={descricaoPagamento} onChange={(event) => setDescricaoPagamento(event.target.value)} placeholder="Ex.: conta de energia" required />
              <button className="submit-button" type="submit" disabled={carregandoTransacoes}>{carregandoTransacoes ? 'Registrando...' : 'Registrar pagamento'}<span aria-hidden="true">→</span></button>
            </form>
          )}
          {mostrarFormularioPix && (
            <form className="transfer-form" onSubmit={criarCheckoutPix}>
              <div className="transfer-form-heading"><div><p className="eyebrow">Gateway Lera Box</p><h2>Cobrar com Pix</h2></div><button type="button" onClick={() => setMostrarFormularioPix(false)}>Fechar</button></div>
              <label htmlFor="valor-pix">Valor em centavos</label>
              <input id="valor-pix" type="number" min="1" step="1" value={valorPix} onChange={(event) => setValorPix(event.target.value)} placeholder="15000 = R$ 150,00" required />
              <label htmlFor="documento-pix">Documento do pagador</label>
              <input id="documento-pix" type="text" value={documentoPix} onChange={(event) => setDocumentoPix(event.target.value)} required />
              <label htmlFor="descricao-pix">Descrição</label>
              <input id="descricao-pix" type="text" value={descricaoPix} onChange={(event) => setDescricaoPix(event.target.value)} placeholder="Pagamento pedido" />
              <label htmlFor="referencia-pix">Referência externa</label>
              <input id="referencia-pix" type="text" value={referenciaPix} onChange={(event) => setReferenciaPix(event.target.value)} placeholder="PEDIDO-123" required />
              <button className="submit-button" type="submit" disabled={carregandoTransacoes}>{carregandoTransacoes ? 'Gerando...' : 'Gerar QR Code Pix'}<span aria-hidden="true">→</span></button>
            </form>
          )}
          {mostrarFormularioCartao && (
            <form className="transfer-form" onSubmit={pagarComCartao}>
              <div className="transfer-form-heading"><div><p className="eyebrow">Gateway Lera Box</p><h2>Pagar com cartão</h2></div><button type="button" onClick={() => setMostrarFormularioCartao(false)}>Fechar</button></div>
              <label htmlFor="valor-cartao">Valor em centavos</label>
              <input id="valor-cartao" type="number" min="1" step="1" value={valorCartao} onChange={(event) => setValorCartao(event.target.value)} required />
              <label htmlFor="referencia-cartao">Referência externa</label>
              <input id="referencia-cartao" type="text" value={referenciaCartao} onChange={(event) => setReferenciaCartao(event.target.value)} required />
              <label htmlFor="numero-cartao">Número do cartão</label>
              <input id="numero-cartao" type="text" inputMode="numeric" value={numeroCartao} onChange={(event) => setNumeroCartao(event.target.value)} required />
              <label htmlFor="titular-cartao">Titular</label>
              <input id="titular-cartao" type="text" value={titularCartao} onChange={(event) => setTitularCartao(event.target.value)} required />
              <label htmlFor="mes-cartao">Validade (mês/ano)</label>
              <div><input id="mes-cartao" type="text" inputMode="numeric" value={mesValidadeCartao} onChange={(event) => setMesValidadeCartao(event.target.value)} placeholder="12" required /><input aria-label="Ano de validade" type="text" inputMode="numeric" value={anoValidadeCartao} onChange={(event) => setAnoValidadeCartao(event.target.value)} placeholder="2028" required /></div>
              <label htmlFor="cvv-cartao">CVV</label>
              <input id="cvv-cartao" type="password" inputMode="numeric" value={cvvCartao} onChange={(event) => setCvvCartao(event.target.value)} required />
              <label htmlFor="parcelas-cartao">Parcelas</label>
              <select id="parcelas-cartao" value={parcelasCartao} onChange={(event) => setParcelasCartao(event.target.value)}>{(taxasCartao.length ? taxasCartao : [{ installments: 1, feePercent: 0 }]).map((taxa) => <option key={taxa.installments} value={taxa.installments}>{taxa.installments}x · {taxa.feePercent?.toFixed(2).replace('.', ',')}%</option>)}</select>
              <p className="fee-note">Taxa aplicada: {taxaCartao.toFixed(2).replace('.', ',')}%</p>
              <button className="submit-button" type="submit" disabled={carregandoTransacoes}>{carregandoTransacoes ? 'Processando...' : 'Pagar com cartão'}<span aria-hidden="true">→</span></button>
            </form>
          )}
          {resultadoCartao && <p className="feedback success">Cartão: {resultadoCartao.status || 'processado'}{resultadoCartao.id ? ` · ID: ${resultadoCartao.id}` : ''}</p>}
          {checkoutPix && <section className="pix-result"><p className="eyebrow">Checkout Pix</p><h2>Status: {checkoutPix.status}</h2>{checkoutPix.qrCodeBase64 && <img src={checkoutPix.qrCodeBase64} alt="QR Code Pix" />}<label htmlFor="pix-emv">Código copia e cola</label><textarea id="pix-emv" readOnly value={checkoutPix.emv ?? ''} /></section>}
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

              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                type="text"
                value={cpf}
                onChange={(event) => setCpf(event.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="12345678909"
                inputMode="numeric"
                maxLength={11}
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
