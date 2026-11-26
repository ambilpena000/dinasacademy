# 🚀 Panduan Hosting Dinas Academy

Panduan ini membawa web dari komputer Anda ke internet: **1 VPS + 1 domain**, HTTPS otomatis,
database lokal dipindahkan ke server. Perkiraan waktu: 1–2 jam.

```
Peserta ──► https://dinasacademy.com ──► Caddy (HTTPS)
                                          ├── /api, /uploads ──► backend (NestJS)
                                          └── halaman web     ──► frontend (React/Nginx)
                                     backend ──► PostgreSQL (tidak terbuka ke internet)
```

---

## 0. Yang perlu disiapkan

| Kebutuhan | Rekomendasi | Perkiraan biaya |
|---|---|---|
| VPS Ubuntu 24.04, **2 vCPU, 2–4 GB RAM, SSD ≥ 40 GB** | [IDCloudHost](https://idcloudhost.com/en/server-vps/) · [DomaiNesia](https://www.domainesia.com/) · [Biznet Gio](https://www.biznetgio.com/) | ± Rp150.000–360.000 / bulan |
| Domain (`.com` / `.id`) | Beli di penyedia yang sama dengan VPS, atau [Hostinger](https://www.hostinger.com/id/domain) | ± Rp110.000–250.000 / tahun |
| SSL / HTTPS | Otomatis oleh Caddy (Let's Encrypt) | Gratis |

Di komputer Anda: **PowerShell** (sudah ada `ssh` & `scp`), PostgreSQL 16 lokal (sudah terpasang),
dan kode terbaru sudah di-*push* ke GitHub.

---

## 1. Beli VPS & domain

1. Pesan VPS dengan OS **Ubuntu 24.04 LTS**. Catat **IP server** dan **password root** (dikirim lewat email/panel).
2. Beli domain, mis. `dinasacademy.com`.

## 2. Arahkan domain ke server (DNS)

Di panel DNS domain, buat 2 record:

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| A | `@` | IP_SERVER | 300 |
| A | `www` | IP_SERVER | 300 |

Cek (bisa butuh 5–60 menit): `nslookup dinasacademy.com` harus menampilkan IP server.

## 3. Masuk ke server

Di PowerShell komputer Anda:

```powershell
ssh root@IP_SERVER
```

Semua perintah langkah 4–9 dijalankan **di server** (di jendela SSH ini).

## 4. Siapkan server

```bash
# Update sistem
apt update && apt upgrade -y

# Firewall: hanya SSH, HTTP, HTTPS
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

# Install Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
docker compose version
```

## 5. Ambil kode dari GitHub

```bash
mkdir -p /opt && cd /opt
git clone https://github.com/ambilpena000/dinasacademy.git
cd dinasacademy
```

> Repo **private**? Saat diminta password, gunakan **Personal Access Token** GitHub
> (GitHub → Settings → Developer settings → Personal access tokens → *Fine-grained*, akses *Contents: Read*).

## 6. Isi konfigurasi `.env`

```bash
cp env.example .env
openssl rand -hex 48     # jalankan 2x: satu untuk JWT_SECRET, satu untuk DB_PASSWORD
nano .env
```

Isi minimal:

```ini
DOMAIN=dinasacademy.com
FRONTEND_URL=https://dinasacademy.com
VITE_API_URL=https://dinasacademy.com/api
DB_PASSWORD=<hasil openssl pertama>
JWT_SECRET=<hasil openssl kedua>
```

Simpan: `Ctrl+O`, Enter, `Ctrl+X`. **Jangan pernah** membagikan / meng-commit file `.env`.

## 7. Jalankan aplikasi

```bash
docker compose up -d --build      # build pertama ± 3–8 menit
docker compose ps                 # 4 container harus "running"
docker compose logs -f backend    # tunggu "Backend berjalan", keluar dengan Ctrl+C
```

Tabel database dibuat otomatis oleh migrasi saat backend start.

## 8. Pindahkan database lokal ke server

**a. Di komputer Anda (PowerShell)** — buat backup:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -h localhost -U postgres -d dinasacademy -Fc -f dinasacademy.dump
scp dinasacademy.dump root@IP_SERVER:/opt/dinasacademy/
```

**b. Di server** — restore, lalu restart backend:

```bash
cd /opt/dinasacademy
docker exec -i dinasacademy-db pg_restore -U postgres -d dinasacademy --clean --if-exists --no-owner < dinasacademy.dump
docker compose restart backend
rm dinasacademy.dump
```

**c. Wajib — ganti password admin** (dump membawa password lama dari komputer Anda):

```bash
docker compose exec -e ADMIN_PASSWORD='GantiDenganPasswordKuat#2026' backend node dist/seed-admin.js --reset-password
```

**d. Hapus akun peserta uji** (mis. budi, bagas) beserta pesanan & hasilnya — *hanya sebelum peluncuran*:

```bash
docker compose exec backend node dist/reset-participants.js        # lihat dulu daftar yang akan dihapus
docker compose exec backend node dist/reset-participants.js --yes  # hapus
```

> Alternatif tanpa memindahkan database (mulai kosong):
> `docker compose exec backend node dist/seed-admin.js` (password acak ditampilkan sekali) dan
> `docker compose exec backend node dist/seed-universities.js`. Try out, soal & paket lalu diisi lewat panel admin.

## 9. Backup otomatis harian

```bash
chmod +x scripts/backup-db.sh
bash scripts/backup-db.sh          # uji sekali → file di folder backups/
crontab -e                         # tambahkan baris berikut, simpan
0 2 * * * cd /opt/dinasacademy && bash scripts/backup-db.sh >> backups/backup.log 2>&1
```

Sesekali unduh backup ke komputer Anda: `scp root@IP_SERVER:/opt/dinasacademy/backups/*.dump .`

## 10. Cek sebelum diumumkan ✅

- [ ] `https://dinasacademy.com` terbuka dengan ikon gembok (HTTPS)
- [ ] `https://www.dinasacademy.com` diarahkan ke domain utama
- [ ] Login admin dengan **password baru** berhasil; password lama ditolak
- [ ] Daftar akun peserta baru → beli paket → admin aktifkan pesanan
- [ ] Peserta mengerjakan try out → halaman Hasil, Peringkat & Pembahasan tampil
- [ ] Upload foto profil → masih ada setelah `docker compose restart`
- [ ] Data PTN & prodi muncul di Profil

---

## Update aplikasi (setelah ada perubahan kode)

Di komputer: commit & push ke GitHub. Lalu di server:

```bash
cd /opt/dinasacademy
bash scripts/backup-db.sh               # selalu backup dulu
git pull
docker compose up -d --build            # migrasi database baru berjalan otomatis
```

> Perubahan struktur tabel **harus** lewat migrasi (`npm run migration:generate -- src/migrations/NamaPerubahan`
> di komputer). Jangan memindahkan ulang database lokal setelah peserta asli mendaftar — data mereka akan tertimpa.

## Perintah berguna

| Kebutuhan | Perintah (di `/opt/dinasacademy`) |
|---|---|
| Status container | `docker compose ps` |
| Log backend / HTTPS | `docker compose logs -f backend` · `docker compose logs -f caddy` |
| Restart semua | `docker compose restart` |
| Hitung ulang skor & peringkat | `docker compose exec backend node dist/rescore-tryouts.js` |
| Perbarui data PTN SNPMB | (di komputer) `python scripts/sync_snpmb.py --refresh` → push → `git pull` + `docker compose up -d --build` → `docker compose exec backend node dist/seed-universities.js` |
| Buka database (psql) | `docker exec -it dinasacademy-db psql -U postgres -d dinasacademy` |

## Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| Backend terus restart, log "Konfigurasi production tidak aman" | `JWT_SECRET`/`DB_PASSWORD` di `.env` masih bawaan/pendek, atau `FRONTEND_URL` masih localhost |
| `docker compose up` gagal "… wajib diisi" | Variabel di `.env` belum diisi (lihat langkah 6) |
| HTTPS tidak terbit / browser "not secure" | DNS belum mengarah ke IP server, atau port 80/443 tertutup. Cek `docker compose logs caddy` |
| Web terbuka tapi login gagal / data kosong | `VITE_API_URL` salah. Perbaiki `.env`, lalu `docker compose up -d --build frontend` |
| Lupa password admin | `docker compose exec -e ADMIN_PASSWORD='baru...' backend node dist/seed-admin.js --reset-password` |
