/**
 * seed-admin.ts
 * Jalankan SEKALI untuk membuat akun admin di database:
 *   npx ts-node src/seed-admin.ts
 *
 * Setelah dijalankan, login admin menggunakan:
 *   Email   : admin@dinasacademy.id
 *   Password: Admin123!
 *
 * Ganti password segera setelah pertama kali login lewat Settings admin.
 */
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/user.entity'; // 1. Tambahkan import User ini

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME     || 'dinasacademy',
  entities: [User], // 2. Daftarkan User di sini agar TypeORM mengenali tabelnya
  synchronize: false,
});

async function seedAdmin() {
  await ds.initialize();
  const repo = ds.getRepository(User); // 3. Gunakan class User, bukan string 'user'

  const existing = await repo.findOne({ where: { email: 'admin@dinasacademy.id' } });
  if (existing) {
    console.log('⚠️  Admin sudah ada, skip.');
    await ds.destroy();
    return;
  }

  const hashed = await bcrypt.hash('Admin123!', 10);
  await repo.save(repo.create({
    name: 'Admin Dinas Academy',
    email: 'admin@dinasacademy.id',
    password: hashed,
    role: 'admin',
    hasPurchasedPackage: false,
    profileCompleted: false,
  }));

  console.log('✅ Admin berhasil dibuat!');
  // ... sisa console.log
  await ds.destroy();
}

seedAdmin().catch(e => { console.error(e); process.exit(1); });