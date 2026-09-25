export const CHAT_SUGGESTIONS = Object.freeze([
  'Cara cek makanan',
  'Apa itu kalori?',
  'Cari resep sehat',
]);

export const CHAT_FALLBACK =
  'Aku belum mengenali topik itu. Coba tanyakan tentang kalori, protein, resep sehat, atau cara cek makanan.';

const INTENTS = Object.freeze([
  {
    id: 'greeting',
    patterns: ['halo', 'hai', 'hello', 'hi', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam'],
    response:
      'Hai! Aku Teman NutLens. Aku bisa membantu menjelaskan fitur NutLens dan topik nutrisi dasar yang sudah disiapkan.',
  },
  {
    id: 'help',
    patterns: ['bantuan', 'bisa apa', 'fitur apa', 'topik apa', 'cara pakai'],
    response:
      'Kamu bisa bertanya tentang cara cek makanan, kalori, protein, karbohidrat, lemak, serat, gula, hidrasi, sarapan, dan resep sehat.',
  },
  {
    id: 'food-analysis',
    patterns: ['cara cek makanan', 'cek makanan', 'analisis makanan', 'analisis gizi', 'foto makanan', 'scan makanan', 'nutri scan'],
    response:
      'Buka halaman Cek Makanan, pilih foto JPG, PNG, atau WebP, lalu jalankan analisis untuk melihat ringkasan nutrisi dan rekomendasi resep.',
  },
  {
    id: 'recipes',
    patterns: ['cari resep sehat', 'resep sehat', 'resep', 'ide masak', 'menu sehat', 'galeri resep'],
    response:
      'Galeri Resep NutLens berisi pilihan menu sehat yang dapat disaring berdasarkan kategori, waktu memasak, dan kebutuhanmu.',
  },
  {
    id: 'calories',
    patterns: ['apa itu kalori', 'berapa kalori', 'kalori', 'kkal', 'energi makanan'],
    response:
      'Kalori adalah satuan energi dari makanan. Kebutuhan setiap orang berbeda, jadi gunakan informasi kalori sebagai panduan, bukan satu-satunya ukuran kualitas makanan.',
  },
  {
    id: 'protein',
    patterns: ['protein', 'tinggi protein'],
    response:
      'Protein membantu membangun dan memelihara jaringan tubuh. Sumbernya antara lain ikan, telur, ayam, tahu, tempe, kacang, dan produk susu.',
  },
  {
    id: 'carbohydrates',
    patterns: ['karbohidrat', 'karbo', 'carbs'],
    response:
      'Karbohidrat adalah sumber energi utama tubuh. Pilihan seperti nasi merah, oat, kentang, jagung, dan roti gandum juga dapat menyumbang serat.',
  },
  {
    id: 'fat',
    patterns: ['lemak sehat', 'lemak', 'fat'],
    response:
      'Lemak tetap dibutuhkan tubuh. Utamakan sumber seperti ikan, alpukat, kacang, dan minyak zaitun, lalu perhatikan porsinya.',
  },
  {
    id: 'fiber',
    patterns: ['serat', 'fiber'],
    response:
      'Serat banyak ditemukan pada sayur, buah, kacang, dan biji-bijian utuh. Tambahkan secara bertahap dan imbangi dengan cukup air.',
  },
  {
    id: 'sugar',
    patterns: ['gula tambahan', 'gula', 'sugar'],
    response:
      'Periksa gula tambahan pada label makanan dan minuman. Rasa manis juga dapat diperoleh dari buah utuh yang sekaligus memberi serat.',
  },
  {
    id: 'breakfast',
    patterns: ['menu sarapan', 'sarapan', 'breakfast'],
    response:
      'Untuk sarapan yang seimbang, kombinasikan sumber protein, karbohidrat, dan serat. Contohnya telur, roti gandum, dan buah.',
  },
  {
    id: 'hydration',
    patterns: ['air putih', 'hidrasi', 'minum air', 'kurang minum'],
    response:
      'Minum air secara berkala sepanjang hari. Kebutuhan cairan dapat berubah mengikuti aktivitas, cuaca, dan kondisi tubuh.',
  },
  {
    id: 'thanks',
    patterns: ['terima kasih', 'makasih', 'thanks', 'thank you'],
    response:
      'Sama-sama! Pilih salah satu topik yang tersedia kalau kamu ingin melihat panduan NutLens lainnya.',
  },
]);

export function normalizeMessage(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function patternScore(message, pattern) {
  const normalizedPattern = normalizeMessage(pattern);
  const paddedMessage = ` ${message} `;
  const paddedPattern = ` ${normalizedPattern} `;

  if (!paddedMessage.includes(paddedPattern)) return -1;

  const wordCount = normalizedPattern.split(' ').length;
  const exactBonus = message === normalizedPattern ? 20 : 0;
  return exactBonus + (wordCount * 4) + (normalizedPattern.length / 100);
}

export function findPreparedReply(value) {
  const message = normalizeMessage(value);
  if (!message) return null;

  let selected = null;
  let selectedScore = -1;

  INTENTS.forEach((intent) => {
    intent.patterns.forEach((pattern) => {
      const score = patternScore(message, pattern);
      if (score > selectedScore) {
        selected = intent;
        selectedScore = score;
      }
    });
  });

  return selected
    ? { intent: selected.id, response: selected.response }
    : { intent: 'fallback', response: CHAT_FALLBACK };
}
