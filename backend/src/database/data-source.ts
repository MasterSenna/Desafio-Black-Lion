import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Transacao } from '../transacoes/transacao.entity';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Usuario, Transacao],
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
