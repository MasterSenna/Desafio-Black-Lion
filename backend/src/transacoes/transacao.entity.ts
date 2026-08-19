import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transacoes')
export class Transacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', length: 36 })
  usuarioId: string;

  @Column({ length: 20 })
  tipo: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  descricao: string | null;

  @Column({
    name: 'idempotencia_key',
    type: 'varchar',
    length: 120,
    nullable: true,
    unique: true,
  })
  idempotenciaKey: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
