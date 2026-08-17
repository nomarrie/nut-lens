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
  const nutritionPanel = document.querySelector('.scan-panel--nutrition');
  const nutritionEmpty = document.getElementById('nutrition-empty');
  const nutritionLoading = document.getElementById('nutrition-loading');
  const nutritionResult = document.getElementById('nutrition-result');
  const statusTicker = document.getElementById('scan-status-ticker');
  const statusText = document.getElementById('scan-status-text');

  if (
    !fileInput ||
    !dropzone ||
    !dropzoneDefault ||
    !dropzonePreview ||
    !imagePreview ||
    !analyzeButton ||
    !nutritionPanel ||
    !nutritionEmpty ||
    !nutritionLoading ||
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
    nutritionLoading.hidden = state !== 'loading';
    nutritionResult.hidden = state !== 'result';
    nutritionPanel.setAttribute('aria-busy', String(state === 'loading'));
    if (state === 'loading') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
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

    analyzeButton.disabled = !currentFile;
    const btnText = analyzeButton.querySelector('.scan-btn-primary__text');
    if (btnText) {
      btnText.textContent = 'Analisis Sekarang';
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

  const getActiveNutritionData = () => {
    const name = currentFile?.name?.toLowerCase() || '';
    if (name.includes('salad') || name.includes('sayur')) {
      return FOOD_ANALYSIS_MODELS.salad;
    }
    if (name.includes('salmon') || name.includes('ikan')) {
      return FOOD_ANALYSIS_MODELS.salmon;
    }
    if (name.includes('toast') || name.includes('roti') || name.includes('alpukat')) {
      return FOOD_ANALYSIS_MODELS.toast;
    }
    if (name.includes('sop') || name.includes('soto') || name.includes('kuah')) {
      return FOOD_ANALYSIS_MODELS.soup;
    }

    return FOOD_ANALYSIS_MODELS.default;
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

    showError();
    analyzeButton.disabled = true;
    const btnText = analyzeButton.querySelector('.scan-btn-primary__text');
    if (btnText) {
      btnText.textContent = 'Menganalisis...';
    } else {
      analyzeButton.textContent = 'Menganalisis...';
    }

    dropzonePreview.classList.add('is-scanning');
    const loadingStatus = document.getElementById('nutrition-loading-status');
    const steps = [
      'Mengidentifikasi jenis makanan dan kandungan nutrisi...',
      'Mendeteksi takaran porsi & bahan alami...',
      'Menghitung rincian kalori, protein, & gizi...',
    ];
    let stepIndex = 0;

    if (loadingStatus) {
      loadingStatus.textContent = steps[0];
    }

    if (statusTicker && statusText) {
      statusTicker.hidden = false;
      statusText.textContent = steps[0];
    }

    tickerInterval = window.setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      if (statusText) statusText.textContent = steps[stepIndex];
      if (loadingStatus) loadingStatus.textContent = steps[stepIndex];
    }, 380);

    setNutritionState('loading');

    analysisTimer = window.setTimeout(() => {
      analysisTimer = null;
      stopScanningAnimation();

      analyzeButton.disabled = false;
      if (btnText) {
        btnText.textContent = 'Analisis Ulang';
      } else {
        analyzeButton.textContent = 'Analisis Ulang';
      }

      const activeData = getActiveNutritionData();
      populateNutritionResult(activeData);
      setNutritionState('result');
    }, 1150);
  });

  window.addEventListener('pagehide', clearPreviewUrl, { once: true });
});
