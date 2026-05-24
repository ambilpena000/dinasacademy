# Dinas Academy

Platform try out online untuk persiapan SNBT, SKD, dan STIS.

**Stack:** NestJS (backend) · React + Vite (frontend) · PostgreSQL

---

## Cara Menjalankan (Development)

### 1. Persiapan environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — isi DB_PASSWORD dan JWT_SECRET

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env jika URL backend berbeda dari default
```

### 2. Install dependencies

```bash
# Dari root folder
npm run install:all

# Atau manual
cd backend && npm install
cd ../frontend && npm install
```

### 3. Siapkan database PostgreSQL

Pastikan PostgreSQL sudah berjalan dan buat database:
```sql
CREATE DATABASE dinasacademy;
```

### 4. Jalankan backend

```bash
cd backend
npm run start:dev
# Backend berjalan di http://localhost:3000/api
```

### 5. Jalankan frontend

```bash
cd frontend
npm run dev
# Frontend berjalan di http://localhost:5173
```

### Login default

| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@dinasacademy.id       | Admin123!  |

---

## Cara Deploy (Docker)

### 1. Persiapan

```bash
cp .env.example .env
# Edit .env — isi semua nilai, terutama DB_PASSWORD dan JWT_SECRET
```

### 2. Build dan jalankan semua service

```bash
docker-compose up -d --build
```

Service yang berjalan:
- **PostgreSQL** → port 5432
- **Backend** → http://localhost:3000
- **Frontend** → http://localhost:80

### 3. Cek status

```bash
docker-compose ps
docker-compose logs backend
```

### 4. Hentikan

```bash
docker-compose down
# Dengan hapus data database:
docker-compose down -v
```

---

## Struktur Proyek

```
dinasacademy/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Login, register, JWT
│   │   ├── users/    # Data pengguna & profil
│   │   ├── tryouts/  # Daftar try out
│   │   ├── questions/# Soal-soal
│   │   ├── exam/     # Pengerjaan ujian & draft
│   │   ├── results/  # Hasil & ranking
│   │   ├── orders/   # Pembelian paket
│   │   └── packages/ # Paket tersedia
│   └── .env.example
├── frontend/         # React + Vite
│   ├── src/app/
│   │   ├── pages/    # Halaman utama & admin
│   │   ├── context/  # AuthContext (state global)
│   │   ├── hooks/    # useTryouts, useResults
│   │   ├── lib/      # api.ts (semua HTTP call)
│   │   └── components/
│   └── .env.example
├── docker-compose.yml
└── .env.example
```

---

## Variabel Environment

### backend/.env

| Variabel        | Keterangan                          | Default           |
|-----------------|-------------------------------------|-------------------|
| `DB_HOST`       | Host PostgreSQL                     | `localhost`       |
| `DB_PORT`       | Port PostgreSQL                     | `5432`            |
| `DB_USERNAME`   | Username database                   | `postgres`        |
| `DB_PASSWORD`   | Password database                   | *(wajib diisi)*   |
| `DB_NAME`       | Nama database                       | `dinasacademy`    |
| `JWT_SECRET`    | Secret untuk sign token JWT         | *(wajib diisi)*   |
| `JWT_EXPIRES_IN`| Masa berlaku token                  | `7d`              |
| `PORT`          | Port server backend                 | `3000`            |
| `FRONTEND_URL`  | URL frontend untuk CORS             | `http://localhost:5173` |
| `NODE_ENV`      | `development` atau `production`     | `development`     |

### frontend/.env

| Variabel        | Keterangan                          | Default                       |
|-----------------|-------------------------------------|-------------------------------|
| `VITE_API_URL`  | URL API backend                     | `http://localhost:3000/api`   |
