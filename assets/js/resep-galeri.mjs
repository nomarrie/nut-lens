/**
 * Recipe Gallery Interactive Controller (resep-galeri.mjs)
 * NutLens Design System
 */

export const RECIPES_DATA = [
  {
    id: 'pepes-ayam',
    title: 'Pepes Ayam',
    badge: 'REKOMENDASI MAKAN SIANG',
    category: 'semua',
    categoryName: 'Semua',
    tags: ['Tinggi Protein', 'Rendah Lemak', 'Kukus Sehat', 'Bebas Minyak'],
    calories: '310 kkal',
    calorieNum: 310,
    protein: '34 g',
    proteinNum: 34,
    carbs: '8 g',
    fat: '6 g',
    fiber: '4 g',
    sugar: '2 g',
    fillCalories: 31,
    fillProtein: 68,
    fillCarbs: 10,
    fillFat: 12,
    fillFiber: 18,
    fillSugar: 6,
    cookTime: '25 Menit',
    cookTimeNum: 25,
    difficulty: 'Mudah',
    servings: '1 Porsi',
    image: '../images/recipes/pepes-ayam.jpg',
    description:
      'Rekomendasi resep dari NutLens. Perpaduan sempurna antara protein tanpa lemak dan rempah-rempah kaya antioksidan, diolah tanpa minyak melalui metode kukus untuk menjaga nutrisi tetap utuh, dan memberikan energi yang stabil.',
    ingredients: [
      { text: 'Dada ayam fillet, potong memanjang', qty: '200 gram' },
      { text: 'Daun kemangi segar beraroma wangi', qty: '1 ikat' },
      { text: 'Cabai merah besar & rawit iris', qty: '3 buah' },
      { text: 'Jeruk limau segar (ambil perasan air)', qty: '1 buah' },
      { text: 'Bumbu halus (bawang, kunyit bakar, kemiri, jahe)', qty: '2 sdm' },
      { text: 'Serai memarkan & daun salam segar', qty: '2 lembar' },
      { text: 'Garam laut & kaldu jamur non-MSG', qty: 'Secukupnya' },
      { text: 'Daun pisang segar & tusuk lidi untuk membungkus', qty: '2 lembar' }
    ],
    steps: [
      'Campurkan potongan dada ayam dengan bumbu halus kunyit, daun salam, serai, garam, dan perasan jeruk limau hingga merata.',
      'Siapkan daun pisang yang telah dilayukan, tata ayam berbalut bumbu di atasnya, tambahkan daun kemangi melimpah dan irisan cabai merah.',
      'Bungkus rapi menyerupai lontong/tum dan sematkan kedua ujungnya menggunakan tusuk lidi.',
      'Kukus pepes ayam selama 20-25 menit dengan api sedang hingga matang sempurna dan sari rempah meresap ke dalam serat daging.',
      'Panggang sebentar di atas wajan tanpa minyak selama 3 menit untuk mengeluarkan aroma harum daun pisang yang khas sebelum disajikan hangat.'
    ],
    insight:
      'Pepes ayam merupakan metode memasak tradisional nusantara paling sehat karena mengunci kelembapan dan nutrisi daging ayam tanpa memerlukan minyak goreng atau lemak tambahan, serta kaya kurkumin anti-inflamasi dari kunyit.'
  },
  {
    id: 'salmon-quinoa',
    title: 'Salmon Panggang Lemon & Quinoa Bowl',
    badge: 'PILIHAN NUTLENS',
    category: 'protein',
    categoryName: 'Tinggi Protein',
    tags: ['Tinggi Protein', 'Omega-3', 'Bebas Gluten'],
    calories: '520 kkal',
    calorieNum: 520,
    protein: '38 g',
    proteinNum: 38,
    carbs: '36 g',
    fat: '22 g',
    fiber: '7 g',
    sugar: '3 g',
    fillCalories: 52,
    fillProtein: 76,
    fillCarbs: 28,
    fillFat: 34,
    fillFiber: 29,
    fillSugar: 10,
    cookTime: '25 Menit',
    cookTimeNum: 25,
    difficulty: 'Sedang',
    servings: '2 Porsi',
    image: '../images/recipes/salmon-quinoa.jpg',
    description:
      'Fillet salmon segar panggang dengan kulit renyah di atas quinoa gurih, disajikan bersama brokoli kukus, tomat ceri manis, dan dressing lemon zesty kaya Omega-3.',
    ingredients: [
      { text: 'Fillet salmon segar tanpa tulang', qty: '300 gram' },
      { text: 'Quinoa matang (dimasak dengan kaldu sayur)', qty: '150 gram' },
      { text: 'Brokoli segar, potong kuntum & kukus', qty: '100 gram' },
      { text: 'Tomat ceri, belah dua', qty: '8 buah' },
      { text: 'Minyak zaitun extra virgin', qty: '1.5 sdm' },
      { text: 'Air perasan lemon segar & parutan kulit', qty: '1 buah' },
      { text: 'Garam laut & lada hitam bubuk', qty: 'Secukupnya' },
      { text: 'Daun dill segar cincang untuk taburan', qty: '1 sdt' }
    ],
    steps: [
      'Bumbui fillet salmon dengan garam, lada hitam, perasan lemon, dan 1 sdm minyak zaitun. Diamkan selama 10 menit.',
      'Panaskan wajan anti-lengket dengan api sedang. Panggang salmon dimulai dari sisi kulit selama 4-5 menit hingga renyah, lalu balik dan masak sisi lainnya selama 3 menit.',
      'Rebus quinoa hingga matang dan empuk (sekitar 15 menit), lalu tiriskan dan aduk dengan sedikit garam dan minyak zaitun.',
      'Kukus kuntum brokoli selama 3-4 menit hingga hijau cerah dan renyah (*crisp-tender*).',
      'Tata quinoa di dalam mangkuk saji, letakkan fillet salmon di atasnya, tambahkan brokoli kukus dan tomat ceri di sekelilingnya.',
      'Beri taburan daun dill segar dan sajikan segera dengan irisan lemon.'
    ],
    insight:
      'Salmon kaya akan asam lemak Omega-3 rantai panjang (EPA & DHA) yang terbukti secara klinis menurunkan peradangan sistemik dan mendukung kesehatan kardiovaskular serta fungsi kognitif otak.'
  },
  {
    id: 'mediterranean-salad',
    title: 'Salad Mediterania Edamame & Alpukat',
    badge: 'TINGGI SERAT ALAMI',
    category: 'serat',
    categoryName: 'Tinggi Serat',
    tags: ['Tinggi Serat', 'Plant-Based', 'Rendah Glikemik'],
    calories: '340 kkal',
    calorieNum: 340,
    protein: '14 g',
    proteinNum: 14,
    carbs: '24 g',
    fat: '21 g',
    fiber: '12 g',
    sugar: '4 g',
    fillCalories: 34,
    fillProtein: 28,
    fillCarbs: 18,
    fillFat: 32,
    fillFiber: 48,
    fillSugar: 12,
    cookTime: '15 Menit',
    cookTimeNum: 15,
    difficulty: 'Mudah',
    servings: '2 Porsi',
    image: '../images/recipes/mediterranean-salad.jpg',
    description:
      'Kombinasi kaya serat dari selada segar, edamame kukus, alpukat mentega, timun jepang, tomat ceri, dan dressing lemon-zaitun herba Mediterania.',
    ingredients: [
      { text: 'Selada romaine / daun campur segar', qty: '150 gram' },
      { text: 'Edamame kupas matang kukus', qty: '100 gram' },
      { text: 'Alpukat mentega matang, potong dadu', qty: '1 buah' },
      { text: 'Mentimun jepang, iris tipis bulat', qty: '1 buah' },
      { text: 'Tomat ceri aneka warna, belah dua', qty: '10 buah' },
      { text: 'Biji labu panggang (pumpkin seeds)', qty: '2 sdm' },
      { text: 'Dressing: Minyak zaitun, lemon, oregano, madu murni', qty: '3 sdm' }
    ],
    steps: [
      'Cuci bersih selada dan sayuran segar dengan air dingin mengalir, lalu tiriskan hingga kering.',
      'Dalam mangkuk kecil, kocok minyak zaitun extra virgin, perasan lemon, oregano kering, sedikit garam laut, dan 1 sdt madu.',
      'Dalam mangkuk saji besar, masukkan daun selada, mentimun iris, tomat ceri, dan edamame kupas.',
      'Tuangkan dressing dan aduk lembut (*toss*) hingga seluruh sayuran terlapisi secara merata.',
      'Tambahkan potongan alpukat di bagian atas agar tidak hancur, taburi biji labu renyah, dan sajikan segera.'
    ],
    insight:
      'Kandungan 12 gram serat pangan per porsi memenuhi lebih dari 40% kebutuhan serat harian dewasa, efektif menjaga kesehatan saluran cerna dan kestabilan gula darah harian.'
  },
  {
    id: 'avocado-toast',
    title: 'Avocado Egg Toast Roti Gandum Utuh',
    badge: 'SARAPAN BERENERGI',
    category: 'sarapan',
    categoryName: 'Sarapan',
    tags: ['Sarapan Sehat', 'Lemak Baik', 'Mudah & Cepat'],
    calories: '380 kkal',
    calorieNum: 380,
    protein: '16 g',
    proteinNum: 16,
    carbs: '28 g',
    fat: '23 g',
    fiber: '8 g',
    sugar: '2 g',
    fillCalories: 38,
    fillProtein: 32,
    fillCarbs: 22,
    fillFat: 35,
    fillFiber: 32,
    fillSugar: 7,
    cookTime: '10 Menit',
    cookTimeNum: 10,
    difficulty: 'Mudah',
    servings: '1 Porsi',
    image: '../images/recipes/avocado-toast.jpg',
    description:
      'Roti sourdough gandum utuh panggang renyah dengan olesan alpukat tumbuk berbumbu, telur rebus setengah matang, taburan biji chia, dan serpihan cabai merah.',
    ingredients: [
      { text: 'Roti sourdough gandum utuh tebal', qty: '2 lembar' },
      { text: 'Alpukat matang, tumbuk kasar', qty: '1 buah' },
      { text: 'Telur ayam omega-3 (rebus 6.5 menit)', qty: '2 butir' },
      { text: 'Perasan jeruk lemon segar', qty: '1 sdt' },
      { text: 'Biji chia hitam atau biji wijen', qty: '1 sdt' },
      { text: 'Chili flakes (cabai bubuk kasar)', qty: '1/2 sdt' },
      { text: 'Garam laut & lada hitam kasar', qty: 'Secukupnya' }
    ],
    steps: [
      'Panggang roti gandum utuh di toaster atau wajan hingga berwarna keemasan dan bertekstur renyah di luar.',
      'Tumbuk daging buah alpukat di mangkuk dengan garpu, beri sedikit perasan lemon, garam, dan lada hitam.',
      'Oleskan tumbukan alpukat secara tebal dan merata di atas permukaan roti panggang yang masih hangat.',
      'Kupas telur rebus setengah matang, belah menjadi dua bagian, lalu susun rapi di atas lapisan alpukat.',
      'Beri taburan biji chia, serpihan cabai merah, dan sejumput garam laut sebelum dinikmati selagi segar.'
    ],
    insight:
      'Kombinasi asam lemak tak jenuh tunggal (*MUFA*) dari alpukat dan protein berkualitas tinggi dari telur memberikan rasa kenyang bertahan lama (*satiety*) serta energi stabil sepanjang pagi.'
  },
  {
    id: 'berry-smoothie',
    title: 'Superfood Berry Protein Smoothie Bowl',
    badge: 'CAMILAN NUTRISI',
    category: 'camilan',
    categoryName: 'Camilan',
    tags: ['Camilan Sehat', 'Tinggi Antioksidan', 'Segar'],
    calories: '290 kkal',
    calorieNum: 290,
    protein: '20 g',
    proteinNum: 20,
    carbs: '42 g',
    fat: '5 g',
    fiber: '9 g',
    sugar: '18 g',
    fillCalories: 29,
    fillProtein: 40,
    fillCarbs: 32,
    fillFat: 8,
    fillFiber: 36,
    fillSugar: 38,
    cookTime: '8 Menit',
    cookTimeNum: 8,
    difficulty: 'Mudah',
    servings: '1 Porsi',
    image: '../images/recipes/berry-smoothie.jpg',
    description:
      'Smoothie kental kaya antosianin dari perpaduan buah beri beku, pisang, greek yogurt kaya protein, ditaburi granola gandum madu, biji chia, dan buah segar.',
    ingredients: [
      { text: 'Campuran berry beku (blueberry, strawberry, raspberry)', qty: '150 gram' },
      { text: 'Pisang beku matang', qty: '1 buah' },
      { text: 'Greek yogurt tawar (plain non-fat)', qty: '120 gram' },
      { text: 'Susu almond tanpa pemanis tambahan', qty: '60 ml' },
      { text: 'Topping: Granola gandum utuh renyah', qty: '2 sdm' },
      { text: 'Topping: Irisan pisang segar & buah beri', qty: 'Secukupnya' },
      { text: 'Topping: Biji chia & serpihan kelapa panggang', qty: '1 sdt' }
    ],
    steps: [
      'Masukkan buah beri beku, pisang beku, greek yogurt, dan sedikit susu almond ke dalam blender berkecepatan tinggi.',
      'Haluskan hingga bertekstur sangat kental dan lembut menyerupai tekstur es krim (*soft-serve*).',
      'Tuangkan smoothie ke dalam mangkuk saji.',
      'Tata topping berupa granola renyah, irisan pisang, buah beri segar, biji chia, dan kelapa panggang di bagian atas.',
      'Sajikan langsung dalam keadaan dingin dan segar untuk cemilan berenergi.'
    ],
    insight:
      'Buah beri berwarna ungu pekat mengandung konsentrasi antosianin dan flavonoid tertinggi di antara buah-buahan, bekerja melawan stres oksidatif dan mempercepat pemulihan sel otot.'
  },
  {
    id: 'chicken-soup',
    title: 'Sup Ayam Kampung Bening Herbal',
    badge: 'CEPAT SAJI & HANGAT',
    category: 'cepat-saji',
    categoryName: 'Cepat Saji',
    tags: ['Cepat Saji', 'Menghangatkan', 'Rendah Lemak'],
    calories: '280 kkal',
    calorieNum: 280,
    protein: '28 g',
    proteinNum: 28,
    carbs: '16 g',
    fat: '10 g',
    fiber: '4 g',
    sugar: '3 g',
    fillCalories: 28,
    fillProtein: 56,
    fillCarbs: 12,
    fillFat: 16,
    fillFiber: 16,
    fillSugar: 9,
    cookTime: '20 Menit',
    cookTimeNum: 20,
    difficulty: 'Mudah',
    servings: '2 Porsi',
    image: '../images/recipes/chicken-soup.jpg',
    description:
      'Sup bening hangat bernutrisi tinggi dengan potongan dada ayam empuk, wortel, kembang kol, seledri aromatik, kaldu herbal rempah jahe dan bawang putih anti-inflamasi.',
    ingredients: [
      { text: 'Dada ayam tanpa kulit, potong dadu', qty: '250 gram' },
      { text: 'Wortel manis, potong bulat tebal', qty: '2 buah' },
      { text: 'Kembang kol segar, potong kuntum', qty: '100 gram' },
      { text: 'Batang seledri & daun bawang cincang', qty: '2 batang' },
      { text: 'Jahe segar, memarkan', qty: '3 cm' },
      { text: 'Bawang putih geprek & tumis wangi', qty: '4 siung' },
      { text: 'Kaldu ayam murni tanpa pengawet', qty: '750 ml' },
      { text: 'Garam laut, lada putih bubuk, pala bubuk', qty: 'Secukupnya' }
    ],
    steps: [
      'Didihkan kaldu ayam dalam panci bersama jahe geprek dan bawang putih yang telah ditumis hingga harum.',
      'Masukkan potongan dada ayam, masak dengan api sedang hingga daging berubah warna dan empuk.',
      'Tambahkan irisan wortel dan kembang kol, masak selama 5-7 menit hingga sayuran matang tetapi tetap renyah.',
      'Bumbui dengan garam, lada putih, dan sejumput pala bubuk, lalu koreksi rasa kaldu.',
      'Matikan api, masukkan daun bawang dan seledri cincang. Sajikan selagi hangat dalam mangkuk sup.'
    ],
    insight:
      'Kaldu tulang ayam kaya akan asam amino glisin dan prolin yang membantu meredakan inflamasi mukosa pernapasan serta mendukung regenerasi sel imun tubuh saat pemulihan.'
  },
  {
    id: 'smoothie-bowl',
    title: 'Smoothie Bowl Pisang & Granola',
    badge: 'SARAPAN SEHAT',
    category: 'sarapan',
    categoryName: 'Sarapan',
    tags: ['Sarapan', 'Tinggi Antioksidan', 'Plant-Based'],
    calories: '350 kkal',
    calorieNum: 350,
    protein: '12 g',
    proteinNum: 12,
    carbs: '54 g',
    fat: '9 g',
    fiber: '8 g',
    sugar: '22 g',
    fillCalories: 35,
    fillProtein: 24,
    fillCarbs: 42,
    fillFat: 14,
    fillFiber: 32,
    fillSugar: 45,
    cookTime: '5 Menit',
    cookTimeNum: 5,
    difficulty: 'Mudah',
    servings: '1 Porsi',
    image: '../images/recipes/smoothie-bowl-green.jpg',
    description:
      'Smoothie mangkuk hijau bernutrisi dari perpaduan spirulina, bayam organik, dan pisang beku, ditata dengan irisan pisang segar, stroberi, blueberry, biji labu, dan granola renyah.',
    ingredients: [
      { text: 'Pisang beku matang', qty: '2 buah' },
      { text: 'Bayam organik & spirulina bubuk', qty: '1 genggam & 1 sdt' },
      { text: 'Susu almond tawar', qty: '80 ml' },
      { text: 'Granola gandum utuh panggang', qty: '2 sdm' },
      { text: 'Buah beri segar (stroberi & blueberry)', qty: 'Secukupnya' },
      { text: 'Biji labu & biji chia', qty: '1 sdm' }
    ],
    steps: [
      'Blender pisang beku, bayam organik, spirulina, dan susu almond hingga halus dan kental.',
      'Tuangkan ke dalam mangkuk saji keramik.',
      'Tata irisan pisang segar, buah beri, granola, biji labu, dan biji chia di atas permukaan smoothie.',
      'Sajikan segera dalam keadaan dingin untuk sarapan menyegarkan dan padat nutrisi.'
    ],
    insight:
      'Kaya akan klorofil, kalium, dan serat larut yang membantu melancarkan pencernaan pagi hari serta memberikan pelepasan energi stabil tanpa lonjakan gula darah.'
  },
  {
    id: 'wrap-tuna',
    title: 'Wrap Gandum Tuna Alpukat',
    badge: 'CAMILAN SEHAT',
    category: 'camilan',
    categoryName: 'Camilan',
    tags: ['Camilan', 'Tinggi Protein', 'Lemak Sehat'],
    calories: '400 kkal',
    calorieNum: 400,
    protein: '30 g',
    proteinNum: 30,
    carbs: '32 g',
    fat: '16 g',
    fiber: '7 g',
    sugar: '3 g',
    fillCalories: 40,
    fillProtein: 60,
    fillCarbs: 25,
    fillFat: 25,
    fillFiber: 28,
    fillSugar: 6,
    cookTime: '5 Menit',
    cookTimeNum: 5,
    difficulty: 'Mudah',
    servings: '1 Porsi',
    image: '../images/recipes/wrap-tuna.jpg',
    description:
      'Tortilla gandum utuh lembut diisi suwiran tuna segar kaya protein, irisan alpukat mentega, daun selada renyah, tomat ceri, dan dressing yogurt lemon herba.',
    ingredients: [
      { text: 'Kulit tortilla gandum utuh (whole wheat)', qty: '1 lembar' },
      { text: 'Tuna kaleng dalam air garam (tiriskan)', qty: '120 gram' },
      { text: 'Alpukat matang, iris tipis', qty: '1/2 buah' },
      { text: 'Selada romaine & timun iris', qty: 'Secukupnya' },
      { text: 'Tomat ceri, belah dua', qty: '4 buah' },
      { text: 'Dressing greek yogurt, mustard, dan lemon', qty: '1.5 sdm' }
    ],
    steps: [
      'Campurkan tuna yang telah ditiriskan dengan dressing yogurt lemon, sejumput garam, dan lada hitam.',
      'Hangatkan kulit tortilla gandum di atas wajan tanpa minyak selama 30 detik.',
      'Tata daun selada, campuran tuna, irisan alpukat, timun, dan tomat ceri di tengah tortilla.',
      'Gulung rapat menyerupai burrito lalu potong diagonal menjadi dua bagian untuk disajikan.'
    ],
    insight:
      'Pilihan camilan atau makan siang ringkas dengan rasio makronutrien ideal: protein tinggi dari tuna untuk otot dan lemak tak jenuh dari alpukat untuk kesehatan jantung.'
  },
  {
    id: 'pasta-pesto',
    title: 'Pasta Pesto Buncis Arab',
    badge: 'TINGGI SERAT',
    category: 'serat',
    categoryName: 'Tinggi Serat',
    tags: ['Tinggi Serat', 'Plant-Based', 'Mediterania'],
    calories: '450 kkal',
    calorieNum: 450,
    protein: '18 g',
    proteinNum: 18,
    carbs: '58 g',
    fat: '16 g',
    fiber: '11 g',
    sugar: '4 g',
    fillCalories: 45,
    fillProtein: 36,
    fillCarbs: 45,
    fillFat: 25,
    fillFiber: 44,
    fillSugar: 8,
    cookTime: '10 Menit',
    cookTimeNum: 10,
    difficulty: 'Mudah',
    servings: '1 Porsi',
    image: '../images/recipes/pasta-pesto.jpg',
    description:
      'Pasta gandum dipadukan dengan pesto daun kemangi segar buatan sendiri, kacang arab (chickpeas) kaya serat dan protein nabati, serta tomat ceri manis.',
    ingredients: [
      { text: 'Pasta spaghetti gandum utuh matang', qty: '120 gram' },
      { text: 'Kacang arab (chickpea) rebus matang', qty: '80 gram' },
      { text: 'Pesto kemangi (basil, olive oil, walnuts, garlic)', qty: '2 sdm' },
      { text: 'Tomat ceri aneka warna, belah dua', qty: '6 buah' },
      { text: 'Minyak zaitun extra virgin & keju parmesan parut', qty: '1 sdt' },
      { text: 'Daun basil segar untuk garnish', qty: 'Secukupnya' }
    ],
    steps: [
      'Rebus pasta hingga al dente lalu sisihkan 2 sdm air rebusan pasta.',
      'Panaskan wajan dengan sedikit minyak zaitun, masukkan tomat ceri dan kacang arab, masak selama 2 menit.',
      'Masukkan pasta matang, saus pesto kemangi, dan sedikit air rebusan pasta, lalu aduk merata hingga terbalut rata.',
      'Pindahkan ke piring saji, beri taburan keju parmesan dan daun basil segar di atasnya.'
    ],
    insight:
      'Kacang arab dan pasta gandum utuh memberikan kombinasi serat prebiotik yang memberi makan bakteri baik di usus serta memperlambat penyerapan karbohidrat.'
  },
  {
    id: 'nasi-ayam-hainan',
    title: 'Nasi Ayam Hainan',
    badge: 'TINGGI PROTEIN',
    category: 'protein',
    categoryName: 'Tinggi Protein',
    tags: ['Tinggi Protein', 'Kukus Sehat', 'Favorit'],
    calories: '400 kkal',
    calorieNum: 400,
    protein: '36 g',
    proteinNum: 36,
    carbs: '44 g',
    fat: '8 g',
    fiber: '3 g',
    sugar: '1 g',
    fillCalories: 40,
    fillProtein: 72,
    fillCarbs: 34,
    fillFat: 12,
    fillFiber: 12,
    fillSugar: 2,
    cookTime: '20 Menit',
    cookTimeNum: 20,
    difficulty: 'Sedang',
    servings: '1 Porsi',
    image: '../images/recipes/nasi-ayam-hainan.jpg',
    description:
      'Nasi aromatik yang dimasak dengan kaldu jahe dan bawang putih, disajikan bersama dada ayam rebus lembut tanpa kulit, saus cocolan jahe kecap asin, dan semangkuk kuah kaldu segar.',
    ingredients: [
      { text: 'Dada ayam fillet tanpa kulit', qty: '200 gram' },
      { text: 'Beras jasmine / basmati', qty: '70 gram' },
      { text: 'Kaldu ayam rebusan jahe & daun pandan', qty: '250 ml' },
      { text: 'Jahe segar parut & bawang putih cincang', qty: '2 sdm' },
      { text: 'Kecap asin rendah natrium & minyak wijen', qty: '1 sdm' },
      { text: 'Mentimun iris & daun ketumbar', qty: 'Secukupnya' }
    ],
    steps: [
      'Rebus dada ayam bersama jahe, daun bawang, dan sedikit garam dengan api kecil hingga matang lembut, lalu rendam di air es sebentar agar daging tetap juicy.',
      'Tumis jahe dan bawang putih cincang, masukkan beras dan kaldu ayam, lalu masak nasi hingga matang pulen dan wangi.',
      'Potong-potong dada ayam rebus lalu lumuri sedikit minyak wijen dan kecap asin rendah natrium.',
      'Sajikan nasi di atas piring bersama potongan ayam, irisan timun segar, kuah kaldu hangat, dan saus jahe.'
    ],
    insight:
      'Metode poaching pada dada ayam menjaga kelembutan protein tanpa menghasilkan zat karsinogenik dari penggorengan suhu tinggi.'
  },
  {
    id: 'ikan-kuah-kuning',
    title: 'Ikan Kembung Kuah Kuning',
    badge: 'TINGGI PROTEIN',
    category: 'protein',
    categoryName: 'Tinggi Protein',
    tags: ['Tinggi Protein', 'Omega-3', 'Rendah Kalori'],
    calories: '300 kkal',
    calorieNum: 300,
    protein: '32 g',
    proteinNum: 32,
    carbs: '8 g',
    fat: '14 g',
    fiber: '3 g',
    sugar: '2 g',
    fillCalories: 30,
    fillProtein: 64,
    fillCarbs: 6,
    fillFat: 22,
    fillFiber: 12,
    fillSugar: 4,
    cookTime: '40 Menit',
    cookTimeNum: 40,
    difficulty: 'Sedang',
    servings: '1 Porsi',
    image: '../images/recipes/ikan-kuah-kuning.jpg',
    description:
      'Ikan kembung segar kaya Omega-3 dimasak dalam kuah kuning aromatik berempah kunyit, serai, daun jeruk, asam kandis, dan perasan jeruk nipis segar tanpa santan.',
    ingredients: [
      { text: 'Ikan kembung segar, bersihkan', qty: '2 ekor (250g)' },
      { text: 'Bumbu halus (kunyit bakar, jahe, bawang merah, kemiri)', qty: '2 sdm' },
      { text: 'Serai memarkan & daun jeruk purut', qty: '2 batang & 4 lembar' },
      { text: 'Tomat hijau & cabai rawit utuh', qty: '2 buah & 4 buah' },
      { text: 'Air asam jawa / perasan jeruk nipis', qty: '1.5 sdm' },
      { text: 'Garam laut & kaldu jamur', qty: 'Secukupnya' }
    ],
    steps: [
      'Lumuri ikan kembung dengan perasan jeruk nipis dan garam, diamkan 10 menit untuk menghilangkan bau amis.',
      'Didihkan air dalam panci bersama bumbu halus, serai, daun jeruk, dan daun salam hingga aroma harum rempah keluar.',
      'Masukkan ikan kembung, tomat hijau, dan cabai rawit utuh, masak dengan api sedang hingga ikan matang meresap.',
      'Tambahkan air asam jawa, garam, dan kaldu jamur, koreksi rasa hingga gurih asam segar.',
      'Angkat dan sajikan selagi panas bersama kuah kuning segar.'
    ],
    insight:
      'Ikan kembung lokal memiliki kandungan asam lemak Omega-3 yang setara atau bahkan lebih tinggi dari salmon impor, dengan harga terjangkau dan minim lemak jenuh.'
  },
  {
    id: 'pecel-sayur',
    title: 'Pecel Sayur',
    badge: 'TINGGI SERAT',
    category: 'serat',
    categoryName: 'Tinggi Serat',
    tags: ['Tinggi Serat', 'Tradisional', 'Plant-Based'],
    calories: '365 kkal',
    calorieNum: 365,
    protein: '16 g',
    proteinNum: 16,
    carbs: '38 g',
    fat: '17 g',
    fiber: '10 g',
    sugar: '7 g',
    fillCalories: 36,
    fillProtein: 32,
    fillCarbs: 30,
    fillFat: 26,
    fillFiber: 40,
    fillSugar: 14,
    cookTime: '20 Menit',
    cookTimeNum: 20,
    difficulty: 'Mudah',
    servings: '1 Porsi',
    image: '../images/recipes/pecel-sayur.jpg',
    description:
      'Kombinasi aneka sayuran hijau rebus segar (bayam, kangkung, tauge, kacang panjang) disiram bumbu pecel kacang sangrai rendah gula, disajikan dengan telur rebus dan tempe.',
    ingredients: [
      { text: 'Sayuran segar (kangkung, bayam, kacang panjang, tauge)', qty: '200 gram' },
      { text: 'Bumbu pecel kacang tanah sangrai', qty: '3 sdm' },
      { text: 'Telur ayam rebus, belah dua', qty: '1 butir' },
      { text: 'Bawang merah goreng untuk taburan', qty: '1 sdt' },
      { text: 'Air hangat untuk melarutkan bumbu', qty: '4 sdm' }
    ],
    steps: [
      'Rebus masing-masing sayuran secara terpisah dalam air mendidih sebentar (*blanching*) agar nutrisi dan warnanya tetap cerah, lalu tiriskan.',
      'Larutkan bumbu pecel kacang sangrai dengan air hangat hingga kekentalan yang diinginkan.',
      'Tata sayuran rebus di atas piring saji, siram dengan saus kacang pecel aromatik.',
      'Tambahkan telur rebus di samping sayuran dan beri taburan bawang goreng renyah.'
    ],
    insight:
      'Kencur dan daun jeruk dalam bumbu pecel mengandung antioksidan alami serta minyak atsiri yang melancarkan peredaran darah dan menyegarkan saluran cerna.'
  }
];

