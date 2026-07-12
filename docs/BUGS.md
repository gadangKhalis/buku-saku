# Bug Log — BukuSaku

## [CRITICAL] Dual Auth System Tidak Sinkron

**Ditemukan:** Week 1 Day 7 (testing cookie di DevTools)
**Status:** ✅ Fixed

### Gejala

Cookie `token` dari Express (dibuat di endpoint `/login`) tidak pernah muncul di browser, walau proses login terlihat berhasil dari sisi UI.

### Root Cause

`CredentialsProvider.authorize()` di NextAuth memanggil endpoint Express `/api/auth/login` secara **server-to-server** (dari server Next.js, bukan dari browser). Response `Set-Cookie` dari Express diterima oleh server Next.js, tapi tidak pernah di-forward ke browser karena `authorize()` hanya mengembalikan object `user`, bukan raw HTTP response.

Akibatnya: 2 sistem auth (NextAuth session + Express JWT cookie) berjalan paralel tanpa saling terhubung. Endpoint yang di-protect `authMiddle` (mengharapkan cookie `token`) akan selalu gagal diakses dari browser walau user sudah login via NextAuth.

### Solusi

Unifikasi ke 1 sumber auth (NextAuth):

1. NextAuth `jwt()` callback generate `backendToken` (JWT ditandatangani dengan `NEXTAUTH_SECRET`, terpisah dari token internal NextAuth/JWE)
2. `backendToken` di-expose lewat `session()` callback
3. Express `authMiddle` diubah dari verifikasi cookie → verifikasi
   header `Authorization: Bearer <token>`, pakai `NEXTAUTH_SECRET` yang sama
4. Frontend kirim `backendToken` sebagai Bearer token di setiap request ke Express (lewat axios instance dengan interceptor)

### Pembelajaran

Saat mengintegrasikan NextAuth dengan backend terpisah, tentukan sejak awal: apakah backend generate token sendiri (butuh mekanisme forward cookie), atau backend hanya verifikasi token yang dibuat NextAuth (lebih simpel, satu sumber kebenaran). Opsi kedua lebih disarankan kalau NextAuth sudah jadi lapisan auth utama di frontend.

---

## [MINOR] OAuth Button Hilang Saat Redesign UI

**Ditemukan:** Week 1 Day 7
**Status:** ✅ Fixed

Tombol Google Sign-In sempat hilang dari halaman login/register saat redesign split-screen layout (Day 6). Ditambahkan kembali secara terpisah dari form Credentials, dengan separator visual.

**Pembelajaran:** saat redesign UI besar, buat checklist elemen fungsional (bukan cuma visual) yang harus tetap ada, supaya tidak ada elemen yang "kelewat" saat copy-paste struktur baru.
