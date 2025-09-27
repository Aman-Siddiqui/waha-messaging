import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'waha',

  entities: [__dirname + '/../entities/*.entity.ts'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: false,
  logging: true,
});
