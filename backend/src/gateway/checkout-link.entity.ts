import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('checkout_links')
export class CheckoutLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', length: 36 })
  usuarioId: string;

  @Column({
    name: 'external_reference',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  externalReference: string;

  @Column({
    name: 'gateway_payment_id',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  gatewayPaymentId: string | null;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string | null;

  @Column({ name: 'payer_document', type: 'varchar', length: 32 })
  payerDocument: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  txid: string | null;

  @Column({ type: 'text', nullable: true })
  emv: string | null;

  @Column({ name: 'qr_code_base64', type: 'text', nullable: true })
  qrCodeBase64: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
