# NutLens Mobile Hero Design

## Scope

Perubahan hanya menyempurnakan tampilan Hero landing page NutLens pada viewport mobile. HTML, JavaScript, navbar, urutan konten, warna, teks, section lain, compact desktop, baseline desktop, dan large desktop tidak berubah.

Seluruh aturan produksi ditempatkan di media query `@media (max-width: 48rem)` yang sudah ada dalam `assets/css/landing-page.css`. Pendekatan ini menjaga kepemilikan style section tetap konsisten dan menghindari breakpoint mobile yang terduplikasi.

## Responsive contract

- Mode mobile aktif sampai lebar `48rem` atau 768 CSS pixels.
- Viewport utama untuk verifikasi adalah `320 x 568`, `360 x 800`, `375 x 667`, `390 x 844`, dan `430 x 932` pada browser zoom 100%.
- Hero memakai tinggi berdasarkan konten dengan `height: auto` dan `min-height: auto`; Hero tidak dipaksa memenuhi `100vh` atau `100dvh` pada mobile.
- Container mempertahankan gutter horizontal token proyek sehingga tidak menimbulkan horizontal overflow.
- Aturan desktop mulai 769px tidak boleh berubah.

## Layout

Konten Hero tetap berada dalam normal document flow dan memakai susunan flex column yang sudah ada:

1. rating;
2. teks rekomendasi;
3. heading;
4. deskripsi;
5. CTA utama.

Pada mobile, transform vertikal desktop pada `.hero__content` dinetralkan agar posisi konten ditentukan oleh margin dan spacing token. Semua konten tetap rata tengah dan memiliki lebar maksimum yang mencegah teks menyentuh gutter.

Jarak dari navbar ke rating menggunakan spacing Hero sebesar `var(--space-10)`. Jarak internal antarbagian memakai token spacing yang sudah tersedia, tanpa margin negatif atau posisi absolut.

## Typography

- Heading memakai `font-size: clamp(2rem, 9vw, 2.375rem)`, menghasilkan rentang 32 sampai 38 CSS pixels.
- Heading tetap menggunakan weight, warna, letter spacing, dan font family yang sudah ada.
- Lebar heading dibatasi agar pemenggalan baris tetap seimbang pada layar 320 sampai 430px dan tidak overflow.
- Deskripsi dibatasi sekitar 34 karakter per baris, tetap rata tengah, dan menggunakan typography body yang sudah ada.
- Rating dan teks rekomendasi mempertahankan ukuran dan semantik saat ini.

## CTA

- `.hero__cta--secondary` disembunyikan hanya pada mode mobile.
- `.hero__actions` menjadi selebar container dan tidak memerlukan wrapping karena hanya CTA utama yang terlihat.
- `.hero__cta--primary` menggunakan `width: 100%` dan `min-height: 3.5rem` agar target sentuh tetap nyaman.
- Focus indicator dan destination link CTA tidak berubah.

## Artwork

`.hero__artwork` disembunyikan dengan `display: none` pada mobile. Karena ghost card merupakan pseudo-element milik frame di dalam wrapper tersebut, seluruh actual image dan ghost card ikut tidak dirender tanpa menambah selector atau mengubah markup.

Artwork kembali memakai aturan yang ada pada viewport di atas 48rem. Tidak ada perubahan pada ukuran, crop, `object-fit`, atau posisi artwork desktop.

## Accessibility and overflow safety

- Rating tetap memiliki teks aksesibel `5 dari 5 bintang`.
- CTA utama tetap berupa anchor semantik dan mempertahankan focus outline.
- Elemen yang disembunyikan tidak menyisakan ruang kosong atau target fokus.
- Lebar Hero, content, heading, deskripsi, actions, dan CTA tidak boleh membuat `scrollWidth` melebihi `innerWidth`.
- Tidak ada `position: absolute`, `zoom`, atau `transform: scale` pada layout mobile.

## Files

- Modify `assets/css/landing-page.css` untuk override mobile Hero.
- Add `tests/mobile-hero.test.mjs` untuk kontrak CSS mobile dan proteksi desktop.

Tidak ada perubahan pada `index.html`, JavaScript produksi, `assets/css/global.css`, atau file section lain.

## Verification

Pengujian mengikuti red-green cycle:

1. Tambahkan test yang gagal untuk kontrak mobile sebelum mengubah CSS.
2. Implementasikan override minimum sampai test lulus.
3. Jalankan test mobile Hero dan seluruh test yang sudah ada.
4. Jalankan pemeriksaan sintaks dan `git diff --check`.
5. Verifikasi browser pada lima viewport mobile target bahwa artwork dan CTA secondary tersembunyi, CTA primary selebar container, heading tidak terpotong, spacing tetap konsisten, dan tidak ada horizontal overflow.
6. Periksa viewport 769px, compact desktop, baseline desktop, dan large desktop untuk memastikan aturan mobile tidak bocor dan artwork desktop tetap tampil.

Acceptance criteria terpenuhi ketika kelima viewport mobile menampilkan rating, heading, deskripsi, dan satu CTA utama secara utuh dalam normal flow tanpa overflow, sedangkan seluruh tampilan di atas 48rem tetap mengikuti layout yang ada.
