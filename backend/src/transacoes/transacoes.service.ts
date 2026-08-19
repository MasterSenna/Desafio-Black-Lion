import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transacao } from './transacao.entity';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';
import { CriarTransferenciaDto } from './dto/criar-transferencia.dto';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class TransacoesService {
  constructor(
    @InjectRepository(Transacao)
    private readonly transacoesRepository: Repository<Transacao>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  listarPorUsuario(usuarioId: string) {
    return this.transacoesRepository.find({
      where: { usuarioId },
      order: { criadoEm: 'DESC' },
    });
  }

  async criar(usuarioId: string, dto: CriarTransacaoDto) {
    if (dto.tipo === 'saida') {
      const saldo = await this.obterSaldo(usuarioId);

      if (saldo < dto.valor) {
        throw new BadRequestException('Saldo insuficiente');
      }
    }

    const transacao = this.transacoesRepository.create({
      usuarioId,
      tipo: dto.tipo,
      valor: dto.valor.toFixed(2),
      descricao: dto.descricao?.trim() || null,
    });

    return this.transacoesRepository.save(transacao);
  }

  private async obterSaldo(usuarioId: string) {
    const saldo = await this.transacoesRepository
      .createQueryBuilder('transacao')
      .select(
        `COALESCE(SUM(CASE WHEN transacao.tipo = 'entrada' THEN transacao.valor ELSE -transacao.valor END), 0)`,
        'saldo',
      )
      .where('transacao.usuarioId = :usuarioId', { usuarioId })
      .getRawOne<{ saldo: string }>();

    return Number(saldo?.saldo ?? 0);
  }

  async transferir(usuarioId: string, dto: CriarTransferenciaDto) {
    const destinatarioEmail = dto.destinatarioEmail.trim().toLowerCase();
    const destinatario = await this.usuariosRepository.findOne({
      where: { email: destinatarioEmail },
    });

    if (!destinatario) {
      throw new NotFoundException('Destinatário não encontrado');
    }

    if (destinatario.id === usuarioId) {
      throw new ConflictException(
        'Não é possível transferir para a própria conta',
      );
    }

    const valor = dto.valor.toFixed(2);

    if ((await this.obterSaldo(usuarioId)) < dto.valor) {
      throw new BadRequestException('Saldo insuficiente');
    }

    return this.dataSource.transaction(async (entityManager) => {
      const transacaoSaida = entityManager.create(Transacao, {
        usuarioId,
        tipo: 'saida',
        valor,
        descricao:
          dto.descricao?.trim() || `Transferência para ${destinatario.email}`,
      });
      const transacaoEntrada = entityManager.create(Transacao, {
        usuarioId: destinatario.id,
        tipo: 'entrada',
        valor,
        descricao:
          dto.descricao?.trim() ||
          `Transferência recebida de ${destinatario.email}`,
      });

      return entityManager.save([transacaoSaida, transacaoEntrada]);
    });
  }
}
