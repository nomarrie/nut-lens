# NutLens Mobile Problems Design

## Scope

Perubahan hanya menyempurnakan responsive CSS section Problem/Permasalahan pada landing page NutLens. Navbar, Hero, section Solution dan section lain, HTML, JavaScript, copy, aset, warna global, typography global, serta layout desktop dan tablet tidak berubah.

Seluruh override layout mobile ditempatkan di `assets/css/landing-page.css` pada breakpoint proyek `@media (max-width: 48rem)`. Efek hover desktop dibatasi terpisah dengan media capability `@media (hover: hover) and (pointer: fine)`.

## Spacing contract

- Hero mobile yang sudah ada memiliki `margin-bottom: var(--space-24)`, setara 96px.
- Margin tersebut menjadi satu-satunya sumber jarak dari akhir konten Hero ke eyebrow Problem.
- Pada mobile, Problem menggunakan `padding-block-start: 0` agar jarak tidak bertumpuk dengan margin Hero.
- Problem menggunakan `padding-block-end: var(--space-24)` untuk memberi jarak 96px menuju section berikutnya.
- Tidak ada margin negatif, `position: absolute`, atau nilai tetap besar untuk mengatur pergantian section.

## Mobile layout

Pada viewport sampai 48rem, `.problems__layout` memakai satu kolom dengan urutan markup yang sudah ada:

1. eyebrow "PERMASALAHAN";
2. heading;
3. gambar Problem;
4. tiga Problem Card.

Semua elemen berada dalam normal document flow dan rata kiri. Container mempertahankan gutter `var(--space-4)` yang sama dengan Hero sehingga tidak memakai `100vw` dan tidak menimbulkan horizontal overflow.

## Heading and eyebrow

- Heading menggunakan lebar penuh dengan `max-width: 12ch`.
- Ukuran heading memakai `clamp(2rem, 8.5vw, 2.5rem)`, line-height `1.08`, dan letter-spacing `-0.02em`.
- Heading tetap rata kiri dan accent "Gizi" tetap memakai warna primary yang sudah ada.
- Eyebrow memakai `clamp(0.6875rem, 2.8vw, 0.75rem)` dan letter-spacing `0.08em`.
- Jarak eyebrow ke heading menggunakan `var(--space-6)` atau 24px.

## Image

- `.problems__media` memakai `width: 100%`, tanpa batas lebar desktop pada mobile.
- Rasio `608 / 432`, `overflow: hidden`, dan `object-fit: cover` dipertahankan.
- Jarak heading ke gambar menggunakan `var(--space-8)` atau 32px tanpa mengubah crop.
- Radius tetap berasal dari token proyek dan gambar tidak boleh melampaui container.

## Problem Cards

- `.problems__list` menjadi satu kolom dengan gap `var(--space-4)` atau 16px.
- Jarak gambar ke daftar card menggunakan `var(--space-8)` atau 32px.
- Setiap card memakai `width: 100%`, `height: auto`, dan padding responsif `clamp(var(--space-5), 5vw, var(--space-6))`.
- Grid ikon dan konten dipertahankan, tetapi gap menyesuaikan layar mobile.
- Judul card memakai `clamp(1.125rem, 4.8vw, 1.375rem)` dengan line-height `1.2`.
- Deskripsi memakai `clamp(0.875rem, 3.6vw, 1rem)` dengan line-height `1.5`.
- Informasi selalu terlihat tanpa interaksi dan tinggi card mengikuti konten.

## Hover capability

Semua perubahan visual hover Problem Card hanya berlaku di dalam:

```css
@media (hover: hover) and (pointer: fine) {
  /* background, icon background, translate, and shadow */
}
```

Pada perangkat tanpa hover presisi:

- background card tetap putih;
- background ikon tetap pada kondisi default;
- tidak ada translate, shadow, perubahan warna, atau transition hover;
- card pertama tidak memiliki state active/hover bawaan;
- tidak ada JavaScript pendeteksi perangkat.

Karena markup saat ini tidak memiliki kontrol interaktif di dalam card, `:focus-within` tidak dipakai untuk memicu dekorasi hover. Jika kontrol interaktif ditambahkan kemudian, focus indicator harus ditangani secara aksesibel tanpa mengandalkan warna card saja.

## Files

- Modify `assets/css/landing-page.css` untuk responsive Problem dan pembatasan hover capability.
- Add `tests/mobile-problems.test.mjs` untuk kontrak CSS mobile dan proteksi aturan desktop.

Tidak ada perubahan pada `index.html`, JavaScript produksi, `assets/css/global.css`, Hero, atau section lain.

## Verification

Pengujian mengikuti red-green cycle:

1. Tambahkan test yang gagal untuk kontrak spacing, typography, image, card, dan hover capability.
2. Implementasikan override minimum hingga test lulus.
3. Jalankan test mobile Problem, test mobile Hero, test mobile navigation, serta pemeriksaan sintaks dan `git diff --check`.
4. Verifikasi browser pada `320 x 568`, `360 x 800`, `375 x 667`, `390 x 844`, dan `430 x 932`.
5. Pada setiap viewport periksa jarak 96px dari Hero, heading tidak overflow, gambar tidak terdistorsi, card tidak terpotong, hover tidak menempel, dan tidak ada horizontal scrollbar.
6. Periksa 769px, tablet, dan desktop untuk memastikan layout dan hover desktop tetap berlaku.

Acceptance criteria terpenuhi ketika Problem mobile tersusun satu kolom, rata kiri, memiliki heading 32 sampai 40px, gambar rasio 608:432, card dengan tinggi intrinsik, jarak section yang tidak bertumpuk, serta tidak memiliki state hover visual pada perangkat sentuh.
