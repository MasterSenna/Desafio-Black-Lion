import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AmpliarDocumentoUsuario1710000003000 implements MigrationInterface {
  name = 'AmpliarDocumentoUsuario1710000003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'usuarios',
      'cpf',
      new TableColumn({
        name: 'cpf',
        type: 'varchar',
        length: '14',
        isUnique: true,
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'usuarios',
      'cpf',
      new TableColumn({
        name: 'cpf',
        type: 'varchar',
        length: '11',
        isUnique: true,
        isNullable: true,
      }),
    );
  }
}
