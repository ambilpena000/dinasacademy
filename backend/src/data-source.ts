// data-source.ts — Konfigurasi TypeORM untuk CLI migrasi.
//
//   npm run migration:generate -- src/migrations/NamaPerubahan   (setelah mengubah entity)
//   npm run migration:run                                        (jalankan migrasi tertunda)
//   npm run migration:revert                                     (batalkan migrasi terakhir)
//
// Di production backend menjalankan migrasi tertunda otomatis saat start (migrationsRun).
import * as path from 'path';
import { DataSource } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dinasacademy',
  entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});