export function initRecipeGallery(root = document) {
  const categoryButtons = [...root.querySelectorAll('[data-recipe-category]')];
  const filterChips = [...root.querySelectorAll('[data-recipe-filter]')];
  const searchInput = root.getElementById('recipe-search-input');
  const searchClear = root.getElementById('recipe-search-clear');

  const spotlightCard = root.getElementById('recipe-spotlight-card');
  const spotlightMedia = root.getElementById('spotlight-image');
  const spotlightBadge = root.getElementById('spotlight-badge');
  const spotlightTitle = root.getElementById('spotlight-title');
  const spotlightDesc = root.getElementById('spotlight-desc');
  const spotlightCalories = root.getElementById('spotlight-calories');
  const spotlightTime = root.getElementById('spotlight-time');
  const spotlightServings = root.getElementById('spotlight-servings');

  let isTransitioning = false;

  const updateSpotlight = (recipe, animate = true) => {
    if (!recipe) return;

    const textElements = [
      spotlightBadge,
      spotlightTitle,
      spotlightDesc,
      spotlightCalories?.parentElement,
      spotlightTime?.parentElement,
      spotlightServings?.parentElement
    ].filter(Boolean);

    if (animate && !isTransitioning) {
      isTransitioning = true;

      if (spotlightMedia) {
        spotlightMedia.classList.add('is-changing');
      }

      textElements.forEach((el) => {
        el.style.opacity = '0.35';
        el.style.transform = 'translateY(4px)';
        el.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
      });

      window.setTimeout(() => {
        applyContent(recipe);

        if (spotlightMedia) {
          void spotlightMedia.offsetWidth;
          spotlightMedia.classList.remove('is-changing');
        }

        textElements.forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        window.setTimeout(() => {
          isTransitioning = false;
        }, 350);
      }, 200);
    } else {
      applyContent(recipe);
    }
  };

  const applyContent = (recipe) => {
    if (spotlightMedia) {
      spotlightMedia.src = recipe.image;
      spotlightMedia.alt = `${recipe.title} disajikan segar`;
    }
    if (spotlightBadge) spotlightBadge.textContent = recipe.badge || 'REKOMENDASI NUTLENS';
    if (spotlightTitle) spotlightTitle.textContent = recipe.title;
    if (spotlightDesc) spotlightDesc.textContent = recipe.description;
    if (spotlightCalories) spotlightCalories.textContent = recipe.calories;
    if (spotlightTime) spotlightTime.textContent = recipe.cookTime;
    if (spotlightServings) spotlightServings.textContent = recipe.servings;
  };

  const selectCategory = (categoryKey) => {
    categoryButtons.forEach((b) => {
      const isMatch = b.dataset.recipeCategory === categoryKey;
      b.classList.toggle('is-active', isMatch);
      b.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });

    filterChips.forEach((chip) => {
      const isMatch = chip.dataset.recipeFilter === categoryKey;
      chip.classList.toggle('is-active', isMatch);
    });

    const matched =
      RECIPES_DATA.find((r) => r.category === categoryKey) ||
      RECIPES_DATA.find((r) => r.tags.some((t) => t.toLowerCase().includes(categoryKey))) ||
      RECIPES_DATA[0];

    updateSpotlight(matched);
  };

  // Category buttons handler
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.recipeCategory;
      selectCategory(category);
    });
  });

  // Hero filter chips handler
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filterKey = chip.dataset.recipeFilter;
      selectCategory(filterKey);
    });
  });

  // Live Search handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (searchClear) {
        searchClear.hidden = query.length === 0;
      }

      if (query.length > 0) {
        const found = RECIPES_DATA.find(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.categoryName.toLowerCase().includes(query) ||
            r.tags.some((t) => t.toLowerCase().includes(query)) ||
            r.ingredients.some((ing) => ing.text.toLowerCase().includes(query))
        );

        if (found) {
          selectCategory(found.category);
        }
      }
    });
  }

  searchClear?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    searchClear.hidden = true;
    selectCategory('semua');
  });

  // Initial load
  updateSpotlight(RECIPES_DATA[0], false);

  return () => {};
}

// Auto-boot on DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initRecipeGallery(document));
  } else {
    initRecipeGallery(document);
  }
}

