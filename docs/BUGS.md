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

## Week 2 — Category, Currency, Transaction CRUD

### Bug 1: Prisma Client `default export` vs `named import`

**Gejala:** `TypeError: Cannot read properties of undefined (reading 'category')`
**Penyebab:** `lib/prisma.ts` menggunakan `export default prisma`, tapi controller mengimpor dengan `import { prisma } from "../lib/prisma"` (named import). Akibatnya `prisma` bernilai `undefined`.
**Fix:** Konsisten gunakan `import prisma from "../lib/prisma"` (default import) di semua controller.
**Pelajaran:** Selalu cocokkan gaya `export default` dengan `import` tanpa kurung kurawal, dan `export const`/`export {}` dengan `import { }`.

### Bug 2: SQLSTATE error code vs Prisma error code (`error.cause.code` vs `error.code`)

**Gejala:** `DELETE /api/categories/:id` pada kategori yang masih punya transaksi terkait mengembalikan 500 generic, bukan 409 yang diharapkan.
**Penyebab:** Karena project menggunakan driver adapter (`@prisma/adapter-pg`), error `RESTRICT` constraint violation dari PostgreSQL muncul sebagai raw SQLSTATE code (`23001`) di `error.cause.code` — bukan kode Prisma standar (`P2003`) di `error.code`. Sebaliknya, error `unique constraint` (`P2002`) tetap muncul di `error.code` seperti biasa karena itu kode buatan Prisma sendiri.
**Fix:** Cek `error.cause?.code === "23001"` untuk constraint violation dari database, terpisah dari `error.code === "P2002"` untuk error yang dideteksi Prisma sendiri.
**Pelajaran:** Tidak semua error Prisma punya format yang sama — tergantung apakah errornya terdeteksi oleh layer Prisma atau bocor mentah dari database. Saat pakai driver adapter, selalu `console.error` raw error object dulu sebelum menebak struktur errornya.

### Bug 3: Trailing slash & double `/api` pada `NEXT_PUBLIC_API_URL`

**Gejala:** `POST http://localhost:5000//api/auth/login` (double slash) → 404; atau `GET http://localhost:5000/categories` (tanpa `/api`) → 404.
**Penyebab:** Dua tempat berbeda (`lib/api.ts` untuk axios instance, `route.ts` untuk NextAuth) punya asumsi berbeda soal apakah `NEXT_PUBLIC_API_URL` sudah termasuk `/api` atau belum. Ditambah ada trailing slash (`http://localhost:5000/`) yang menyebabkan double slash saat digabung dengan path lain.
**Fix:** `NEXT_PUBLIC_API_URL` disepakati **tanpa** `/api` dan **tanpa** trailing slash (`http://localhost:5000`). `lib/api.ts` menambahkan `/api` sendiri di `baseURL`.
**Pelajaran:** Base URL environment variable harus punya **satu** konvensi yang disepakati di seluruh project (dengan atau tanpa trailing path/slash), didokumentasikan di `.env.example`, agar tidak ada asumsi yang saling bertentangan antar file.

### Bug 4: Data korup di Prisma Studio — `id` tersimpan sebagai string kosong

**Gejala:** Tombol Edit/Delete pada 1 baris transaksi tertentu tidak merespons klik sama sekali, sementara baris lain normal.
**Penyebab:** Saat membuat data manual di Prisma Studio untuk testing sebelumnya, field `id` (yang seharusnya dikosongkan agar `@default(cuid())` menghasilkan id otomatis) malah tersimpan sebagai string kosong literal (`""`), bukan ter-generate.
**Fix:** Hapus manual record dengan id kosong itu dari Prisma Studio.
**Pelajaran:** Saat membuat data manual di Prisma Studio untuk field yang punya `@default()`, verifikasi ulang hasil `id`-nya setelah save — jangan asumsikan field kosong otomatis ter-generate.

### Bug 5: `include: { category: true }` tertinggal di `createTransaction`

