# 🎓 Dinas Academy — Platform Simulasi Try Out Online

[![Stack: NestJS](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Stack: React + Vite](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite-61DAFB?style=flat-square&logo=react)](https://vitejs.dev/)
[![Stack: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2014+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

**Dinas Academy** adalah platform ekosistem pembelajaran dan simulasi Try Out online berbasis CAT (Computer Assisted Test) untuk persiapan **SNBT (PTN)**, **SKD CPNS/Sekolah Kedinasan**, dan **STIS**.

---

## 📋 Daftar Isi
1. [Prasyarat Sistem](#-prasyarat-sistem)
2. [Panduan Setup & Instalasi Lokal](#-panduan-setup--instalasi-lokal)
3. [Setup Otomatis dengan Docker](#-setup-otomatis-dengan-docker)
4. [Kredensial Login & Akun Default](#-kredensial-login--akun-default)
5. [Panduan Pengujian (Testing)](#-panduan-pengujian-testing)
6. [Daftar Perintah Cepat (Cheat Sheet)](#-daftar-perintah-cepat-cheat-sheet)
7. [Struktur Folder](#-struktur-folder)

---

## 🛠️ Prasyarat Sistem

Pastikan sistem Anda telah terinstal software berikut sebelum memulai:
* **Node.js** (v18.x atau v20.x disarankan) & **npm**
* **PostgreSQL** (v14 ke atas)
* **Git**
* *(Opsional)* **Docker & Docker Compose** (jika ingin menjalankan via kontainer)

---

## 🚀 Panduan Setup & Instalasi Lokal

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda:

### 1. Clone & Install Dependencies
Buka terminal di folder root proyek dan jalankan instalasi serentak untuk backend maupun frontend:

```bash
# Install seluruh dependencies (backend & frontend sekaligus)
npm run install:all
```

> *(Atau jika ingin manual: `cd backend && npm install` kemudian `cd ../frontend && npm install`)*

### 2. Konfigurasi Environment Variables (`.env`)
Salin file template `.env.example` menjadi `.env` di masing-masing folder:

#### 🔹 Backend (`backend/.env`)
```bash
cp backend/.env.example backend/.env
```
Buka `backend/.env` dan sesuaikan parameter database PostgreSQL Anda:
```ini
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password_postgres_anda
DB_NAME=dinasacademy
JWT_SECRET=super_secret_jwt_key_dinas_academy_2026
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### 🔹 Frontend (`frontend/.env`)
```bash
cp frontend/.env.example frontend/.env
```
Isi `frontend/.env`:
```ini
VITE_API_URL=http://localhost:3000/api
```

### 3. Setup Skema Database & Seeding Data
Buat database baru di PostgreSQL Anda (lewat pgAdmin / psql):
```sql
CREATE DATABASE dinasacademy;
```

Jalankan skema DDL final untuk membuat seluruh tabel dan indeks relasi:
```bash
psql -U postgres -d dinasacademy -f database_schema.sql
```

Setelah tabel terbentuk, jalankan **Seeder** untuk mengisi bank soal Try Out, paket langganan, dan akun Admin:
```bash
# 1. Masuk ke folder backend
cd backend

# 2. Seed data Try Out & Bank Soal (SNBT, SKD, STIS)
npm run seed

# 3. Seed data Paket Pembelian (Basic, Premium, VIP)
npm run seed:packages

# 4. Seed Akun Admin Default
npx ts-node -r tsconfig-paths/register src/seed-admin.ts
```

### 4. Jalankan Aplikasi (Development Mode)

Buka 2 terminal terpisah dari root folder proyek:

```bash
# Terminal 1: Jalankan Backend NestJS (Port 3000)
npm run start:backend

# Terminal 2: Jalankan Frontend React Vite (Port 5173)
npm run start:frontend
```
🎉 Aplikasi siap diakses melalui browser di: **http://localhost:5173**

---

## 🐳 Setup Otomatis dengan Docker

Jika Anda tidak ingin menginstal PostgreSQL secara manual, Anda dapat menjalankan seluruh ekosistem (Database + Backend + Frontend) menggunakan Docker Compose:

```bash
# 1. Siapkan file .env utama di root folder
cp .env.example .env

# 2. Build dan jalankan container di background
docker-compose up -d --build

# 3. Cek log jika diperlukan
docker-compose logs -f backend
```
* **Frontend**: http://localhost:80
* **Backend API**: http://localhost:3000
* **PostgreSQL**: localhost:5432

---

## 🔑 Kredensial Login & Akun Default

Setelah menjalankan script seeder (`seed-admin.ts`), Anda dapat menggunakan akun berikut untuk masuk ke sistem:

### 🛡️ Akun Administrator (Dashboard Admin)
Digunakan untuk mengelola soal, memvalidasi pembayaran paket pengguna, dan melihat statistik sistem:
* **Email:** `admin@dinasacademy.id`
* **Password:** `Admin123!`
* **Akses:** Halaman Admin (`/admin` atau tombol panel admin di navigation bar)

### 🧑‍🎓 Akun Siswa / Student (Reguler)
Untuk menguji alur pengguna biasa (mengerjakan ujian CAT, melihat pembahasan, membeli paket):
1. Buka halaman utama **http://localhost:5173**
2. Klik tombol **Daftar / Register**
3. Daftarkan email & password baru (misal: `siswa@test.com` / `Siswa123!`)
4. Sistem akan otomatis masuk ke Dashboard Siswa.

---

## 🧪 Panduan Pengujian (Testing)

Proyek ini dilengkapi dengan suite pengujian otomatis (Automated Tests) menggunakan **Jest** pada lapisan Backend NestJS serta panduan pengujian alur manual (E2E Flow).

### 1. Automated Testing (Backend Jest)

Jalankan perintah berikut dari root folder atau dari dalam folder `backend/`:

```bash
cd backend

# 🔹 Menjalankan seluruh Unit Test
npm run test

# 🔹 Menjalankan Unit Test dengan mode Watch (Live reload saat kode diubah)
npm run test:watch

# 🔹 Mengecek persentase cakupan kode (Test Coverage Report)
npm run test:cov

# 🔹 Menjalankan End-to-End (E2E) API Test
npm run test:e2e
```

### 2. Manual UI & Business Flow Testing
Untuk memastikan seluruh fitur inti berfungsi dengan baik, lakukan skenario pengujian berikut di browser:

1. **Skenario Simulasi Try Out (CAT System)**:
   * Login sebagai Siswa $\rightarrow$ Menu **Try Out** $\rightarrow$ Pilih paket (misal: *Try Out SNBT 2026 #1*).
   * Verifikasi timer hitung mundur berjalan otomatis sesuai durasi.
   * Coba jawab beberapa soal, klik "Ragu-ragu", dan navigasi antar nomor soal.
   * Klik **Selesaikan Ujian** $\rightarrow$ Pastikan sistem menampilkan halaman **Hasil Skor (Score Report)**, statistik Benar/Salah, dan Pembahasan soal.

2. **Skenario Pembelian & Aktivasi Paket**:
   * Login sebagai Siswa $\rightarrow$ Menu **Paket** $\rightarrow$ Klik beli pada salah satu paket berbayar.
   * Selesaikan pemesanan hingga muncul kode unik transaksi.
   * Login sebagai **Admin** (`admin@dinasacademy.id`) $\rightarrow$ Masuk ke panel Admin $\rightarrow$ Kelola Transaksi / Orders.
   * Verifikasi pesanan siswa tersebut $\rightarrow$ Pastikan status berubah menjadi `success` dan akun siswa terbuka akses premiumnya.

---

## ⚡ Daftar Perintah Cepat (Cheat Sheet)

| Perintah | Lokasi / Prefix | Keterangan |
| :--- | :--- | :--- |
| `npm run install:all` | Root | Menginstal `node_modules` di backend & frontend serentak |
| `npm run start:backend` | Root | Menjalankan server development NestJS dengan watch mode |
| `npm run start:frontend` | Root | Menjalankan server Vite React frontend |
| `npm run build` | Root | Membuild bundle production backend & frontend |
| `npm run seed` | `cd backend` | Mengisi data Try Out awal & butir soal simulasi |
| `npm run seed:packages`| `cd backend` | Mengisi katalog paket langganan |
| `npx ts-node src/seed-admin.ts` | `cd backend` | Membuat akun admin default |

---

## 📂 Struktur Folder

```
dinasacademy/
├── backend/                  # NestJS API Layer
│   ├── src/
│   │   ├── auth/             # Modul Autentikasi & JWT Strategy
│   │   ├── users/            # Manajemen Pengguna & Profil Siswa
│   │   ├── tryouts/          # Katalog & Pengaturan Try Out
│   │   ├── questions/        # Butir Soal, Pembahasan, & Bobot Opsi
│   │   ├── exam/             # Engine Pengerjaan Ujian & Draft Autosave
│   │   ├── results/          # Perhitungan Skor, Persentase, & Ranking
│   │   ├── orders/           # Transaksi Pembelian & Verifikasi
│   │   ├── packages/         # Katalog Paket Belajar
│   │   ├── seed.ts           # Seeder utama (Try Out & Soal)
│   │   └── seed-admin.ts     # Seeder akun Admin
│   └── test/                 # E2E Test suite
├── frontend/                 # React + Vite UI Layer
│   ├── src/app/
│   │   ├── pages/            # Halaman Dashboard, Try Out, Pembahasan, Admin
│   │   ├── context/          # AuthContext (State Autentikasi Global)
│   │   ├── lib/              # Konfigurasi HTTP Client (Axios / API fetcher)
│   │   └── components/       # Komponen UI Modular
├── database_schema.sql       # DDL Skema Database PostgreSQL Final
├── docker-compose.yml        # Konfigurasi Multi-container Docker
└── README.md                 # Dokumentasi Proyek
```
