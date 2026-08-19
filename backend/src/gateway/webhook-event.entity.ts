import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_key', type: 'varchar', length: 255, unique: true })
  eventKey: string;

  @Column({ type: 'varchar', length: 40 })
  event: string;

  @Column({
    name: 'external_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalReference: string | null;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'text' })
  payload: string;

  @CreateDateColumn({ name: 'recebido_em' })
  recebidoEm: Date;
}
