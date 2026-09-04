/**
 * NutLens Recipe Detail Controller (resep-detail.mjs)
 * Manages Dynamic Recipe Data, Interactive Bookmarks, and Animations
 */

import { RECIPES_DATA } from './resep-galeri.mjs';

// Extended Recipe Detail Database matching NutLens Design Specs & Reference
export const RECIPE_DETAIL_MAP = {
  'pepes-ayam': {
    id: 'pepes-ayam',
    title: 'Pepes Ayam',
    breadcrumbTitle: 'Pepes Ayam Sehat',
    heroImage: '../images/recipes/pepes-ayam.jpg',
    description:
      'Pepes ayam adalah makanan sehat karena dimasak tanpa minyak melalui pengukusan dengan daun pisang, kaya protein berkualitas tinggi, serta sarat antioksidan dari limpahan bumbu rempah alami.',
    calories: '310 kkal',
    cookTime: '25 Menit',
    servings: '1 Porsi',
    ingredients: [
      '800 gr/ 1 ekor ayam',
      '2 ikat daun kemangi',
      '2 lembar daun salam',
      '1 batang serai besar,',
      '6 cabai rawit merah, diiris',
      'garam, kaldu bubuk',
      'daun pisang'
    ],
    spices: [
      '8 bawang merah',
      '4 bawang putih',
      '3 kemiri',
      '1 ruas kunyit',
      '1 ruas jahe',
      'lengkuas memarkan'
    ],
    benefits: [
      {
        title: 'Ayam Tanpa Kulit',
        desc: 'Sumber protein tinggi rendah lemak untuk massa otot.'
      },
      {
        title: 'Bumbu Rempah',
        desc: 'Kaya antioksidan alami untuk memperkuat sistem imun.'
      }
    ],
    nutrition: [
      { key: 'protein', name: 'Protein', value: '22 g/60g', percent: 36.6 },
      { key: 'calories', name: 'Kalori', value: '220/2,000kkal', percent: 11.0 },
      { key: 'carbs', name: 'Karbohidrat', value: '6g/300g', percent: 2.0 },
      { key: 'fat', name: 'Lemak', value: '11g/60g', percent: 18.3 },
      { key: 'fiber', name: 'Serat', value: '1,5g/30g', percent: 5.0 },
      { key: 'sugar', name: 'Gula', value: '1g/50g', percent: 2.0 }
    ],
    nutriLevel: {
      grade: 'A',
      tag: 'VES: suka konsumsi',
      title: 'Nutri-Level',
      desc: 'sangat sehat dan kaya serat alami, berkat metode pengukusan tanpa minyak, kandungan protein tinggi.'
    },
    steps: [
      {
        number: 1,
        title: 'Memotong Ayam',
        desc: 'Ayam dipotong ukuran besar bisa 7 potong, kemudian dicuci bersih dan disayat-sayat bagian dada agar bumbu meresap.',
        image: '../images/recipes/chicken-soup.jpg'
      },
      {
        number: 2,
        title: 'Ungkep Ayam Dengan Bumbu Rempah',
        desc: 'Ungkep ayam dengan bumbu halus, kalau saya bumbu tanpa ditumis. Masukkan salam, serai, garam & kaldu bubuk. Tunggu sampai air surut dan koreksi rasa.',
        image: '../images/recipes/ikan-kuah-kuning.jpg'
      },
      {
        number: 3,
        title: 'Bungkus & Kukus Ayam',
        desc: 'Setelah air menyusut, matikan api. Bungkus ayam dengan daun pisang, tambahkan daun kemangi dan irisan cabai rawit, kemudian kukus selama kurang lebih 20 menit hingga daun layu.',
        image: '../images/recipes/pepes-ayam.jpg'
      },
      {
        number: 4,
        title: 'Pepes Ayam, lalu Sajikan',
        desc: 'Panaskan panggangan, kemudian panggang pepes ayam agar bumbu lebih meresap dan tidak berair. Angkat dan sajikan',
        image: '../images/recipes/tempe-bakar.jpg'
      }
    ],
    nutritionTips:
      'Pepes ayam merupakan pilihan menu yang lebih sehat karena dimasak dengan cara dikukus sehingga tidak memerlukan banyak minyak. Tambahkan daun kemangi dan cabai untuk memberikan aroma,dan cita rasa yang lebih segar.',
    aiAnalysis:
      'Resep ini tinggi protein dan rendah minyak, sehingga cocok untuk menu makan sehat sehari-hari.',
    priceEstimate: 'Rp 16.500'
  }
};

/**
 * Helper to show toast message
 */
function showToast(message, icon = 'bookmark_added') {
  let toast = document.getElementById('recipe-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'recipe-toast';
    toast.className = 'recipe-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined recipe-toast__icon" aria-hidden="true">${icon}</span>
    <span>${message}</span>
  `;

  toast.classList.add('is-visible');

  if (window._toastTimeout) {
    clearTimeout(window._toastTimeout);
  }

  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3000);
}

/**
 * Initializes Bookmark Functionality
 */
function initBookmark(recipeId = 'pepes-ayam') {
  const bookmarkBtn = document.getElementById('recipe-bookmark-btn');
  if (!bookmarkBtn) return;

  const storageKey = `nutlens_saved_recipe_${recipeId}`;
  let isSaved = localStorage.getItem(storageKey) === 'true';

  const updateState = (saved) => {
    bookmarkBtn.classList.toggle('is-bookmarked', saved);
    bookmarkBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
    const icon = bookmarkBtn.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = saved ? 'bookmark' : 'bookmark_border';
    }
  };

  updateState(isSaved);

  bookmarkBtn.addEventListener('click', () => {
    isSaved = !isSaved;
    localStorage.setItem(storageKey, isSaved ? 'true' : 'false');
    updateState(isSaved);

    if (isSaved) {
      showToast('Resep berhasil disimpan ke koleksi favorit!', 'bookmark_added');
    } else {
      showToast('Resep dihapus dari koleksi favorit.', 'bookmark_remove');
    }
  });
}

/**
 * Animate progress bars on scroll or mount
 */
function animateNutritionBars() {
  const bars = document.querySelectorAll('.recipe-macro-item__bar-fill');
  bars.forEach((bar) => {
    const targetWidth = bar.dataset.targetWidth || bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 200);
  });
}

/**
 * Main Controller Bootstrapper
 */
export function initRecipeDetail(root = document) {
  // Read recipe id from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id') || 'pepes-ayam';

  initBookmark(recipeId);
  animateNutritionBars();
}

// Auto-boot on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initRecipeDetail(document));
  } else {
    initRecipeDetail(document);
  }
}
