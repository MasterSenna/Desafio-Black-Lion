import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarCheckoutLinks1710000001000 implements MigrationInterface {
  name = 'CriarCheckoutLinks1710000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'checkout_links',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'usuario_id', type: 'varchar', length: '36' },
          {
            name: 'external_reference',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'gateway_payment_id',
            type: 'varchar',
            length: '80',
            isNullable: true,
          },
          { name: 'status', type: 'varchar', length: '20' },
          { name: 'amount', type: 'int' },
          {
            name: 'description',
            type: 'varchar',
            length: '160',
            isNullable: true,
          },
          { name: 'payer_document', type: 'varchar', length: '32' },
          { name: 'txid', type: 'varchar', length: '120', isNullable: true },
          { name: 'emv', type: 'text', isNullable: true },
          { name: 'qr_code_base64', type: 'text', isNullable: true },
          {
            name: 'criado_em',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('checkout_links');
  }
}
