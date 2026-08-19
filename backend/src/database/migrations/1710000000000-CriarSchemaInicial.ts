import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarSchemaInicial1710000000000 implements MigrationInterface {
  name = 'CriarSchemaInicial1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '320',
            isUnique: true,
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '120',
          },
          {
            name: 'senha_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'criado_em',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'transacoes',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'usuario_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'tipo',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'valor',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'descricao',
            type: 'varchar',
            length: '160',
            isNullable: true,
          },
          {
            name: 'idempotencia_key',
            type: 'varchar',
            length: '120',
            isNullable: true,
            isUnique: true,
          },
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
    await queryRunner.dropTable('transacoes');
    await queryRunner.dropTable('usuarios');
  }
}
