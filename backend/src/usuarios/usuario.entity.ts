import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 320 })
  email: string;

  @Column({ length: 120 })
  nome: string;

  @Column({
    name: 'cpf',
    type: 'varchar',
    length: 11,
    unique: true,
    nullable: true,
  })
  cpf: string | null;

  @Column({ name: 'senha_hash', select: false })
  senhaHash: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
