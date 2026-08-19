import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from './transacao.entity';

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
}
