document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('food-file-input');
  const dropzone = document.getElementById('scan-dropzone');
  const dropzoneDefault = document.getElementById('dropzone-default');
  const dropzonePreview = document.getElementById('dropzone-preview');
  const imagePreview = document.getElementById('food-image-preview');
  const btnBrowse = document.getElementById('btn-browse-file');
  const btnCamera = document.getElementById('btn-camera');
  const btnRemove = document.getElementById('btn-remove-image');
  const btnAnalyze = document.getElementById('btn-analyze-now');

  if (!fileInput || !dropzone || !btnAnalyze) return;

  let currentFile = null;

  // Handle File Selection
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto melebihi batas maksimal 5MB.');
      return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      dropzoneDefault.hidden = true;
      dropzonePreview.hidden = false;
    };
    reader.readAsDataURL(file);
  }

  // Remove File
  function resetFile() {
    currentFile = null;
    fileInput.value = '';
    imagePreview.src = '';
    dropzoneDefault.hidden = false;
    dropzonePreview.hidden = true;
    resetNutritionValues();
  }

  // File Input Change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Browse Button Click
  btnBrowse?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.removeAttribute('capture');
    fileInput.click();
  });

  // Camera Button Click
  btnCamera?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
  });

  // Remove Button Click
  btnRemove?.addEventListener('click', (e) => {
    e.stopPropagation();
    resetFile();
  });

  // Drag and Drop
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  });

  // Analyze Button Click Functionality
  btnAnalyze.addEventListener('click', () => {
    const originalText = btnAnalyze.textContent;
    btnAnalyze.disabled = true;
    btnAnalyze.textContent = 'Menganalisis Gizi...';

    setTimeout(() => {
      btnAnalyze.disabled = false;
      btnAnalyze.textContent = originalText;
      animateNutritionResults();
    }, 1200);
  });

  // Nutrition Bars & Values Simulation
  const mockData = {
    protein: { val: '24g', percent: '68%' },
    kalori: { val: '450 kcal', percent: '75%' },
    karbohidrat: { val: '52g', percent: '60%' },
    lemak: { val: '18g', percent: '42%' },
    serat: { val: '6g', percent: '35%' },
    gula: { val: '5g', percent: '25%' },
  };

  function animateNutritionResults() {
    Object.keys(mockData).forEach((key) => {
      const bar = document.getElementById(`bar-${key}`);
      const val = document.getElementById(`val-${key}`);

      if (bar && val) {
        bar.style.width = mockData[key].percent;
        val.textContent = mockData[key].val;
        val.classList.add('has-value');
      }
    });
  }

  function resetNutritionValues() {
    ['protein', 'kalori', 'karbohidrat', 'lemak', 'serat', 'gula'].forEach((key) => {
      const bar = document.getElementById(`bar-${key}`);
      const val = document.getElementById(`val-${key}`);

      if (bar && val) {
        bar.style.width = '0%';
        val.textContent = '--';
        val.classList.remove('has-value');
      }
    });
  }
});
