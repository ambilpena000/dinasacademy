# 🧪 Panduan Testing & Build — Dinas Academy

## Urutan Langkah Setup dari Awal (Untuk Developer Baru / Setelah Git Pull)

Jika kamu baru melakukan *pull* atau *clone* dari Git, pastikan mengikuti langkah 1 & 2 ini terlebih dahulu.

### Step 1: Install Dependencies
Jalankan perintah ini di folder utama (root) untuk menginstall package frontend dan backend sekaligus:
```bash
npm run install:all
```

### Step 2: Konfigurasi Environment (.env)
- Copy file `env.example` menjadi `.env` di folder utama.
- Buka file `.env` dan sesuaikan `DB_PASSWORD` dengan password PostgreSQL di komputermu.

### Step 3: Pastikan PostgreSQL Berjalan
- Buka pgAdmin atau terminal PostgreSQL
- Pastikan database `dinasacademy` sudah ada
- Jika belum, buat: `CREATE DATABASE dinasacademy;`

### Step 2: Jalankan Seed Soal (jika belum ada data)
```bash
cd "c:\Semester 6\dinasacademy\backend"
npx ts-node src/seed.ts
```
> Ini akan mengisi 12 Try Out (6 SNBT + 6 SKD) dan 1.620 soal ke database.
> Pastikan file `.env` di folder `backend` sudah benar (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME).

### Step 3: Build Backend
```bash
cd "c:\Semester 6\dinasacademy\backend"
npm run build
```

### Step 4: Jalankan Backend
```bash
cd "c:\Semester 6\dinasacademy\backend"
npm run start:dev
```
> Backend akan berjalan di `http://localhost:3000/api`
> Tunggu sampai muncul: `✅ Backend berjalan di http://localhost:3000/api`

### Step 5: Jalankan Frontend
```bash
cd "c:\Semester 6\dinasacademy\frontend"
npm run dev
```
> Frontend akan berjalan di `http://localhost:5173`

---

## Urutan Testing Manual

### A. Test Halaman Publik (Tanpa Login)
1. Buka `http://localhost:5173` → Landing page tampil
2. Klik **Lihat Paket** → Halaman paket muncul dengan 2 kartu (SNBT & SKD)
3. Kartu paket harus menampilkan harga, fitur, dan "Pilih Paket"

### B. Test Login & Register
1. Klik **Daftar** → Isi nama, email, password → Register berhasil
2. Login dengan akun yang baru dibuat
3. Dashboard siswa muncul

### C. Test Dashboard Siswa (Setelah Login)
1. **Dashboard** → Banner "Mulai Persiapan" muncul (belum beli paket)
2. **Try Out** → Tampilan "Terkunci", kartu paket muncul di tengah
3. **Hasil** → Tampilan terkunci (belum pernah ujian)
4. **Paket** → 2 kartu paket proporsional di tengah halaman
5. **Pesanan** → "Belum ada pesanan" (full width)
6. **Profile** → Data profil bisa diedit

### D. Test Beli Paket (Flow Pembelian)
1. Klik **Pilih Paket** di halaman Paket
2. Pilih metode pembayaran → Submit pesanan
3. Pesanan muncul di halaman **Pesanan** dengan status "Menunggu Konfirmasi"

### E. Test Admin Panel
1. Login dengan akun admin
2. **Dashboard Admin** → Statistik muncul
3. **Bank Soal** → ⚠️ PENTING: soal harus muncul (1.620 soal)
   - Filter **SKD** → hanya mapel TWK/TIU/TKP yang muncul di dropdown
   - Filter **SNBT** → hanya mapel PU/PPU/KMBM/PK/LBI/LBE/PM yang muncul
   - Filter **Semua Paket** → semua mapel muncul
   - Klik **+ Tambah Soal** → form muncul di tengah page
   - Edit soal → form muncul di tengah, data terisi
4. **Pengguna** → Daftar user tampil
5. **Pesanan Admin** → Bisa approve/reject pesanan
6. **Pengaturan** → Setting website

### F. Test Aktivasi Paket (Admin → Siswa)
1. Admin masuk ke **Pesanan** → Klik **Aktivasi** pada pesanan siswa
2. Login kembali sebagai siswa
3. **Try Out** → Daftar Try Out sekarang terbuka (tidak lagi "Terkunci")
4. Klik salah satu Try Out → Ujian dimulai

### G. Test Ujian (Try Out)
1. Pilih Try Out → Soal muncul per subtes
2. Jawab beberapa soal → Klik submit
3. **Hasil** → Skor dan ranking muncul
4. **Pembahasan** → Jawaban benar + penjelasan muncul

---

## Catatan Penting

> [!WARNING]
> **TypeORM `synchronize: true`** aktif di backend — artinya TypeORM otomatis
> menyinkronkan schema database saat backend start. Kamu TIDAK perlu menjalankan
> DDL/SQL manual. Cukup jalankan `npm run start:dev` dan schema akan terupdate otomatis.

> [!IMPORTANT]
> Jika Bank Soal admin masih kosong (0 soal), kemungkinan:
> 1. Backend belum di-restart setelah perubahan kode terbaru
> 2. Seed soal belum dijalankan (`npx ts-node src/seed.ts`)
> 3. Cek Console browser (F12) untuk error detail

> [!TIP]
> Untuk membuat akun admin, kamu bisa langsung update role user di database:
> ```sql
> UPDATE "user" SET role = 'admin' WHERE email = 'emailkamu@gmail.com';
> ```
