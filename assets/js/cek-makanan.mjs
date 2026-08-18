const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const FOOD_ANALYSIS_MODELS = {
  salad: {
    protein: '24 g',
    fillProtein: 48,
    calories: '450 kkal',
    fillCalories: 45,
    carbs: '52 g',
    fillCarbs: 40,
    fat: '18 g',
    fillFat: 28,
    fiber: '6 g',
    fillFiber: 25,
    sugar: '5 g',
    fillSugar: 15,
  },
  salmon: {
    protein: '38 g',
    fillProtein: 76,
    calories: '520 kkal',
    fillCalories: 52,
    carbs: '36 g',
    fillCarbs: 28,
    fat: '22 g',
    fillFat: 34,
    fiber: '6 g',
    fillFiber: 25,
    sugar: '2 g',
    fillSugar: 8,
  },
  toast: {
    protein: '16 g',
    fillProtein: 32,
    calories: '410 kkal',
    fillCalories: 41,
    carbs: '48 g',
    fillCarbs: 37,
    fat: '18 g',
    fillFat: 28,
    fiber: '9 g',
    fillFiber: 36,
    sugar: '6 g',
    fillSugar: 18,
  },
  soup: {
    protein: '26 g',
    fillProtein: 52,
    calories: '320 kkal',
    fillCalories: 32,
    carbs: '32 g',
    fillCarbs: 25,
    fat: '9 g',
    fillFat: 14,
    fiber: '5 g',
    fillFiber: 20,
    sugar: '3 g',
    fillSugar: 10,
  },
  default: {
    protein: '24 g',
    fillProtein: 48,
    calories: '450 kkal',
    fillCalories: 45,
    carbs: '52 g',
    fillCarbs: 40,
    fat: '18 g',
    fillFat: 28,
    fiber: '6 g',
    fillFiber: 25,
    sugar: '5 g',
    fillSugar: 15,
  },
};

