# Profile Dropdown Navbar Design

## Scope

Perubahan hanya mencakup area profil di sisi kanan navbar landing page NutLens dan satu halaman tujuan profil kosong. Navigasi kiri, logo tengah, dimensi dan posisi navbar, dropdown Layanan, Hero, section lain, serta interaksi JavaScript yang sudah ada tidak boleh berubah.

File implementasi yang direncanakan:

- `index.html`: mengganti placeholder Profil dengan trigger, panel identitas, dan aksi dropdown;
- `assets/css/global.css`: menambahkan style khusus Profile Dropdown;
- `assets/js/profile-dropdown.mjs`: mengelola state dan interaksi dropdown secara terisolasi;
- `assets/pages/profil.html`: halaman tujuan valid dengan konten utama kosong;
- `tests/verify-site.mjs`: menambahkan kontrak markup, aksesibilitas, dan perilaku.

## Identity and assets

- Nama pengguna: `Denny Pramana`.
- Email: `denprama@email.com`.
- Avatar sementara: `assets/images/testimonial/Bang Raka.webp`.
- Avatar trigger berukuran sekitar 40px dan avatar panel sekitar 48px.
- Gambar memakai `object-fit: cover` dan bentuk lingkaran tanpa mengubah file aset asli.
- Karena avatar menyertai nama pengguna yang tersedia sebagai teks, `alt` gambar dibuat kosong agar screen reader tidak mengulang identitas.

## Markup and semantics

`.navbar__profile` menjadi wrapper relatif dengan atribut `data-profile-dropdown`. Di dalamnya terdapat:

1. `<button type="button">` sebagai disclosure trigger dengan:
   - `aria-expanded="false"`;
   - `aria-controls="profile-menu"`;
   - accessible name yang menyebut menu profil Denny Pramana;
   - avatar dan Material Symbol `expand_more` sebagai konten visual.
2. Panel `#profile-menu` yang diawali atribut `hidden`.
3. Blok identitas berisi avatar, nama, dan email.
4. Divider dekoratif.
5. Tautan Profile dengan ikon `person` menuju `assets/pages/profil.html`.
6. Tombol Logout dengan ikon `logout`. Karena autentikasi belum tersedia, tombol hanya menutup dropdown dan tidak menampilkan perilaku logout palsu.

Panel tidak menggunakan `role="menu"`. Tautan dan tombol native dipertahankan agar keyboard, fokus, dan semantic behavior bekerja tanpa harus meniru pola menu aplikasi yang lebih kompleks.

## Layout and styling

- `.navbar__profile` menggunakan `position: relative` dan tetap `justify-self: end`.
- Trigger berlatar transparan, tanpa border, dengan target interaksi minimal 44px.
- Panel menggunakan:
  - `position: absolute`;
  - `top: calc(100% + var(--space-3))`, setara jarak 12px pada token project;
  - `right: 0`;
  - z-index dropdown project;
  - `width: min(18.75rem, calc(100vw - (2 * var(--space-4))))`;
  - surface terang, radius 16–20px yang dipetakan ke token terdekat, dan shadow halus yang sudah tersedia.
- Item aksi memiliki tinggi minimum 56px dan hover/focus berupa surface hijau muda tanpa transform atau pergeseran layout.
- Chevron berotasi 180 derajat hanya saat `aria-expanded="true"`.
- Parent navbar saat ini tidak memakai `overflow: hidden`, sehingga panel tidak terpotong dan tidak perlu mengubah overflow navbar.
- Responsive navbar yang sudah ada tetap dipakai. Panel tetap menempel ke kanan trigger dan lebarnya dibatasi oleh viewport.

## Interaction model

`assets/js/profile-dropdown.mjs` hanya menginisialisasi elemen `[data-profile-dropdown]` dan tidak mengubah `navbar.mjs` atau dropdown Layanan.

State dan event:

1. Klik trigger membuka atau menutup dropdown serta menyinkronkan `aria-expanded`.
2. Saat membuka, `hidden` dilepas sebelum class open diterapkan sehingga transisi dapat berjalan.
3. Saat menutup, class open dilepas terlebih dahulu; `hidden` baru dipasang setelah durasi transisi sekitar 200ms.
   Panel segera dibuat `inert` selama fase closing agar aksi yang sudah tidak terlihat tidak tetap menerima fokus.
4. Klik atau pointer down di luar wrapper menutup dropdown.
5. Tombol `Escape` menutup dropdown dan mengembalikan fokus ke trigger.
6. `focusout` menutup dropdown hanya ketika fokus benar-benar meninggalkan wrapper, bukan ketika berpindah ke tautan atau tombol di dalam panel.
7. Memilih Profile menutup state sebelum browser mengikuti tautan.
8. Memilih Logout menutup dropdown tanpa melakukan autentikasi palsu.
9. Timer penutupan dibatalkan apabila dropdown dibuka kembali sebelum animasi selesai, mencegah `hidden` terlambat menutup panel yang sudah dibuka ulang.
10. Initializer mengembalikan fungsi cleanup agar event listener tidak terduplikasi dalam pengujian atau inisialisasi ulang.

## Motion and accessibility

- Transisi memakai opacity dan `translateY` kecil selama sekitar 200ms.
- Pada `prefers-reduced-motion: reduce`, durasi transisi dipersingkat menjadi efektif instan.
- Trigger dan seluruh aksi memakai aturan `:focus-visible` navbar yang sudah ada.
- Kontras teks menggunakan token on-surface project.
- Ikon dekoratif memakai `aria-hidden="true"`.
- Urutan fokus mengikuti DOM: trigger, Profile, lalu Logout.
- Panel tertutup tidak tersedia pada focus tree karena memakai `hidden` setelah transisi selesai.
- Atribut `inert` dilepas saat membuka dan dipasang kembali sebelum animasi penutupan dimulai.

## Empty profile page

`assets/pages/profil.html` menggunakan dokumen HTML5 valid, bahasa Indonesia, metadata viewport, judul halaman, dan stylesheet global. Bagian `<main>` tersedia tetapi kosong sesuai permintaan pengguna. Halaman tidak menambahkan fitur profil, form, autentikasi, atau konten placeholder.

## Verification contract

Pengujian statis memeriksa:

- trigger berupa button dengan `aria-expanded`, `aria-controls`, avatar, dan chevron;
- panel memiliki identitas Denny Pramana dan email yang benar;
- Profile menuju `assets/pages/profil.html` dan Logout berupa button;
- halaman profil tersedia dan memiliki `<main>` kosong;
- CSS memiliki positioning kanan, batas viewport, focus state, animasi, dan reduced motion;
- landing page memuat `profile-dropdown.mjs` tanpa mengubah module navbar yang ada.

Pengujian perilaku memeriksa:

- toggle membuka dan menutup panel;
- sinkronisasi `hidden` dan `aria-expanded`;
- sinkronisasi `inert` selama state tertutup dan closing;
- klik luar menutup panel;
- `Escape` menutup dan mengembalikan fokus;
- perpindahan fokus di dalam panel tidak menutupnya;
- Profile dan Logout menutup state;
- cleanup menghapus event listener;
- timer close tidak menutup state baru setelah dropdown dibuka kembali.

Pengujian browser dilakukan pada desktop dan viewport sempit untuk memastikan panel tidak terpotong, tidak menimbulkan horizontal scrollbar, tidak menggeser navbar atau Hero, dan dropdown Layanan tetap bekerja seperti sebelumnya.
