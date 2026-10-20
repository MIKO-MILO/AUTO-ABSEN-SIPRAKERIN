# Siprakerin Auto-Submit Jurnal

Auto-submit jurnal harian PKL ke siprakerin.com setiap hari jam 07:30 WIB secara otomatis lewat GitHub Actions — tanpa perlu buka laptop.

---

## Cara Setup (untuk teman)

### Langkah 1 — Fork repo ini

Klik tombol **Fork** di pojok kanan atas halaman GitHub ini.

---

### Langkah 2 — Tambahkan Secrets

Buka repo hasil fork kamu → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Tambahkan 4 secrets berikut:

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://supabase.siprakerin.com` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2duYnJ1cmx2bWNmcGpwZ3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDQ3MDYsImV4cCI6MjA2Nzk4MDcwNn0.pc6N77IAYpPCccSN9CRTNk4bL1kyU0p3LkAiV-VVfpw` |
| `EMAIL` | email siprakerin kamu (contoh: `0012345678@siprakerin.com`) |
| `PASSWORD` | password siprakerin kamu |

> ⚠️ Secrets aman — tidak bisa dilihat siapapun termasuk pemilik repo asli.

---

### Langkah 3 — Enable Actions

Buka tab **Actions** di repo fork kamu → klik **I understand my workflows, go ahead and enable them**

---

### Langkah 4 — Test manual

1. Buka tab **Actions**
2. Klik **Auto Submit Jurnal Harian** di sidebar kiri
3. Klik **Run workflow** → **Run workflow**
4. Tunggu beberapa detik → klik run yang muncul untuk lihat log

Kalau muncul ✅ dan log `JURNAL BERHASIL DISUBMIT` berarti sudah berhasil.

---

## Jadwal Otomatis

Jurnal akan otomatis tersubmit setiap:
- **Senin–Jumat jam 07:30 WIB**
- Weekend otomatis submit dengan keterangan **libur**

Tidak perlu buka laptop, tidak perlu koneksi — semua jalan di server GitHub (gratis).

---

## Cek Hasil

Buka [siprakerin.com](https://siprakerin.com) → login → cek jurnal harian kamu.

---

## Troubleshooting

**Actions tidak jalan otomatis?**
- Pastikan repo tidak di-fork lebih dari 60 hari tanpa aktivitas (GitHub pause Actions di repo tidak aktif)
- Buka tab Actions → kalau ada pesan "disabled", klik enable

**Jurnal tidak masuk?**
- Cek log di tab Actions → klik run terbaru → lihat error-nya
- Kemungkinan password salah atau akun siprakerin bermasalah

**Submit gagal "Date Too Old"?**
- Jurnal hari itu sudah ada sebelumnya — tidak masalah

---
