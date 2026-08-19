import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarWebhookEvents1710000002000 implements MigrationInterface {
  name = 'CriarWebhookEvents1710000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'webhook_events',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'event_key', type: 'varchar', length: '255', isUnique: true },
          { name: 'event', type: 'varchar', length: '40' },
          {
            name: 'external_reference',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'status', type: 'varchar', length: '20' },
          { name: 'payload', type: 'text' },
          {
            name: 'recebido_em',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhook_events');
  }
}
