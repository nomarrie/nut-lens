# Cek Makanan Hero Design

**Status:** Disetujui pada 21 Juli 2026  
**Scope:** Navbar global dan Hero halaman Cek Makanan saja

## Tujuan

Mengganti placeholder halaman Cek Makanan dengan Hero responsif yang mengarahkan pengguna menuju proses analisis nutrisi, tanpa mengimplementasikan upload maupun hasil analisis pada pekerjaan ini.

## Batasan

- Tidak mengubah `index.html`, `assets/css/global.css`, `assets/css/landing-page.css`, komponen navbar global, profile dropdown, mobile drawer, footer, token, atau halaman lain.
- Tidak menambahkan library maupun JavaScript halaman baru.
- Menggunakan HTML semantik, custom CSS, font Outfit, Material Symbols, token global, dan aset gambar yang sudah tersedia.
- CTA memakai `href="#upload-makanan"` sebagai kontrak untuk section upload yang akan ditambahkan pada pekerjaan berikutnya.

## Struktur File

- Ubah `assets/pages/cek-makanan.html` menjadi halaman lengkap.
- Buat `assets/css/cek-makanan.css` untuk seluruh styling khusus Hero.
- Buat `tests/check-food-page.test.mjs` untuk kontrak struktur, accessibility, path, performa gambar, dan responsive layout.

## Shell dan Navigasi

Halaman memuat `global.css` terlebih dahulu dan `cek-makanan.css` setelahnya. Navbar menggunakan markup dan perilaku global yang sama dengan landing page, tetapi seluruh URL disesuaikan dari direktori `assets/pages/`. Script yang dimuat hanya modul navbar, profile dropdown, dan mobile navigation yang sudah tersedia.

Karena Cek Makanan berada di dalam menu Layanan, tautan Beranda tidak memakai `aria-current`. Tautan Cek Makanan pada submenu desktop dan mobile memakai `aria-current="page"`.

## Hero Desktop

`scan-hero` menggunakan tinggi berbasis konten dan container responsif maksimum 1280px. `scan-hero__layout` memakai CSS Grid dua kolom dengan kolom visual maksimum 528px dan gap yang menggunakan token atau `clamp()`.

Kolom kiri berisi badge, `h1`, deskripsi, dan satu CTA. Heading mempertahankan tiga baris desain dan menggunakan Material Symbol `nutrition` yang sama dengan logo navbar sebagai logo inline dekoratif.

Kolom kanan memuat gambar utama di dalam frame berasio `528 / 576`. Aset `assets/images/problem/Foto junk food.webp` dipakai dengan `object-fit: cover`, sehingga gambar dipotong secara proporsional dan tidak diregangkan.

Dua information card diposisikan absolute relatif terhadap `scan-hero__visual`. Card Akurasi berada di kiri-atas, sedangkan Scan Instan berada di kanan-bawah. Wrapper visual menyediakan ruang aman agar offset card tidak menyebabkan horizontal overflow.

## Tablet dan Mobile

Pada tablet lebar, grid dua kolom dipertahankan dengan heading, gap, dan card yang mengecil secara terkendali. Ketika ruang tidak lagi aman, layout berubah menjadi satu kolom dengan content lebih dulu dan visual setelahnya.

Pada mobile:

- teks dan badge rata tengah;
- CTA memenuhi lebar container;
- gambar memenuhi lebar yang tersedia;
- kedua information card keluar dari absolute positioning dan disusun dalam normal document flow di bawah gambar;
- tidak ada elemen yang menjorok keluar viewport.

## Accessibility dan Performa

- Section memakai `aria-labelledby` yang menunjuk ke `h1`.
- Ikon dekoratif memakai `aria-hidden="true"`.
- Nilai `99%` selalu tersedia sebagai teks.
- Gambar memiliki alt relevan, dimensi intrinsik, `decoding="async"`, dan `fetchpriority="high"`; gambar Hero tidak memakai lazy loading.
- CTA mempertahankan focus-visible yang jelas.
- Tidak ada `href="#"`.

## Pengujian

Verifier khusus memastikan:

1. metadata dan urutan semantic Hero benar;
2. navbar serta modul global digunakan dengan path nested yang valid;
3. CTA mengarah ke `#upload-makanan`;
4. gambar mempunyai kontrak accessibility dan performa;
5. desktop menggunakan grid dua kolom dan floating cards relatif terhadap wrapper visual;
6. mobile menggunakan satu kolom, CTA penuh, dan cards kembali ke normal flow;
7. global, landing page, serta JavaScript existing tidak berubah.

