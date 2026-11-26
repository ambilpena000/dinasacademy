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

Siapkan: akun **GitHub `ambilpena000`** (kode sudah di-*push*), PowerShell, dan PostgreSQL 16 di laptop (sudah ada).
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

Di **PowerShell** laptop, dari folder proyek:

```powershell
# a. Backup database lokal
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -h localhost -U postgres -d dinasacademy -Fc -f dinasacademy.dump

# b. Restore ke Neon (ganti NEON_URL dengan connection string dari langkah 1, tetap di dalam tanda kutip)
& "C:\Program Files\PostgreSQL\16\bin\pg_restore.exe" --no-owner --no-acl -d "NEON_URL" dinasacademy.dump
```

Peringatan kecil soal `extension` / `comment` boleh diabaikan.

```powershell
# c. Ganti password admin & hapus akun peserta uji — perintah dijalankan dari laptop ke Neon
cd backend
$env:DATABASE_URL = "NEON_URL"
$env:ADMIN_PASSWORD = "GantiDenganPasswordKuat#2026"
npm run seed:admin -- --reset-password
npm run reset:participants              # tampilkan dulu daftar akun uji (budi, bagas, …)
npm run reset:participants -- --yes     # hapus akun uji beserta pesanan & hasilnya

# d. PENTING: hapus variabel agar backend lokal kembali memakai database laptop
Remove-Item Env:DATABASE_URL; Remove-Item Env:ADMIN_PASSWORD
cd ..
Remove-Item dinasacademy.dump
```

## Langkah 3 — Backend di Render

1. Buka [render.com](https://render.com) → **Get Started** (pakai GitHub) → izinkan akses ke repo `dinasacademy`.
2. **New** → **Blueprint** → pilih repo `ambilpena000/dinasacademy`. Render membaca file [`render.yaml`](render.yaml).
3. Isi 2 variabel yang diminta:
   - `DATABASE_URL` = `NEON_URL`
   - `FRONTEND_URL` = `https://dinasacademy.pages.dev` (alamat website di langkah 4; ubah bila nama proyek berbeda)
4. **Apply**. Build pertama ± 5–10 menit. `JWT_SECRET` dibuat acak otomatis oleh Render.
5. Catat alamat backend di halaman service, mis. `https://dinasacademy-api.onrender.com`.
   Cek di browser: `https://dinasacademy-api.onrender.com/api/health` → `{"status":"ok", …}`.

> Bila region **Singapore** tidak tersedia untuk paket gratis, pilih region yang ada lalu hapus baris
> `region:` di `render.yaml` (atau ubah region di dashboard). Website tetap berjalan, hanya sedikit lebih lambat.

## Langkah 4 — Website di Cloudflare Pages

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com) → daftar/masuk.
2. **Workers & Pages** → **Create** → tab **Pages** → **Connect to Git** → pilih repo `dinasacademy`.
3. Pengaturan build:

   | Isian | Nilai |
   |---|---|
   | Project name | `dinasacademy` → alamat menjadi `https://dinasacademy.pages.dev` |
   | Production branch | `main` |
   | Framework preset | `Vite` (atau *None*) |
   | Root directory | `frontend` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. **Environment variables** (Production):

   | Nama | Nilai |
   |---|---|
   | `VITE_API_URL` | `https://dinasacademy-api.onrender.com/api` (alamat backend langkah 3 + `/api`) |
   | `NODE_VERSION` | `20` |

5. **Save and Deploy** (± 2–3 menit).
6. Bila alamat website berbeda dari `https://dinasacademy.pages.dev`, ubah `FRONTEND_URL` di
   Render → service → **Environment** → simpan (Render deploy ulang otomatis).

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

Render gratis tidak punya shell, jadi jalankan dari folder `backend` di PowerShell:

```powershell
$env:DATABASE_URL = "NEON_URL"
npm run seed:admin -- --reset-password     # ganti password admin (pakai $env:ADMIN_PASSWORD)
npm run rescore                            # hitung ulang skor & peringkat
npm run seed:universities                  # perbarui data PTN/prodi SNPMB
Remove-Item Env:DATABASE_URL               # selalu hapus setelah selesai
```

## Backup

Neon menyimpan riwayat singkat, tapi tetap buat backup sendiri (mis. tiap minggu):

```powershell
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -Fc -f "backup-$(Get-Date -Format yyyyMMdd).dump" "NEON_URL"
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