const FOOD_SUGGESTIONS = {
  salad: [
    { title: 'Perbanyak Sayuran Hijau', text: 'Sayuran kaya serat membantu kenyang lebih lama dan menjaga metabolisme.' },
    { title: 'Gunakan Dressing Terpisah', text: 'Batasi penggunaan saus berkalori tinggi untuk menjaga defisit kalori.' },
    { title: 'Cukupi Hidrasi', text: 'Minum air putih secara berkala untuk mendukung penyerapan serat optimal.' },
  ],
  salmon: [
    { title: 'Kaya Omega-3', text: 'Asam lemak sehat mendukung kesehatan jantung dan fungsi kognitif otak.' },
    { title: 'Kombinasi Karbohidrat Kompleks', text: 'Padukan dengan quinoa atau nasi merah untuk energi tahan lama.' },
    { title: 'Batasi Garam Berlebih', text: 'Gunakan perasan jeruk lemon dan herba alami sebagai pengganti garam berlebih.' },
  ],
  toast: [
    { title: 'Pilih Roti Gandum Utuh', text: 'Roti gandum utuh memberikan serat lebih tinggi dibanding roti putih biasa.' },
    { title: 'Tambahkan Sumber Protein', text: 'Padukan dengan telur atau alpukat untuk indeks glikemik yang stabil.' },
    { title: 'Hindari Selai Manis', text: 'Batasi pemanis buatan dan selai tinggi gula untuk menjaga kadar gula darah.' },
  ],
  soup: [
    { title: 'Kurangi Minyak & Santan', text: 'Kuah bening lebih rendah kalori dan menjaga pencernaan tetap ringan.' },
    { title: 'Perbanyak Sayuran Kuah', text: 'Wortel, buncis, dan seledri kaya akan mikronutrien penting bagi tubuh.' },
    { title: 'Minum Air Putih Cukup', text: 'Meskipun mengonsumsi sup, tetap penuhi asupan air putih harian.' },
  ],
  default: [
    { title: 'Kurangi Porsi', text: 'Makanan ini tinggi kalori dan lemak, konsumsi dalam porsi kecil.' },
    { title: 'Batasi Makanan Berlemak', text: 'Batasi konsumsi kulit babi dan serundeng yang tinggi lemak.' },
    { title: 'Minum Air Putih', text: 'Minum air putih yang cukup untuk membantu pencernaan dan metabolisme.' },
  ],
};

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('food-file-input');
  const dropzone = document.getElementById('scan-dropzone');
  const dropzoneDefault = document.getElementById('dropzone-default');
  const dropzonePreview = document.getElementById('dropzone-preview');
  const imagePreview = document.getElementById('food-image-preview');
  const fileName = document.getElementById('food-file-name');
  const uploadError = document.getElementById('upload-error');
  const browseLabel = document.getElementById('btn-browse-file');
  const cameraButton = document.getElementById('btn-camera');
  const removeButton = document.getElementById('btn-remove-image');
  const analyzeButton = document.getElementById('btn-analyze-now');
  const analyzeSpinner = document.getElementById('btn-analyze-spinner');
  const nutritionPanel = document.querySelector('.scan-panel--nutrition');
  const nutritionEmpty = document.getElementById('nutrition-empty');
  const nutritionResult = document.getElementById('nutrition-result');
  const statusTicker = document.getElementById('scan-status-ticker');
  const statusText = document.getElementById('scan-status-text');
  const suggestionsPanel = document.getElementById('scan-panel-suggestions');
  const historyPanel = document.getElementById('scan-panel-history');
  const loadingOverlay = document.getElementById('scan-loading-overlay');
  const loadingStatusText = document.getElementById('scan-loading-status');
  const loadingProgressBar = document.getElementById('scan-loading-bar');

  if (
    !fileInput ||
    !dropzone ||
    !dropzoneDefault ||
    !dropzonePreview ||
    !imagePreview ||
    !analyzeButton ||
    !nutritionPanel ||
    !nutritionEmpty ||
    !nutritionResult
  ) {
    return;
  }

  let currentFile = null;
  let previewUrl = '';
  let analysisTimer = null;
  let tickerInterval = null;

  const setNutritionState = (state) => {
    nutritionEmpty.hidden = state !== 'empty';
    nutritionResult.hidden = state !== 'result';
    if (suggestionsPanel) {
      suggestionsPanel.hidden = state !== 'result';
      if (state === 'result') {
        suggestionsPanel.classList.add('is-revealed');
      }
    }
    if (historyPanel) {
      historyPanel.hidden = state !== 'result';
      if (state === 'result') {
        historyPanel.classList.add('is-revealed');
      }
    }
    nutritionPanel.setAttribute('aria-busy', String(state === 'loading'));
    if (state === 'loading' || state === 'result') {
      nutritionPanel.classList.add('is-revealed');
    }
  };

  const showError = (message = '') => {
    if (!uploadError) return;

    uploadError.textContent = message;
    uploadError.hidden = !message;
  };

  const clearPreviewUrl = () => {
    if (!previewUrl) return;

    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = '';
  };

  const stopScanningAnimation = () => {
    dropzonePreview.classList.remove('is-scanning');
    if (statusTicker) statusTicker.hidden = true;
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }
  };

  const resetAnalysis = () => {
    if (analysisTimer) {
      window.clearTimeout(analysisTimer);
      analysisTimer = null;
    }
    stopScanningAnimation();

    if (loadingOverlay) {
      loadingOverlay.hidden = true;
    }
    document.body.style.overflow = '';

    analyzeButton.classList.remove('is-loading');
    if (analyzeSpinner) analyzeSpinner.hidden = true;
    analyzeButton.disabled = !currentFile;
    const btnLabels = analyzeButton.querySelectorAll('.scan-btn-primary__label, .scan-btn-primary__text');
    if (btnLabels.length > 0) {
      btnLabels.forEach((el) => {
        el.textContent = 'Analisis Sekarang';
      });
    } else {
      analyzeButton.textContent = 'Analisis Sekarang';
    }
    setNutritionState('empty');
  };

  const resetFile = () => {
    currentFile = null;
    fileInput.value = '';
    clearPreviewUrl();
    imagePreview.removeAttribute('src');
    dropzoneDefault.hidden = false;
    dropzonePreview.hidden = true;
    if (fileName) fileName.textContent = '';
    showError();
    resetAnalysis();
  };

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return 'Gunakan file JPG, PNG, atau WebP.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Ukuran foto melebihi batas maksimal 5 MB.';
    }

    return '';
  };

  const handleFile = (file) => {
    if (!file) return;

    const validationMessage = validateFile(file);
    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    clearPreviewUrl();
    currentFile = file;
    previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    dropzoneDefault.hidden = true;
    dropzonePreview.hidden = false;
    if (fileName) fileName.textContent = file.name;
    showError();
    resetAnalysis();
    analyzeButton.disabled = false;
  };

  fileInput.addEventListener('change', () => {
    handleFile(fileInput.files?.[0]);
  });

  browseLabel?.addEventListener('click', () => {
    fileInput.removeAttribute('capture');
  });

  cameraButton?.addEventListener('click', () => {
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
  });

  removeButton?.addEventListener('click', resetFile);

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    handleFile(event.dataTransfer?.files?.[0]);
  });

  const getActiveFoodKey = () => {
    const name = currentFile?.name?.toLowerCase() || '';
    if (name.includes('salad') || name.includes('sayur')) return 'salad';
    if (name.includes('salmon') || name.includes('ikan')) return 'salmon';
    if (name.includes('toast') || name.includes('roti') || name.includes('alpukat')) return 'toast';
    if (name.includes('sop') || name.includes('soto') || name.includes('kuah')) return 'soup';
    return 'default';
  };

  const getActiveNutritionData = () => {
    const key = getActiveFoodKey();
    return FOOD_ANALYSIS_MODELS[key] || FOOD_ANALYSIS_MODELS.default;
  };

  const populateSuggestions = (key) => {
    const list = document.getElementById('health-suggestions-list');
    const suggestions = FOOD_SUGGESTIONS[key] || FOOD_SUGGESTIONS.default;
    if (!list || !suggestions) return;

    list.innerHTML = suggestions
      .map(
        (item) => `
        <li class="health-suggestion-card">
          <p class="health-suggestion-card__text">
            <strong>${item.title}:</strong> ${item.text}
          </p>
        </li>
      `
      )
      .join('');
  };

  const MAX_HISTORY_ITEMS = 3;

  const trimHistoryList = () => {
    const historyList = document.getElementById('food-history-list');
    if (!historyList) return;
    while (historyList.children.length > MAX_HISTORY_ITEMS) {
      historyList.removeChild(historyList.lastElementChild);
    }
  };

  trimHistoryList();

  const addHistoryItem = (data) => {
    const historyList = document.getElementById('food-history-list');
    if (!historyList || !currentFile || !previewUrl) return;

    let foodName = currentFile.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim();
    foodName = foodName.charAt(0).toUpperCase() + foodName.slice(1);

    const li = document.createElement('li');
    li.className = 'food-history-card';
    li.innerHTML = `
      <img
        class="food-history-card__thumb"
        src="${previewUrl}"
        alt="${foodName}"
        width="60"
        height="60"
        loading="lazy"
      />
      <div class="food-history-card__content">
        <h4 class="food-history-card__name">${foodName}</h4>
        <p class="food-history-card__meta">Baru saja • ${data.calories}</p>
      </div>
    `;

    historyList.prepend(li);
    trimHistoryList();
  };

  const populateNutritionResult = (data) => {
    const valProtein = document.getElementById('val-protein');
    const valCalories = document.getElementById('val-kalori');
    const valCarbs = document.getElementById('val-karbohidrat');
    const valFat = document.getElementById('val-lemak');
    const valFiber = document.getElementById('val-serat');
    const valSugar = document.getElementById('val-gula');

    const fillProtein = document.getElementById('fill-protein');
    const fillCalories = document.getElementById('fill-kalori');
    const fillCarbs = document.getElementById('fill-karbohidrat');
    const fillFat = document.getElementById('fill-lemak');
    const fillFiber = document.getElementById('fill-serat');
    const fillSugar = document.getElementById('fill-gula');

    if (valProtein) valProtein.textContent = data.protein;
    if (valCalories) valCalories.textContent = data.calories;
    if (valCarbs) valCarbs.textContent = data.carbs;
    if (valFat) valFat.textContent = data.fat;
    if (valFiber) valFiber.textContent = data.fiber;
    if (valSugar) valSugar.textContent = data.sugar;

    if (fillProtein) fillProtein.style.width = `${data.fillProtein}%`;
    if (fillCalories) fillCalories.style.width = `${data.fillCalories}%`;
    if (fillCarbs) fillCarbs.style.width = `${data.fillCarbs}%`;
    if (fillFat) fillFat.style.width = `${data.fillFat}%`;
    if (fillFiber) fillFiber.style.width = `${data.fillFiber}%`;
    if (fillSugar) fillSugar.style.width = `${data.fillSugar}%`;
  };

  analyzeButton.addEventListener('click', () => {
    if (!currentFile || analysisTimer) return;

    const setBtnText = (text) => {
      const btnLabels = analyzeButton.querySelectorAll('.scan-btn-primary__label, .scan-btn-primary__text');
      if (btnLabels.length > 0) {
        btnLabels.forEach((el) => {
          el.textContent = text;
        });
      } else {
        analyzeButton.textContent = text;
      }
    };

    showError();
    analyzeButton.disabled = true;
    analyzeButton.classList.add('is-loading');
    if (analyzeSpinner) analyzeSpinner.hidden = false;
    setBtnText('Menganalisis...');

    dropzonePreview.classList.add('is-scanning');
    const steps = [
      'Mengidentifikasi jenis makanan dan kandungan nutrisi...',
      'Mendeteksi takaran porsi & bahan alami...',
      'Menghitung rincian kalori, protein, & gizi...',
    ];
    const progressValues = ['30%', '65%', '92%'];
    let stepIndex = 0;

    if (loadingOverlay) {
      loadingOverlay.hidden = false;
    }
    document.body.style.overflow = 'hidden';

    if (loadingStatusText) {
      loadingStatusText.textContent = steps[0];
    }

    if (statusTicker && statusText) {
      statusTicker.hidden = false;
      statusText.textContent = steps[0];
    }

    tickerInterval = window.setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      if (statusText) statusText.textContent = steps[stepIndex];
      if (loadingStatusText) loadingStatusText.textContent = steps[stepIndex];
    }, 380);

    setNutritionState('loading');

    analysisTimer = window.setTimeout(() => {
      analysisTimer = null;
      stopScanningAnimation();

      if (loadingOverlay) {
        loadingOverlay.hidden = true;
      }
      document.body.style.overflow = '';

      analyzeButton.classList.remove('is-loading');
      if (analyzeSpinner) analyzeSpinner.hidden = true;
      analyzeButton.disabled = false;
      setBtnText('Analisis Ulang');

      const foodKey = getActiveFoodKey();
      const activeData = getActiveNutritionData();
      populateNutritionResult(activeData);
      populateSuggestions(foodKey);
      addHistoryItem(activeData);
      setNutritionState('result');

      // Autoscroll to scan-panel--nutrition after loading state finishes
      if (nutritionPanel) {
        window.setTimeout(() => {
          nutritionPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }, 1300);
  });

  window.addEventListener('pagehide', clearPreviewUrl, { once: true });
});
