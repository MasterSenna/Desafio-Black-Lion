import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from './transacao.entity';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';

@Injectable()
export class TransacoesService {
  constructor(
    @InjectRepository(Transacao)
    private readonly transacoesRepository: Repository<Transacao>,
  ) {}

  listarPorUsuario(usuarioId: string) {
    return this.transacoesRepository.find({
      where: { usuarioId },
      order: { criadoEm: 'DESC' },
    });
  }

  criar(usuarioId: string, dto: CriarTransacaoDto) {
    const transacao = this.transacoesRepository.create({
      usuarioId,
      tipo: dto.tipo,
      valor: dto.valor.toFixed(2),
      descricao: dto.descricao?.trim() || null,
    });

    return this.transacoesRepository.save(transacao);
  }
}