**Gejala:** `TypeError: Cannot read properties of undefined (reading 'color')` saat merender transaksi yang baru dibuat di frontend.
**Penyebab:** `getTransactions` (list) sudah punya `include: { category: true }`, tapi `createTransaction` (create) belum ditambahkan — sehingga response dari `POST` cuma berisi `categoryId` (string), bukan object `category` lengkap.
**Fix:** Tambahkan `include: { category: true }` juga di `prisma.transaction.create()`.
**Pelajaran:** Kebutuhan `include` relasi bisa berbeda tergantung siapa konsumennya (testing manual via Thunder Client vs frontend yang butuh render UI). Requirement baru dari frontend bisa "membongkar" asumsi lama di backend yang sebelumnya dianggap sudah cukup.

### Bug 6: `orderByMap` dibuat tapi tidak dipakai (hardcoded `orderBy`)

**Gejala:** Filter `?sort=amount_desc` tidak berpengaruh sama sekali — hasil selalu terurut berdasarkan tanggal terbaru.
**Penyebab:** `orderBy: { date: "desc" }` di-hardcode langsung di `findMany`, padahal `orderByMap[sort]` sudah dibuat untuk menerjemahkan pilihan sort dari query param.
**Fix:** Ganti jadi `orderBy: orderByMap[sort]`.
**Pelajaran:** Membuat mapping/helper tidak otomatis berarti sudah "terpakai" — selalu cek titik pemanggilan akhirnya, terutama saat menambahkan fitur di atas kode yang sudah ada.

### Bug 7: `useCallback` tidak diimpor

**Gejala:** `ReferenceError: useCallback is not defined` saat menambahkan custom hook `useUpdateFilters`.
**Penyebab:** Hook baru ditambahkan tanpa memperbarui baris import dari `"react"`.
**Fix:** `import { useState, useEffect, useCallback } from "react"`.
**Pelajaran:** Setiap kali menambahkan hook React baru ke dalam kode, cek ulang baris import di paling atas file — ini kesalahan yang mudah terlewat karena editor tidak selalu langsung menyorotnya sampai kode dijalankan.

### Bug 8: Fetch data duplikat/race condition dari 2 `useEffect` berbeda

**Gejala:** List transaksi kadang tidak konsisten (kadang ke-filter, kadang tidak) saat halaman pertama kali dibuka.
**Penyebab:** Ada fungsi lama (`loadInitialData`) dan fungsi baru (`fetchTransactions`) yang keduanya fetch data Transaction di `useEffect` terpisah dengan dependency `[]`, berjalan hampir bersamaan — hasil "siapa yang menang" (nampil terakhir) jadi tidak pasti.
**Fix:** Hapus `loadInitialData` sepenuhnya, sisakan `fetchCategories` dan `fetchTransactions` yang sudah terintegrasi dengan filter dari URL.
**Pelajaran:** Saat merefactor/menambah fitur baru, hapus kode lama yang fungsinya sudah digantikan — jangan biarkan keduanya hidup berdampingan, meski sepertinya "tidak masalah, toh keduanya fetch data yang sama".

### Bug 9: Default value query param kosong (`""`) lolos ke backend, gagal validasi Zod

**Gejala:** `400 Bad Request` pada `GET /api/transactions` setiap kali halaman pertama kali dibuka (sebelum user memilih filter apapun).
**Penyebab:** `sort` dan `page` di-default ke `""` (bukan `"date_desc"` / `"1"`) di `useFilters()`, lalu dikirim ke API tanpa pengecekan kondisional — beda dari filter lain yang sudah dibungkus `...(filters.xxx && {...})`.
**Fix:** Default value yang sesuai skema backend (`sort: "date_desc"`, `page: "1"`).
**Pelajaran:** Default value di frontend harus selalu dicocokkan dengan default value/ekspektasi skema validasi di backend, terutama untuk field yang wajib dikirim (bukan truly optional).
