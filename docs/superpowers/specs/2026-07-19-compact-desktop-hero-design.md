# Compact Desktop Hero Design

## Scope

Perubahan hanya berlaku pada Hero landing page NutLens. Navbar, konten Hero, urutan elemen, gambar asli, section lain, dan JavaScript tidak berubah.

## Viewport contract

- Compact desktop aktif pada lebar desktop mulai `64rem` dan tinggi viewport maksimal `42.5rem` (680px).
- Target utama: `1366 × 650` dan `1536 × 650` CSS pixels pada zoom 100%.
- Baseline `1536 × 738` tidak boleh terkena aturan compact dan harus mempertahankan geometri desain saat ini.
- Layout tidak boleh menimbulkan horizontal overflow.

## Layout approach

HTML saat ini memisahkan `.hero__content` dan `.hero__artwork`, sehingga heading dan kartu samping tidak dapat ditempatkan pada grid row yang sama tanpa merombak markup. Implementasi memakai pendekatan CSS minimal:

1. Sembunyikan pseudo-element ghost card milik outer dan side dengan `content: none` hanya pada compact desktop.
2. Samakan layout awal keempat frame samping dengan `align-self: start` dan hilangkan perbedaan `margin-bottom` pada outer dan side di compact mode.
3. Gunakan satu custom property Hero, `--hero-compact-side-offset`, sebagai offset vertikal bersama untuk outer kiri, side kiri, side kanan, dan outer kanan.
4. Tentukan nilai offset dari selisih aktual antara posisi atas heading dan posisi atas frame setelah alignment disamakan. Nilai harus dinyatakan menggunakan token spacing proyek apabila hasil pengukuran memungkinkan.
5. Main image tidak memakai offset compact dan tetap berada pada kolom tengah di bawah CTA.

Pendekatan ini dipilih karena menjaga HTML dan baseline tetap stabil, sekaligus menghapus offset outer/side yang berbeda.

## Alignment and collision rules

- Tepi atas keempat actual side image harus sama, dengan toleransi maksimum 1 CSS pixel.
- Tepi atas tersebut harus sejajar dengan tepi atas heading, dengan toleransi maksimum 1 CSS pixel pada kedua viewport target.
- Keempat kartu tetap berada di dua track kiri dan dua track kanan.
- Area gambar tidak boleh beririsan dengan rating, heading, deskripsi, atau CTA.
- Jarak horizontal antara kartu terdekat dan area heading minimal satu `var(--space-4)`.
- Gambar asli tetap memakai `object-fit: cover`, ukuran frame yang sudah ada, dan border radius desain.

## Baseline protection

Media query compact ditentukan oleh tinggi `max-height: 42.5rem`, bukan query lama `max-height: 51.25rem`. Karena baseline memiliki tinggi 738px, aturan compact tidak aktif pada `1536 × 738`.

Geometri berikut harus tetap sama pada baseline sebelum dan sesudah perubahan:

- lebar Hero/container;
- posisi dan ukuran content;
- margin CTA;
- posisi outer, side, dan main image;
- ghost card tetap terlihat;
- tidak ada horizontal overflow.

## Verification

Pengujian dilakukan pada zoom 100% dengan viewport:

- `1366 × 650`: compact aktif, ghost card hilang, empat side image sejajar dengan heading, main image tidak ikut naik;
- `1536 × 650`: perilaku compact identik;
- `1536 × 738`: compact tidak aktif dan geometri baseline tidak berubah;
- `1600 × 900`: aturan large desktop yang sudah ada tetap bekerja;
- pemeriksaan `scrollWidth <= innerWidth` pada seluruh viewport.

Pengujian statis memastikan hanya satu custom property offset yang dipakai oleh outer dan side pada compact mode. Pengujian browser membandingkan bounding rectangle heading, keempat frame samping, main image, dan area teks/CTA.
