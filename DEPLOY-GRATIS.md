# 🆓 Hosting Gratis Dinas Academy (Neon + Render + Cloudflare Pages)

Untuk tahap awal rilis — **Rp0/bulan**, tanpa membeli server. Bisa dipindah ke VPS kapan saja
(lihat [DEPLOY.md](DEPLOY.md)).

```
Peserta ──► https://dinasacademy.pages.dev          (Website — Cloudflare Pages)
                 │  memanggil
                 ▼
            https://dinasacademy-api.onrender.com/api (Backend — Render)
                 │  terhubung (SSL)
                 ▼
            Neon PostgreSQL                          (Database — Neon)
```

| Bagian | Layanan | Batas paket gratis yang perlu diketahui |
|---|---|---|
| Database | [Neon](https://neon.com) | 1 GB per proyek; komputasi tidur setelah 5 menit tidak dipakai (bangun otomatis < 1 detik); 100 CU-jam/bulan |
| Backend | [Render](https://render.com) | Tidur setelah 15 menit tanpa pengunjung, bangun ±1 menit (diatasi di langkah 5); 750 jam/bulan; tanpa akses shell |
| Website | [Cloudflare Pages](https://pages.cloudflare.com) | 500 build/bulan; bandwidth tanpa batas |

Siapkan: akun **GitHub `ambilpena000`** (kode sudah di-*push*), terminal **Git Bash**, dan PostgreSQL 16 di laptop (sudah ada).
Semua layanan bisa daftar memakai akun GitHub — tanpa kartu kredit.

---

## Langkah 1 — Database di Neon

1. Buka [neon.com](https://neon.com) → **Sign up** (pakai GitHub).
2. **Create project**:
   - Project name: `dinasacademy`
   - Postgres version: **16** (sama dengan PostgreSQL di laptop, agar `pg_dump` backup bisa dipakai)
   - Region: **AWS Asia Pacific (Singapore)** — terdekat dengan Indonesia
3. Di dashboard proyek, klik **Connect** → salin **connection string**.
   Matikan opsi *Connection pooling* agar alamatnya tanpa `-pooler`. Bentuknya:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   Simpan baik-baik — ini **password database** Anda. Selanjutnya disebut `NEON_URL`.

## Langkah 2 — Pindahkan database laptop ke Neon

Semua perintah di panduan ini untuk terminal **Git Bash**, dijalankan dari folder proyek
(`/c/Kerja/Ambil pena/New folder/dinasacademy`).

> Selalu tulis `NEON_URL` di dalam tanda kutip **tunggal** `'...'`, agar karakter khusus
> (`&`, `?`, `!`, `$`) di connection string atau password tidak diubah oleh Bash.

```bash
# Pastikan berada di folder proyek (cek dengan: pwd)
cd "/c/Kerja/Ambil pena/New folder/dinasacademy"

# a. Backup database lokal (diminta password PostgreSQL laptop)
"/c/Program Files/PostgreSQL/16/bin/pg_dump.exe" -h localhost -U postgres -d dinasacademy -Fc -f dinasacademy.dump

# b. Restore ke Neon (ganti NEON_URL dengan connection string dari langkah 1, tetap di dalam kutip tunggal)
"/c/Program Files/PostgreSQL/16/bin/pg_restore.exe" --no-owner --no-acl -d 'NEON_URL' dinasacademy.dump
```

Peringatan kecil soal `extension` / `comment` boleh diabaikan.

```bash
# c. Ganti password admin & hapus akun peserta uji — dijalankan dari laptop ke Neon
cd backend
export DATABASE_URL='NEON_URL'
export ADMIN_PASSWORD='GantiDenganPasswordKuat#2026'
npm run seed:admin -- --reset-password
npm run reset:participants              # tampilkan dulu daftar akun uji (budi, bagas, …)
npm run reset:participants -- --yes     # hapus akun uji beserta pesanan & hasilnya

# d. PENTING: hapus variabel agar backend lokal kembali memakai database laptop
unset DATABASE_URL ADMIN_PASSWORD

# e. Hapus file backup (berisi data pengguna) setelah restore ke Neon berhasil
cd "/c/Kerja/Ambil pena/New folder/dinasacademy"
rm dinasacademy.dump
```

## Langkah 3 — Backend di Render

> **Jangan pakai menu "Blueprint"** — menu itu meminta kartu kredit. Buat lewat **New → Web Service**
> seperti di bawah; layanan gratis bisa berjalan tanpa kartu.

1. Buka [render.com](https://render.com) → **Get Started** (pakai GitHub) → izinkan akses ke repo `dinasacademy`.
2. Buat `JWT_SECRET` dulu di Git Bash laptop, salin hasilnya:
   ```bash
   openssl rand -hex 48
   ```
3. **New** → **Web Service** → pilih repo `ambilpena000/dinasacademy`, lalu isi:

   | Isian | Nilai |
   |---|---|
   | Name | `dinasacademy-api` → alamat menjadi `https://dinasacademy-api.onrender.com` |
   | Region | **Singapore** (bila tidak ada untuk paket gratis, pilih yang tersedia) |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime / Language | `Node` |
   | Build Command | `npm ci --include=dev && npm run build` |
   | Start Command | `node dist/main` |
   | Instance Type | **Free** |

4. Bagian **Environment Variables** → tambahkan:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `NODE_VERSION` | `20` |
   | `DATABASE_URL` | `NEON_URL` (connection string Neon) |
   | `JWT_SECRET` | hasil `openssl rand -hex 48` dari langkah 2 |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | `https://dinasacademy.pages.dev` (alamat website di langkah 4; ubah bila nama proyek berbeda) |

5. Buka **Advanced** → **Health Check Path** = `/api/health`.
6. **Create Web Service**. Build pertama ± 5–10 menit (lihat tab **Logs**, tunggu tulisan `Backend berjalan`).
7. Catat alamat backend di halaman service, mis. `https://dinasacademy-api.onrender.com`.
   Cek di browser: `https://dinasacademy-api.onrender.com/api/health` → `{"status":"ok", …}`.

> Masih diminta kartu walau lewat **Web Service**? Render kadang meminta verifikasi kartu dengan biaya
> uji $1 yang dikembalikan. **Kartu debit** berlogo Visa/Mastercard (termasuk kartu debit virtual dari
> aplikasi bank digital) biasanya diterima — tidak harus kartu kredit. Selama Instance Type **Free**,
> tidak ada tagihan bulanan.

## Langkah 4 — Website di Cloudflare Workers

Cloudflare kini membuat website lewat **Workers** (menu Pages tidak selalu tersedia). Konfigurasinya
sudah ada di `frontend/wrangler.jsonc` (termasuk agar refresh di `/hasil` dll. tidak 404).

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com) → daftar/masuk.
2. **Workers & Pages** → **Create** → **Import a repository** (Connect to Git) → pilih repo `dinasacademy`.
3. Pengaturan build:

   | Isian | Nilai |
   |---|---|
   | Project name | `dinasacademy` (harus sama dengan `name` di `frontend/wrangler.jsonc`) |
   | Production branch | `main` |
   | Root directory / Path | `frontend` |
   | Build command | `npm run build` |
   | Deploy command | `npx wrangler deploy` |

4. **Build variables** (Settings → Build → *Variables and secrets*; bukan variabel runtime):

   | Nama | Nilai |
   |---|---|
   | `VITE_API_URL` | alamat backend langkah 3 + `/api`, mis. `https://dinasacademy.onrender.com/api` |
   | `NODE_VERSION` | `20` |

5. **Deploy** (± 2–3 menit). Alamat website: `https://dinasacademy.<subdomain-akun>.workers.dev`
   (subdomain akun bisa diganti di Workers & Pages → *Subdomain* → **Change**).
6. Isi `FRONTEND_URL` di Render → service → **Environment** dengan alamat website tersebut persis
   (tanpa `/` di akhir) → simpan (Render deploy ulang otomatis).

## Langkah 5 — Cegah backend "tidur" (gratis)

Render gratis tidur setelah 15 menit sepi, sehingga peserta pertama menunggu ±1 menit. Pasang pemantau gratis:

1. Daftar di [UptimeRobot](https://uptimerobot.com) → **Add New Monitor**.
2. Type **HTTP(s)**, URL `https://dinasacademy-api.onrender.com/api/health`, interval **5 menit**.

Endpoint `/api/health` **tidak menyentuh database**, jadi database Neon tetap boleh tidur dan kuota
komputasinya tidak habis. Jatah 750 jam/bulan Render cukup untuk 1 backend menyala sebulan penuh.

## Langkah 6 — Cek sebelum diumumkan ✅

- [ ] `https://dinasacademy.pages.dev` terbuka
- [ ] Login admin dengan **password baru** berhasil (password lama ditolak)
- [ ] Panel admin: PTN & Jurusan, Try Out, Bank Soal tampil
- [ ] Daftar akun peserta baru → beli paket → admin aktifkan → try out bisa dikerjakan
- [ ] Hasil, Peringkat & Pembahasan tampil; upload foto profil berhasil dan tetap ada setelah beberapa jam
- [ ] Refresh di halaman selain beranda (mis. `/hasil`) tidak menampilkan error 404

---

## Update aplikasi

Cukup **push ke GitHub** (`git push origin main`). Render dan Cloudflare membangun ulang otomatis;
migrasi database berjalan sendiri saat backend start.

## Perintah admin (dijalankan dari laptop ke Neon)

Render gratis tidak punya shell, jadi jalankan dari folder `backend` di Git Bash:

```bash
cd backend
export DATABASE_URL='NEON_URL'
export ADMIN_PASSWORD='PasswordBaruYangKuat#2026'
npm run seed:admin -- --reset-password     # ganti password admin
npm run rescore                            # hitung ulang skor & peringkat
npm run seed:universities                  # perbarui data PTN/prodi SNPMB
unset DATABASE_URL ADMIN_PASSWORD          # selalu hapus setelah selesai
cd ..
```

## Backup

Neon menyimpan riwayat singkat, tapi tetap buat backup sendiri (mis. tiap minggu):

```bash
"/c/Program Files/PostgreSQL/16/bin/pg_dump.exe" -Fc -f "backup-$(date +%Y%m%d).dump" 'NEON_URL'
```

## Kapan perlu pindah ke paket berbayar / VPS?

- Database mendekati **1 GB** (lihat dashboard Neon → *Storage*)
- Neon memberi peringatan kuota komputasi bulanan hampir habis
- Peserta mengeluh lambat saat ujian serentak (paket gratis Render: 0,1 CPU, 512 MB RAM)

Pindah ke VPS: ikuti [DEPLOY.md](DEPLOY.md), lalu pindahkan data dengan `pg_dump` dari Neon → `pg_restore` ke VPS.

## Domain sendiri (opsional, nanti)

Beli domain → Cloudflare Pages → proyek → **Custom domains** (gratis, HTTPS otomatis).
Lalu tambahkan alamatnya di `FRONTEND_URL` Render (pisahkan koma):
`https://dinasacademy.pages.dev,https://dinasacademy.com`.

## Masalah umum

| Gejala | Solusi |
|---|---|
| Deploy Render gagal: "Konfigurasi production tidak aman" | `FRONTEND_URL` kosong/localhost, atau `JWT_SECRET` hilang. Periksa **Environment** di Render |
| Website terbuka tapi login gagal / "Failed to fetch" | `VITE_API_URL` salah (harus diakhiri `/api`) atau `FRONTEND_URL` di Render tidak sama persis dengan alamat website. Perbaiki lalu **Retry deployment** di Cloudflare |
| Pertama kali buka lambat ±1 menit | Backend sedang bangun — pasang UptimeRobot (langkah 5) |
| `pg_restore`: *connection requires SSL* | Pastikan `?sslmode=require` ada di akhir `NEON_URL` |
| `pg_dump` ke Neon: *server version mismatch* | Proyek Neon bukan Postgres 16 — buat proyek baru dengan versi 16, atau pasang PostgreSQL client versi yang sama |
