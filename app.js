/**
 * MODUL PEMBELAJARAN INTERAKTIF TIK – PEMROGRAMAN VISUAL SCRATCH
 * Complete Application Logic, Simulation Engine, Web Audio Synthesizer,
 * Quiz & Assessment Banks, Confetti, and Certificate Generator.
 */

// =====================================================================
// 1. STATE MANAGEMENT
// =====================================================================
const AppState = {
  currentModule: 0, // 0 = Menu Utama, 1..8 = Modul 1 s/d 8
  completedModules: new Set(),
  theme: 'dark', // 'dark' or 'light'
  
  // Student Profile
  studentName: 'Siswa Berprestasi',
  studentClass: 'IX-A · SMP Negeri',
  
  // Pre-test State
  pretestCurrentIdx: 0,
  pretestScore: 0,
  pretestAnswered: false,
  
  // Quiz HOTS State
  quizCurrentIdx: 0,
  quizScore: 0,
  quizTimerSeconds: 0,
  quizTimerInterval: null,
  quizAnswered: false,
  
  // Final Exam State
  finalExamCurrentIdx: 0,
  finalExamScore: 0,
  finalExamTimerSeconds: 0,
  finalExamTimerInterval: null,
  finalExamAnswered: false,
  finalExamPredicate: 'Cukup',

  // Reflection State
  reflectionMood: 'happy',
  reflections: {
    q1: '',
    q2: '',
    q3: '',
    q4: ''
  },

  // Audio State
  audioActive: false,
  audioCtx: null,
  audioTimer: null,

  // Badges
  unlockedBadges: new Set()
};

// Module Meta Information
const ModuleInfo = [
  { id: 0, title: 'Menu Utama', icon: '🏠' },
  { id: 1, title: 'Apersepsi', icon: '📌' },
  { id: 2, title: 'Asesmen Awal', icon: '📝' },
  { id: 3, title: 'Materi Pembelajaran', icon: '📖' },
  { id: 4, title: 'Simulasi & Aktivitas', icon: '🧩' },
  { id: 5, title: 'Kuis Interaktif (HOTS)', icon: '⚡' },
  { id: 6, title: 'Asesmen Akhir', icon: '🎯' },
  { id: 7, title: 'Refleksi Belajar', icon: '💭' },
  { id: 8, title: 'Sertifikat Hasil Belajar', icon: '🎓' }
];

// =====================================================================
// 2. QUESTION BANKS
// =====================================================================

// Modul 2: Asesmen Awal (5 Soal Diagnostik)
const PretestQuestions = [
  {
    question: "Apa yang dimaksud dengan bahasa pemrograman visual berbasis blok seperti Scratch?",
    options: [
      "Bahasa yang mengharuskan pengguna menghafal sintaks kode biner 0 dan 1",
      "Bahasa yang menggunakan balok-balok perintah grafis yang dapat disusun seperti puzzle",
      "Perangkat keras khusus untuk memperbaiki motherboard komputer",
      "Aplikasi pengolah kata untuk mencetak dokumen surat resmi"
    ],
    answer: 1,
    explanation: "Scratch adalah bahasa pemrograman visual berbasis blok di mana kita menyusun logika dengan cara menyeret balok grafis tanpa perlu mengetik kode manual."
  },
  {
    question: "Dalam antarmuka Scratch, apa fungsi dari tombol Bendera Hijau (Green Flag)?",
    options: [
      "Menghapus seluruh sprite dari panggung",
      "Menyimpan proyek secara otomatis ke flashdisk",
      "Memulai jalannya instruksi program atau skrip kode yang telah dirakit",
      "Mengganti warna latar belakang menjadi warna hijau"
    ],
    answer: 2,
    explanation: "Bendera Hijau (Green Flag) berfungsi sebagai pemicu utama (Events) untuk mengeksekusi skrip instruksi yang diawali balok 'when flag clicked'."
  },
  {
    question: "Area di mana karakter menampilkan animasi, aksi gerak, dan permainan disebut...",
    options: [
      "Panggung (Stage)",
      "Palet Blok (Block Palette)",
      "Baris Perintah (Command Line)",
      "Folder Dokumen"
    ],
    answer: 0,
    explanation: "Panggung (Stage) adalah kanvas tempat semua sprite beraksi dan menampilkan hasil interaksi program."
  },
  {
    question: "Balok berkode warna BIRU pada Scratch termasuk dalam kelompok kategori...",
    options: [
      "Sound (Suara)",
      "Motion (Gerakan)",
      "Events (Kejadian)",
      "Variables (Variabel)"
    ],
    answer: 1,
    explanation: "Balok warna Biru di Scratch secara konsisten melambangkan kategori Motion (Gerakan), seperti berpindah posisi, berputar, dan meluncur."
  },
  {
    question: "Mengapa urutan penempatan balok instruksi sangat penting dalam pemrograman?",
    options: [
      "Karena komputer hanya bisa membaca balok yang warnanya sama",
      "Karena instruksi dieksekusi secara sekuensial (runtunan dari atas ke bawah)",
      "Karena komputer akan rusak jika balok dipasang terbalik",
      "Karena ukuran balok harus disesuaikan dengan berat karakter"
    ],
    answer: 1,
    explanation: "Komputer bekerja berdasarkan struktur algoritma sekuensial, yakni menjalankan instruksi baris demi baris dari urutan teratas ke bawah."
  }
];

// Modul 5: Kuis Interaktif (10 Soal HOTS)
const QuizQuestions = [
  {
    id: 1,
    question: "Perhatikan susunan kode berikut: 'repeat (4) [ move 50 steps, turn right 90 degrees ]'. Bentuk lintasan apakah yang akan dibentuk oleh sprite tersebut?",
    options: [
      "Garis lurus bolak-balik",
      "Bangun datar Segitiga Sama Sisi",
      "Bangun datar Persegi (Bujur Sangkar)",
      "Lingkaran penuh sempurna"
    ],
    answer: 2,
    rationale: "Dengan bergerak 50 langkah lalu berputar 90 derajat sebanyak 4 kali (total putaran 360 derajat dengan 4 sisi sama panjang), sprite membentuk bangun Persegi sempurna."
  },
  {
    id: 2,
    question: "Sebuah variabel bernama 'Skor' bernilai awal 10. Jika dijalankan blok: 'repeat (3) [ change Skor by 5 ]', berapakah nilai akhir dari variabel 'Skor' tersebut?",
    options: [
      "15",
      "25",
      "35",
      "50"
    ],
    answer: 1,
    rationale: "Nilai awal = 10. Perulangan 3 kali penambahan 5: 10 + (3 × 5) = 10 + 15 = 25."
  },
  {
    id: 3,
    question: "Kamu ingin membuat game di mana karakter burung selalu jatuh perlahan karena efek gravitasi saat tidak ada tombol yang ditekan. Balok logika manakah yang paling tepat digunakan?",
    options: [
      "forever [ change y by -2 ]",
      "when space key pressed [ turn right 180 degrees ]",
      "repeat (10) [ change x by 10 ]",
      "set y to (180)"
    ],
    answer: 0,
    rationale: "Balok 'forever [ change y by -2 ]' akan secara terus-menerus mengurangi koordinat Y sprite ke arah bawah panggung, menyimulasikan gravitasi terus menerus."
  },
  {
    id: 4,
    question: "Karakter berada tepat di tengah panggung pada koordinat (0, 0). Setelah menerima perintah: 'change x by 120' dilanjutkan 'change y by -80', di kuadran koordinat manakah karakter sekarang berada?",
    options: [
      "Kanan Atas (X positif, Y positif)",
      "Kiri Atas (X negatif, Y positif)",
      "Kanan Bawah (X positif, Y negatif)",
      "Kiri Bawah (X negatif, Y negatif)"
    ],
    answer: 2,
    rationale: "Koordinat baru menjadi X: 120 (positif / kanan) dan Y: -80 (negatif / bawah). Ini berada pada kuadran kanan bawah kanvas."
  },
  {
    id: 5,
    question: "Dalam proyek Scratch, terdapat 2 sprite: 'Kucing' dan 'Tikus'. Ketika Kucing berhasil menangkap Tikus, kamu ingin memicu suara 'Game Over' pada panggung. Mekanisme komunikasi antar-sprite terbaik adalah menggunakan...",
    options: [
      "Balok 'broadcast [pesan]' dan balok 'when I receive [pesan]'",
      "Menggandakan seluruh skrip Kucing ke dalam Sprite Tikus",
      "Mengubah warna panggung secara acak",
      "Menghapus panggung utama"
    ],
    answer: 0,
    rationale: "Fitur 'Broadcast' (Penyiaran Pesan) adalah mekanisme standar dalam Scratch untuk mengirim sinyal komunikasi antar sprite maupun ke backdrop panggung."
  },
  {
    id: 6,
    question: "Ketika program game dijalankan, sprite bola bergerak maju ke kanan layar namun terus menembus batas kanvas hingga menghilang dari pandangan. Solusi perbaikan kode (debugging) yang paling tepat adalah...",
    options: [
      "Menambahkan balok 'if on edge, bounce' di dalam perulangan gerak bola",
      "Mengurangi ukuran sprite menjadi 1%",
      "Menghapus bendera hijau dari skrip",
      "Menambahkan balok 'wait 10 seconds'"
    ],
    answer: 0,
    rationale: "Balok 'if on edge, bounce' mendeteksi ketika tepi sprite menyentuh batas layar dan secara otomatis membalikkan arah pergerakan agar tidak hilang."
  },
  {
    id: 7,
    question: "Mengapa seorang pembuat game interaktif harus menggunakan balok 'forever [ if key [spasi] pressed? then ... ]' daripada hanya 'if key [spasi] pressed?' satu kali saja?",
    options: [
      "Agar program langsung selesai dalam 1 detik",
      "Karena pengecekan kondisi harus berlangsung terus-menerus selama game aktif, bukan hanya pada milidetik pertama saat bendera hijau ditekan",
      "Supaya ukuran berkas file menjadi lebih besar",
      "Karena balok if tidak bisa bekerja tanpa kata forever"
    ],
    answer: 1,
    rationale: "Jika balok 'if' diletakkan di luar 'forever', komputer hanya memeriksa tombol sekali tepat saat bendera hijau diklik. Dengan 'forever', komputer mendengarkan input keyboard setiap frame permainan."
  },
  {
    id: 8,
    question: "Perhatikan ekspresi operator logika: '< (Skor > 50) and (Kunci_Emas = 'Ya') >'. Kapan kondisi di dalam percabangan 'if' tersebut akan menghasilkan nilai BENAR (TRUE)?",
    options: [
      "Cukup jika Skor bernilai 60, meskipun tidak punya Kunci Emas",
      "Hanya jika kedua syarat terpenuhi sekaligus: Skor di atas 50 DAN memiliki Kunci Emas 'Ya'",
      "Jika salah satu syarat saja yang terpenuhi",
      "Kondisi tersebut tidak akan pernah bernilai benar"
    ],
    answer: 1,
    rationale: "Operator 'AND' menuntut kedua belah pernyataan bernilai True secara bersamaan agar seluruh kondisi bernilai True."
  },
  {
    id: 9,
    question: "Saat membuat animasi kucing berlari, siswa merangkai balok: 'forever [ next costume, move 10 steps ]'. Namun kucing tampak berkedip terlalu cepat dan aneh. Mengapa hal ini terjadi?",
    options: [
      "Komputer mengeksekusi loop jutaan siklus per detik sehingga butuh balok jeda 'wait 0.1 secs'",
      "Sprite kucing kehabisan memori grafis",
      "Kucing tidak memiliki kostum kedua",
      "Balok move 10 steps rusak"
    ],
    answer: 0,
    rationale: "Prosesor komputer menjalankan instruksi dalam hitungan mikrodetik. Tanpa balok 'wait 0.1 secs', pergantian kostum terlalu cepat untuk ditangkap oleh mata manusia."
  },
  {
    id: 10,
    question: "Dalam konsep Berpikir Komputasional (Computational Thinking), proses memecah pembuatan game Scratch yang kompleks (seperti game Flappy Bird) menjadi bagian-bagian kecil (kontrol lompat, gerak pipa rintangan, sistem skor) disebut...",
    options: [
      "Abstraksi (Abstraction)",
      "Dekomposisi (Decomposition)",
      "Pengenalan Pola (Pattern Recognition)",
      "Perancangan Algoritma Otomatis"
    ],
    answer: 1,
    rationale: "Dekomposisi adalah teknik memecah masalah besar dan rumit menjadi bagian-bagian yang lebih kecil dan lebih mudah dikelola serta diprogram secara mandiri."
  }
];

// Modul 6: Asesmen Akhir (10 Soal Evaluasi Sumatif)
const FinalExamQuestions = [
  {
    question: "Manakah di antara pasangan kategori balok Scratch berikut yang tepat mendefinisikan fungsinya?",
    options: [
      "Motion: Mengubah warna sprite; Looks: Memindahkan koordinat sprite",
      "Events: Pemicu awal jalannya skrip; Control: Mengatur percabangan dan pengulangan aliran program",
      "Sensing: Menyimpan variabel nama; Variables: Memeriksa klik mouse",
      "Sound: Mengubah kostum karakter; Operators: Memutar lagu"
    ],
    answer: 1
  },
  {
    question: "Jika kamu ingin membuat karakter menghitung mundur dari 5 hingga 1 kemudian berseru 'Mulai!', manakah kombinasi struktur yang paling efisien?",
    options: [
      "Menulis 5 kali balok say 'Halo'",
      "Menggunakan variabel hitung dengan balok 'repeat (5) [ say (hitung) for 1 secs, change hitung by -1 ]', lalu 'say [Mulai!]'",
      "Menggunakan balok 'forever [ change x by 5 ]'",
      "Mematikan tombol stop secara paksa"
    ],
    answer: 1
  },
  {
    question: "Titik pusat koordinat pada Panggung (Stage) Scratch terletak tepat pada nilai...",
    options: [
      "X: 240, Y: 180",
      "X: 0, Y: 0",
      "X: -240, Y: -180",
      "X: 100, Y: 100"
    ],
    answer: 1
  },
  {
    question: "Apa yang terjadi jika balok 'stop [all]' dieksekusi di dalam salah satu sprite?",
    options: [
      "Hanya sprite tersebut yang berhenti bergerak",
      "Seluruh program di panggung berhenti beroperasi secara total",
      "Aplikasi Scratch akan otomatis tertutup dan dihapus",
      "Skor pemain akan langsung bertambah 100"
    ],
    answer: 1
  },
  {
    question: "Perbedaan utama antara balok 'say [Halo!] for 2 secs' dengan 'say [Halo!]' tanpa waktu adalah...",
    options: [
      "Balok dengan waktu akan menahan aliran program selama 2 detik sebelum lanjut ke balok berikutnya",
      "Balok tanpa waktu akan mengeluarkan suara keras",
      "Balok dengan waktu hanya bisa digunakan untuk sprite kucing",
      "Tidak ada perbedaan sama sekali"
    ],
    answer: 0
  },
  {
    question: "Manakah balok yang paling tepat untuk mendeteksi apakah pemain mengarahkan kursor mouse ke arah sprite?",
    options: [
      "< touching [mouse-pointer]? > dari kategori Sensing",
      "(mouse x) dari kategori Motion",
      "when space key pressed dari kategori Events",
      "pick random (1) to (10) dari kategori Operators"
    ],
    answer: 0
  },
  {
    question: "Dalam membuat sistem 'Nyawa Karakter' yang berkurang 1 setiap kali terkena rintangan duri, tipe data manakah yang harus digunakan?",
    options: [
      "Backdrop Panggung",
      "Variabel (Variable)",
      "Balok Sound Effect",
      "Kostum Vektor"
    ],
    answer: 1
  },
  {
    question: "Apakah sebuah Sprite dapat memiliki lebih dari satu blok 'when ⚑ clicked' di dalam area skripnya?",
    options: [
      "Tidak bisa, karena sistem Scratch akan error",
      "Bisa, dan seluruh skrip tersebut akan berjalan secara bersamaan (multitasking / paralel)",
      "Hanya bisa maksimal dua buah saja",
      "Hanya bisa jika spritenya berwarna kuning"
    ],
    answer: 1
  },
  {
    question: "Fungsi dari balok operator 'pick random (1) to (10)' adalah...",
    options: [
      "Mengambil angka acak antara 1 sampai 10 untuk menciptakan elemen ketidakpastian / variasi",
      "Menjumlahkan angka 1 ditambah 10 menjadi 11",
      "Memilih kostum nomor 1 lalu langsung berhenti",
      "Membagi angka 10 dengan 1"
    ],
    answer: 0
  },
  {
    question: "Manakah tindakan yang menunjukkan penerapan 'Growth Mindset' saat proyek coding Scratch-mu mengalami bug/kesalahan?",
    options: [
      "Langsung menyerah dan menghapus seluruh proyek",
      "Menyalahkan komputer karena dianggap rusak",
      "Memeriksa alur urutan balok secara tenang dan melakukan uji coba perbaikan (debugging)",
      "Meminta orang lain menyelesaikan seluruh tugasmu tanpa mempelajarinya"
    ],
    answer: 2
  }
];

// =====================================================================
// 3. AUDIO SYNTHESIZER (Web Audio API - Ambient Lo-Fi Pentatonic)
// =====================================================================
class LearningAudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C Pentatonic
    this.step = 0;
    this.timer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.playChordArpeggio();
    this.timer = setInterval(() => {
      if (this.isPlaying) this.playChordArpeggio();
    }, 450);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  playChordArpeggio() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft ambient triangle wave
      osc.type = 'triangle';
      const freq = this.scale[this.step % this.scale.length];
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);

      this.step = (this.step + 1) % (this.scale.length * 2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playEffect(type) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (type === 'meow') {
        // Synthesized Scratch Cat Meow sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'correct') {
        // Bright chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'fanfare') {
        // Victory fanfare
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.12);
        osc.frequency.setValueAtTime(659.25, now + 0.24);
        osc.frequency.setValueAtTime(880, now + 0.36);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      }
    } catch (e) {
      console.warn('Effect error:', e);
    }
  }
}

const AudioEngine = new LearningAudioSynth();

// =====================================================================
// 4. CONFETTI ENGINE (Native Canvas Particles)
// =====================================================================
class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confettiCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    this.colors = ['#6c5ce7', '#00cec9', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa'];
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(durationMs = 3500) {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    
    // Create particles
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height * 0.5,
        size: Math.random() * 8 + 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        velX: (Math.random() - 0.5) * 4,
        velY: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(p => {
        p.x += p.velX;
        p.y += p.velY;
        p.rot += p.rotSpeed;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rot * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      });

      if (elapsed < durationMs) {
        this.animId = requestAnimationFrame(animate);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
      }
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    animate();
  }
}

const Confetti = new ConfettiEngine();

// =====================================================================
// 5. NAVIGATION & PROGRESS ENGINE
// =====================================================================

function initNavigation() {
  // Quick Pills Setup
  const quickPills = document.getElementById('moduleQuickPills');
  if (quickPills) {
    quickPills.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const btn = document.createElement('button');
      btn.className = `pill-step ${i === AppState.currentModule ? 'active' : ''}`;
      btn.textContent = i;
      btn.title = ModuleInfo[i].title;
      btn.onclick = () => navigateToModule(i);
      quickPills.appendChild(btn);
    }
  }

  // Bind Menu Cards
  for (let i = 1; i <= 8; i++) {
    const card = document.getElementById(`cardModule${i}`);
    if (card) {
      card.onclick = () => navigateToModule(i);
    }
  }

  // Header Nav & Subnav
  const btnHome = document.getElementById('btnNavHome');
  if (btnHome) btnHome.onclick = () => navigateToModule(0);

  const btnSubNavHome = document.getElementById('btnSubNavHome');
  if (btnSubNavHome) btnSubNavHome.onclick = () => navigateToModule(0);

  // Audio Toggle
  const btnAudio = document.getElementById('btnAudioToggle');
  if (btnAudio) btnAudio.onclick = toggleAudio;

  // Theme Toggle
  const btnTheme = document.getElementById('btnThemeToggle');
  if (btnTheme) btnTheme.onclick = toggleTheme;

  // Download Summary
  const btnDownloadSummary = document.getElementById('btnDownloadSummary');
  if (btnDownloadSummary) btnDownloadSummary.onclick = downloadLearningSummary;

  updateUIProgress();
}

function navigateToModule(moduleIdx) {
  AppState.currentModule = moduleIdx;

  // Hide all views
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });

  // Subnav visibility
  const subNav = document.getElementById('subNav');
  if (subNav) {
    subNav.style.display = moduleIdx === 0 ? 'none' : 'block';
  }

  if (moduleIdx === 0) {
    const homeView = document.getElementById('viewMenuUtama');
    if (homeView) homeView.classList.add('active');
  } else {
    const targetView = document.getElementById(`viewModule${moduleIdx}`);
    if (targetView) targetView.classList.add('active');

    // Update Subnav Info
    const info = ModuleInfo[moduleIdx];
    const iconEl = document.getElementById('currModuleIcon');
    const titleEl = document.getElementById('currModuleTitle');
    if (iconEl) iconEl.textContent = info.icon;
    if (titleEl) titleEl.textContent = info.title;

    // Trigger module-specific initializations
    if (moduleIdx === 2) renderPretestQuestion();
    if (moduleIdx === 4) resetScratchSprite();
    if (moduleIdx === 5) renderQuizQuestion();
    if (moduleIdx === 6) renderFinalExamQuestion();
    if (moduleIdx === 8) renderCertificate();
  }

  // Bottom Navigation Bar Text
  const stepIndicator = document.getElementById('barStepIndicator');
  if (stepIndicator) {
    stepIndicator.textContent = moduleIdx === 0 ? 'Menu Utama' : `Modul ${moduleIdx} / 8`;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  updateUIProgress();
}

function navigateNext() {
  if (AppState.currentModule < 8) {
    navigateToModule(AppState.currentModule + 1);
  } else {
    navigateToModule(0);
  }
}

function navigatePrev() {
  if (AppState.currentModule > 0) {
    navigateToModule(AppState.currentModule - 1);
  }
}

function markCompletedAndNext(moduleIdx) {
  AppState.completedModules.add(moduleIdx);
  checkBadges();
  updateUIProgress();
  showToast(`Modul ${moduleIdx} selesai! Hebat! 🎉`);

  if (moduleIdx < 8) {
    navigateToModule(moduleIdx + 1);
  } else {
    navigateToModule(0);
  }
}

function updateUIProgress() {
  const total = 8;
  const completed = AppState.completedModules.size;
  const pct = Math.round((completed / total) * 100);

  // Header Progress
  const pctText = document.getElementById('overallProgressPercent');
  const fillBar = document.getElementById('overallProgressBar');
  if (pctText) pctText.textContent = `${pct}%`;
  if (fillBar) fillBar.style.width = `${pct}%`;

  // Quick pills active state
  const pills = document.querySelectorAll('.pill-step');
  pills.forEach((p, idx) => {
    const stepNum = idx + 1;
    p.classList.remove('active', 'completed');
    if (stepNum === AppState.currentModule) {
      p.classList.add('active');
    } else if (AppState.completedModules.has(stepNum)) {
      p.classList.add('completed');
    }
  });

  // Update Menu Cards Status
  for (let i = 1; i <= 8; i++) {
    const chip = document.getElementById(`statusChip${i}`);
    const card = document.getElementById(`cardModule${i}`);
    if (chip && card) {
      if (AppState.completedModules.has(i)) {
        chip.textContent = '✓ Selesai';
        chip.className = 'card-status-chip done';
        card.classList.add('completed');
      } else if (i === AppState.currentModule) {
        chip.textContent = 'Sedang Aktif';
        chip.className = 'card-status-chip active';
      } else {
        chip.textContent = 'Belum Selesai';
        chip.className = 'card-status-chip pending';
      }
    }
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'dark';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  AppState.theme = newTheme;

  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (icon) icon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
  if (text) text.textContent = newTheme === 'dark' ? 'Gelap' : 'Terang';
}

function toggleAudio() {
  AppState.audioActive = !AppState.audioActive;
  const icon = document.getElementById('audioIcon');
  const text = document.getElementById('audioText');
  const indicator = document.getElementById('audioIndicator');

  if (AppState.audioActive) {
    AudioEngine.start();
    if (icon) icon.textContent = '🔊';
    if (text) text.textContent = 'BGM: ON';
    if (indicator) indicator.classList.add('active');
    showToast('Musik latar belajar diaktifkan 🎵');
  } else {
    AudioEngine.stop();
    if (icon) icon.textContent = '🎵';
    if (text) text.textContent = 'BGM: OFF';
    if (indicator) indicator.classList.remove('active');
    showToast('Musik latar dinonaktifkan 🔇');
  }
}

function showToast(message, icon = 'ℹ️') {
  const toast = document.getElementById('toastPopup');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  if (toastIcon) toastIcon.textContent = icon;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function checkBadges() {
  // Badge 1: First Step (Apersepsi & Pretest selesai)
  if (AppState.completedModules.has(1) && AppState.completedModules.has(2)) {
    unlockBadge(1);
  }
  // Badge 2: Logic Explorer (Materi selesai)
  if (AppState.completedModules.has(3)) {
    unlockBadge(2);
  }
  // Badge 3: Block Crafter (Simulasi selesai)
  if (AppState.completedModules.has(4)) {
    unlockBadge(3);
  }
  // Badge 4: HOTS Champion (Skor Kuis >= 80)
  if (AppState.quizScore >= 80) {
    unlockBadge(4);
  }
  // Badge 5: Scratch Master (Nilai Akhir >= 90)
  if (AppState.finalExamScore >= 90) {
    unlockBadge(5);
  }
}

function unlockBadge(badgeNum) {
  if (!AppState.unlockedBadges.has(badgeNum)) {
    AppState.unlockedBadges.add(badgeNum);
    const badgeEl = document.getElementById(`badge${badgeNum}`);
    if (badgeEl) {
      badgeEl.classList.remove('locked');
      badgeEl.classList.add('unlocked');
    }
  }
}

// =====================================================================
// 6. MODULE 1: APERSEPSI LOGIC
// =====================================================================

function handleSparkChoice(btn, explanation) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.choice-bubble').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  const qid = parent.getAttribute('data-qid');
  const fbEl = document.getElementById(qid === 'q1' ? 'sparkFeedback1' : 'sparkFeedback2');
  if (fbEl) {
    fbEl.textContent = explanation;
    fbEl.style.display = 'block';
  }
}

function initApersepsi() {
  const btnCuriosity = document.getElementById('btnSubmitCuriosity');
  if (btnCuriosity) {
    btnCuriosity.onclick = () => {
      const input = document.getElementById('studentCuriosityInput');
      const resp = document.getElementById('curiosityResponse');
      if (input && input.value.trim().length > 0) {
        resp.style.display = 'block';
        resp.innerHTML = `✨ <strong>Ide Luar Biasa!</strong> "${input.value.trim()}" sangat mungkin diwujudkan dengan Scratch. Ayo kita pelajari kuncinya langkah demi langkah!`;
        showToast('Rasa penasaranmu tersimpan! 🚀');
      } else {
        showToast('Tuliskan ide atau karya impianmu terlebih dahulu!');
      }
    };
  }

  // Video Modal
  const btnPlay = document.getElementById('btnPlayVideoMock');
  const modal = document.getElementById('videoModal');
  const btnCloseModal = document.getElementById('btnCloseVideoModal');

  if (btnPlay && modal) {
    btnPlay.onclick = () => modal.classList.add('active');
  }
  if (btnCloseModal && modal) {
    btnCloseModal.onclick = () => modal.classList.remove('active');
  }
}

// =====================================================================
// 7. MODULE 2: ASESMEN AWAL (DIAGNOSTIK)
// =====================================================================

function renderPretestQuestion() {
  const container = document.getElementById('pretestQuestionArea');
  const counter = document.getElementById('pretestCounter');
  const progressBar = document.getElementById('pretestProgressBar');
  const scoreInd = document.getElementById('pretestLiveScore');
  const resultCard = document.getElementById('pretestResultCard');

  if (!container) return;

  if (AppState.pretestCurrentIdx >= PretestQuestions.length) {
    // Show summary
    container.style.display = 'none';
    if (resultCard) resultCard.style.display = 'block';
    
    const finalScoreEl = document.getElementById('pretestFinalScore');
    const feedbackText = document.getElementById('pretestFeedbackText');
    if (finalScoreEl) finalScoreEl.textContent = `${AppState.pretestScore} / 100`;

    let fb = "Kamu sudah memiliki pemahaman awal yang sangat bagus mengenai logika komputasi! Kamu siap menjelajahi materi Scratch lebih dalam.";
    if (AppState.pretestScore < 60) {
      fb = "Jangan khawatir! Asesmen ini bertujuan mengukur titik mula. Modul materi di langkah selanjutnya dirancang visual dan mudah untuk dipahami pemula.";
    }
    if (feedbackText) feedbackText.textContent = fb;

    AppState.completedModules.add(2);
    checkBadges();
    updateUIProgress();
    return;
  }

  container.style.display = 'block';
  if (resultCard) resultCard.style.display = 'none';

  const q = PretestQuestions[AppState.pretestCurrentIdx];
  const qNum = AppState.pretestCurrentIdx + 1;
  const total = PretestQuestions.length;

  if (counter) counter.textContent = `Soal ${qNum} dari ${total}`;
  if (progressBar) progressBar.style.width = `${(qNum / total) * 100}%`;
  if (scoreInd) scoreInd.textContent = `Skor Sementara: ${AppState.pretestScore}`;

  let optionsHtml = '';
  q.options.forEach((opt, idx) => {
    const letter = String.fromCharCode(65 + idx);
    optionsHtml += `
      <button class="quiz-opt-btn" onclick="handlePretestAnswer(${idx})">
        <span class="opt-letter">${letter}</span>
        <span class="opt-text">${opt}</span>
      </button>
    `;
  });

  container.innerHTML = `
    <span class="q-badge">Soal Diagnostik #${qNum}</span>
    <h3 class="q-title">${q.question}</h3>
    <div class="quiz-options-list">${optionsHtml}</div>
    <div class="rationale-panel" id="pretestRationale" style="display: none;">
      <div class="rationale-header">
        <span class="rationale-icon">💡</span>
        <span class="rationale-title">Umpan Balik Instan</span>
      </div>
      <p class="rationale-text">${q.explanation}</p>
      <button class="btn btn-primary mt-3" onclick="nextPretestQuestion()">Lanjut ➔</button>
    </div>
  `;
}

function handlePretestAnswer(selectedIdx) {
  if (AppState.pretestAnswered) return;
  AppState.pretestAnswered = true;

  const q = PretestQuestions[AppState.pretestCurrentIdx];
  const buttons = document.querySelectorAll('#pretestQuestionArea .quiz-opt-btn');

  buttons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === q.answer) {
      btn.classList.add('correct');
    } else if (idx === selectedIdx) {
      btn.classList.add('wrong');
    }
  });

  if (selectedIdx === q.answer) {
    AppState.pretestScore += 20;
    AudioEngine.playEffect('correct');
    showToast('Jawaban Benar! +20 Poin ✨');
  } else {
    showToast('Jawaban kurang tepat. Cermati pembahasannya!');
  }

  const rationale = document.getElementById('pretestRationale');
  if (rationale) rationale.style.display = 'block';
}

function nextPretestQuestion() {
  AppState.pretestAnswered = false;
  AppState.pretestCurrentIdx++;
  renderPretestQuestion();
}

function initPretest() {
  const btnRetry = document.getElementById('btnRetryPretest');
  if (btnRetry) {
    btnRetry.onclick = () => {
      AppState.pretestCurrentIdx = 0;
      AppState.pretestScore = 0;
      AppState.pretestAnswered = false;
      renderPretestQuestion();
    };
  }
}

// =====================================================================
// 8. MODULE 3: MATERI PEMBELAJARAN (TABS & PALETTE EXPLORER)
// =====================================================================

const BlockCategoryDetails = {
  motion: {
    name: 'Motion (Gerakan)',
    color: '#4c97ff',
    title: 'Mengatur Posisi, Koordinat, dan Perpindahan Karakter',
    desc: 'Balok gerakan mengendalikan koordinat X (kiri-kanan) dan Y (atas-bawah), memutar orientasi arah (0-360 derajat), serta mendeteksi batas tepi panggung.',
    blocks: ['move (10) steps', 'turn ↷ (15) degrees', 'go to x: (0) y: (0)', 'if on edge, bounce']
  },
  looks: {
    name: 'Looks (Tampilan)',
    color: '#9966ff',
    title: 'Mengatur Balon Ucapan, Pergantian Kostum, & Efek Visual',
    desc: 'Balok tampilan memungkinkan karakter berbicara dengan balon dialog, berganti pose/kostum gerak, mengubah warna grafis, serta mengatur tingkat transparansi (ghost).',
    blocks: ['say [Halo Dunia!] for (2) secs', 'switch costume to [costume2]', 'change size by (10)', 'change [color] effect by (25)']
  },
  sound: {
    name: 'Sound (Suara)',
    color: '#cf63cf',
    title: 'Memutar Efek Suara, Musik, & Nada Suara',
    desc: 'Digunakan untuk memutar efek suara bawaan Scratch (seperti meow), rekaman suara mikrofon sendiri, dan mengatur volume panggung.',
    blocks: ['play sound [Meow v] until done', 'start sound [pop v]', 'change volume by (-10)', 'stop all sounds']
  },
  events: {
    name: 'Events (Kejadian)',
    color: '#ffbf00',
    title: 'Pemicu Awal Eksekusi Program (Topi / Hat Blocks)',
    desc: 'Balok kejadian adalah pemicu utama. Skrip kode tidak akan pernah bergerak tanpa balok Events yang memberi tahu komputer kapan instruksi harus dimulai.',
    blocks: ['when ⚑ clicked', 'when [space v] key pressed', 'when this sprite clicked', 'broadcast [pesan1 v]']
  },
  control: {
    name: 'Control (Kontrol)',
    color: '#ffab19',
    title: 'Mengendalikan Alur Perulangan (Loop) & Percabangan (If-Else)',
    desc: 'Mengatur logika waktu: jeda waktu (wait), perulangan terbatas (repeat), perulangan selamanya (forever), dan pengambil keputusan jika kondisi terpenuhi.',
    blocks: ['wait (1) seconds', 'repeat (10)', 'forever', 'if <...?> then']
  },
  sensing: {
    name: 'Sensing (Sensor)',
    color: '#5cb1d6',
    title: 'Mendeteksi Interaksi Sentuhan, Mouse, & Input Pengguna',
    desc: 'Sensor memeriksa apakah sprite bersentuhan dengan sprite lain, batas panggung, warna tertentu, posisi pointer mouse, atau jawaban yang diketik user.',
    blocks: ['<touching [mouse-pointer v]?>', '<touching color [#ff0000]?>', 'ask [Siapa namamu?] and wait', '(mouse x)']
  },
  operators: {
    name: 'Operators (Operator)',
    color: '#59c059',
    title: 'Perhitungan Matematika, Logika, & Penggabungan Teks',
    desc: 'Melakukan operasi aritmetika (+, -, ×, /), pemilih angka acak (pick random), perbandingan logika (>, <, =), serta penggabung kata (join).',
    blocks: ['(pick random (1) to (10))', '<(skor) > (50)>', '< <...> and <...> >', '(join [Halo ] [Dunia])']
  },
  variables: {
    name: 'Variables (Variabel)',
    color: '#ff8c1a',
    title: 'Wadah Digital Penyimpan Nilai Data yang Dinamis',
    desc: 'Variabel digunakan untuk melacak skor permainan, sisa nyawa (lives), timer hitung mundur, atau status level permainan.',
    blocks: ['set [Skor v] to (0)', 'change [Skor v] by (1)', 'show variable [Skor v]', 'hide variable [Skor v]']
  },
  myblocks: {
    name: 'My Blocks (Blok Saya)',
    color: '#ff6680',
    title: 'Membuat Prosedur / Fungsi Khusus Sendiri',
    desc: 'Digunakan untuk merangkum baris instruksi panjang menjadi satu balok baru yang dapat dipanggil berkali-kali tanpa redundansi kode.',
    blocks: ['define [Lompat Tinggi]', 'define [Animasi Menang]']
  }
};

function initMateri() {
  // Tab Switching
  const tabs = document.querySelectorAll('.mat-tab');
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    };
  });

  // Category Palette Explorer Buttons
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(btn => {
    btn.onclick = () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const catKey = btn.getAttribute('data-cat');
      const detail = BlockCategoryDetails[catKey];
      if (!detail) return;

      const panel = document.getElementById('categoryDetailPanel');
      if (panel) {
        let sampleHtml = '';
        detail.blocks.forEach(b => {
          sampleHtml += `<div class="sample-block" style="background: ${detail.color};">${b}</div>`;
        });

        panel.innerHTML = `
          <div class="block-preview-card" style="border-left: 6px solid ${detail.color};">
            <span class="b-tag" style="background: ${detail.color};">${detail.name}</span>
            <h4 class="b-title">${detail.title}</h4>
            <p class="b-desc">${detail.desc}</p>
            <div class="sample-blocks-list">${sampleHtml}</div>
          </div>
        `;
      }
    };
  });
}

// =====================================================================
// 9. MODULE 4: SIMULASI / AKTIVITAS (SCRATCH LAB)
// =====================================================================

const BlockDefinitions = {
  flag: { label: 'when [Bendera Hijau] diklik', class: 'b-event', icon: '🚩', type: 'event' },
  move: { label: 'gerak (20) langkah', class: 'b-motion', icon: '➡️', type: 'motion', action: 'move' },
  turnRight: { label: 'putar ke kanan (15) derajat', class: 'b-motion', icon: '↻', type: 'motion', action: 'turnRight' },
  turnLeft: { label: 'putar ke kiri (15) derajat', class: 'b-motion', icon: '↺', type: 'motion', action: 'turnLeft' },
  jump: { label: 'lompat ke atas (Y: +40)', class: 'b-motion', icon: '⬆️', type: 'motion', action: 'jump' },
  sayHello: { label: 'katakan "Halo Teman!" (2 detik)', class: 'b-looks', icon: '💬', type: 'looks', action: 'sayHello' },
  sayCode: { label: 'katakan "Aku suka coding!" (2 detik)', class: 'b-looks', icon: '💡', type: 'looks', action: 'sayCode' },
  changeColor: { label: 'ubah efek warna sprite', class: 'b-looks', icon: '🌈', type: 'looks', action: 'changeColor' },
  changeSize: { label: 'perbesar ukuran sprite (+10%)', class: 'b-looks', icon: '🔍', type: 'looks', action: 'changeSize' },
  meow: { label: 'bunyikan suara "Meow! 🐱"', class: 'b-sound', icon: '🔊', type: 'sound', action: 'meow' },
  repeat3: { label: 'ulangi (3 kali): maju & putar', class: 'b-control', icon: '🔁', type: 'control', action: 'repeat3' }
};

let assembledBlocks = ['flag', 'move', 'sayHello'];
let spriteState = {
  x: 0,
  y: 0,
  angle: 0,
  scale: 1,
  hue: 0
};
let isSimulating = false;

function initScratchLab() {
  renderAssembledBlocks();

  // Add block from pool
  const poolBtns = document.querySelectorAll('.available-blocks-pool .code-block');
  poolBtns.forEach(btn => {
    btn.onclick = () => {
      const bId = btn.getAttribute('data-block-id');
      if (bId) {
        assembledBlocks.push(bId);
        renderAssembledBlocks();
        showToast('Balok ditambahkan ke skrip!');
      }
    };
  });

  // Clear Blocks
  const btnClear = document.getElementById('btnClearBlocks');
  if (btnClear) {
    btnClear.onclick = () => {
      assembledBlocks = [];
      renderAssembledBlocks();
      showToast('Skrip dibersihkan');
    };
  }

  // Run Code
  const btnRun = document.getElementById('btnRunScratchCode');
  const btnFlag = document.getElementById('btnStageFlag');
  if (btnRun) btnRun.onclick = runScratchSimulation;
  if (btnFlag) btnFlag.onclick = runScratchSimulation;

  // Stop Simulation
  const btnStop = document.getElementById('btnStageStop');
  if (btnStop) {
    btnStop.onclick = () => {
      isSimulating = false;
      const log = document.getElementById('stageLogMsg');
      if (log) log.textContent = 'Program dihentikan oleh pengguna 🛑';
      showToast('Program dihentikan');
    };
  }

  // Reset Sprite
  const btnReset = document.getElementById('btnResetSprite');
  if (btnReset) btnReset.onclick = resetScratchSprite;
}

function renderAssembledBlocks() {
  const dropZone = document.getElementById('scriptDropZone');
  if (!dropZone) return;

  if (assembledBlocks.length === 0) {
    dropZone.innerHTML = `
      <div class="empty-script-msg" id="emptyScriptMsg">
        <span>Belum ada balok kode. Klik balok di atas untuk mulai merangkai!</span>
      </div>
    `;
    return;
  }

  let html = '';
  assembledBlocks.forEach((bId, idx) => {
    const def = BlockDefinitions[bId];
    if (!def) return;
    html += `
      <div class="assembled-item ${def.class}">
        <span>${def.icon} ${def.label}</span>
        <button class="btn-remove-blk" onclick="removeBlockFromScript(${idx})" title="Hapus Balok">✕</button>
      </div>
    `;
  });

  dropZone.innerHTML = html;
}

function removeBlockFromScript(idx) {
  assembledBlocks.splice(idx, 1);
  renderAssembledBlocks();
}

function resetScratchSprite() {
  spriteState = { x: 0, y: 0, angle: 0, scale: 1, hue: 0 };
  applySpriteTransform();
  
  const bubble = document.getElementById('catSpeechBubble');
  if (bubble) bubble.classList.remove('active');

  const log = document.getElementById('stageLogMsg');
  if (log) log.textContent = 'Posisi Kucing di-reset ke titik tengah (0, 0)';
}

function applySpriteTransform() {
  const cat = document.getElementById('scratchCatSprite');
  const coordX = document.getElementById('spriteCoordX');
  const coordY = document.getElementById('spriteCoordY');
  const angleEl = document.getElementById('spriteAngle');

  if (cat) {
    cat.style.transform = `translate(${spriteState.x}px, ${-spriteState.y}px) rotate(${spriteState.angle}deg) scale(${spriteState.scale})`;
    cat.style.filter = spriteState.hue ? `hue-rotate(${spriteState.hue}deg)` : 'none';
  }
  if (coordX) coordX.textContent = Math.round(spriteState.x);
  if (coordY) coordY.textContent = Math.round(spriteState.y);
  if (angleEl) angleEl.textContent = `${(spriteState.angle % 360 + 360) % 360}°`;
}

async function runScratchSimulation() {
  if (isSimulating) return;
  if (assembledBlocks.length === 0) {
    showToast('Tambahkan balok kode terlebih dahulu!');
    return;
  }

  isSimulating = true;
  const log = document.getElementById('stageLogMsg');
  if (log) log.textContent = 'Mengeksekusi susunan balok kode... 🚀';

  for (let i = 0; i < assembledBlocks.length; i++) {
    if (!isSimulating) break;

    const bId = assembledBlocks[i];
    const def = BlockDefinitions[bId];

    if (def.action === 'move') {
      const rad = (spriteState.angle * Math.PI) / 180;
      spriteState.x += Math.cos(rad) * 35;
      spriteState.y += Math.sin(rad) * 35;
      // Bounce if edge
      if (Math.abs(spriteState.x) > 130) spriteState.x = spriteState.x > 0 ? 130 : -130;
      if (Math.abs(spriteState.y) > 90) spriteState.y = spriteState.y > 0 ? 90 : -90;
      applySpriteTransform();
    } else if (def.action === 'turnRight') {
      spriteState.angle += 30;
      applySpriteTransform();
    } else if (def.action === 'turnLeft') {
      spriteState.angle -= 30;
      applySpriteTransform();
    } else if (def.action === 'jump') {
      spriteState.y += 40;
      applySpriteTransform();
      await new Promise(r => setTimeout(r, 250));
      spriteState.y -= 40;
      applySpriteTransform();
    } else if (def.action === 'sayHello' || def.action === 'sayCode') {
      const bubble = document.getElementById('catSpeechBubble');
      if (bubble) {
        bubble.textContent = def.action === 'sayHello' ? 'Halo Teman! 👋' : 'Aku suka coding! 💻';
        bubble.classList.add('active');
      }
      await new Promise(r => setTimeout(r, 1200));
      if (bubble) bubble.classList.remove('active');
    } else if (def.action === 'changeColor') {
      spriteState.hue = (spriteState.hue + 60) % 360;
      applySpriteTransform();
    } else if (def.action === 'changeSize') {
      spriteState.scale = Math.min(spriteState.scale + 0.15, 1.6);
      applySpriteTransform();
    } else if (def.action === 'meow') {
      AudioEngine.playEffect('meow');
    } else if (def.action === 'repeat3') {
      for (let r = 0; r < 3; r++) {
        spriteState.x += 15;
        spriteState.angle += 15;
        applySpriteTransform();
        await new Promise(res => setTimeout(res, 200));
      }
    }

    await new Promise(r => setTimeout(r, 380));
  }

  isSimulating = false;
  if (log) log.textContent = 'Eksekusi kode selesai dengan sukses! 🌟';
  
  // Growth mindset dynamic feedback
  const gmDesc = document.getElementById('gmDesc');
  if (gmDesc) {
    const praises = [
      "Hebat sekali! Kamu berpikir secara sistematis dan analitis layaknya software engineer sejati!",
      "Luar biasa! Setiap blok yang kamu susun membuktikan bahwa kamu mampu menguasai logika komputasi!",
      "Keren! Jika ada hasil gerak yang tak terduga, jadikan itu bahan eksplorasi baru untuk melatih insting debugging-mu!"
    ];
    gmDesc.innerHTML = praises[Math.floor(Math.random() * praises.length)];
  }

  AppState.completedModules.add(4);
  checkBadges();
  updateUIProgress();
}

// =====================================================================
// 10. MODULE 5: KUIS INTERAKTIF (10 SOAL HOTS)
// =====================================================================

function startQuizTimer() {
  if (AppState.quizTimerInterval) clearInterval(AppState.quizTimerInterval);
  AppState.quizTimerInterval = setInterval(() => {
    AppState.quizTimerSeconds++;
    const m = String(Math.floor(AppState.quizTimerSeconds / 60)).padStart(2, '0');
    const s = String(AppState.quizTimerSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('quizTimer');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function renderQuizQuestion() {
  if (!AppState.quizTimerInterval) startQuizTimer();

  const container = document.getElementById('quizQuestionArea');
  const counter = document.getElementById('quizCounter');
  const progressBar = document.getElementById('quizProgressBar');
  const scoreInd = document.getElementById('quizLiveScore');
  const rationalePanel = document.getElementById('quizRationalePanel');
  const summaryCard = document.getElementById('quizSummaryCard');

  if (!container) return;

  if (AppState.quizCurrentIdx >= QuizQuestions.length) {
    // Quiz Completed
    clearInterval(AppState.quizTimerInterval);
    container.style.display = 'none';
    if (rationalePanel) rationalePanel.style.display = 'none';
    if (summaryCard) summaryCard.style.display = 'block';

    const finalScore = document.getElementById('quizFinalScoreDisplay');
    const summaryText = document.getElementById('quizSummaryText');
    if (finalScore) finalScore.textContent = `${AppState.quizScore} / 100`;

    let msg = "Analisis logika yang tajam! Kamu telah menguasai konsep berpikir tingkat tinggi di Scratch.";
    if (AppState.quizScore < 70) {
      msg = "Bagus! Kamu sudah berani memecahkan soal HOTS. Pelajari kembali pembahasan di setiap nomor untuk memperkuat logikamu.";
    }
    if (summaryText) summaryText.textContent = msg;

    AppState.completedModules.add(5);
    checkBadges();
    updateUIProgress();
    return;
  }

  container.style.display = 'block';
  if (rationalePanel) rationalePanel.style.display = 'none';
  if (summaryCard) summaryCard.style.display = 'none';

  const q = QuizQuestions[AppState.quizCurrentIdx];
  const qNum = AppState.quizCurrentIdx + 1;
  const total = QuizQuestions.length;

  if (counter) counter.textContent = `Soal ${qNum} dari ${total}`;
  if (progressBar) progressBar.style.width = `${(qNum / total) * 100}%`;
  if (scoreInd) scoreInd.textContent = `Skor: ${AppState.quizScore}`;

  let optionsHtml = '';
  q.options.forEach((opt, idx) => {
    const letter = String.fromCharCode(65 + idx);
    optionsHtml += `
      <button class="quiz-opt-btn" onclick="handleQuizAnswer(${idx})">
        <span class="opt-letter">${letter}</span>
        <span class="opt-text">${opt}</span>
      </button>
    `;
  });

  container.innerHTML = `
    <span class="q-badge">Soal HOTS #${qNum}</span>
    <h3 class="q-title">${q.question}</h3>
    <div class="quiz-options-list">${optionsHtml}</div>
  `;
}

function handleQuizAnswer(selectedIdx) {
  if (AppState.quizAnswered) return;
  AppState.quizAnswered = true;

  const q = QuizQuestions[AppState.quizCurrentIdx];
  const buttons = document.querySelectorAll('#quizQuestionArea .quiz-opt-btn');

  buttons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === q.answer) {
      btn.classList.add('correct');
    } else if (idx === selectedIdx) {
      btn.classList.add('wrong');
    }
  });

  const isCorrect = selectedIdx === q.answer;
  if (isCorrect) {
    AppState.quizScore += 10;
    AudioEngine.playEffect('correct');
    showToast('Tepat sekali! +10 Poin ✨');
  } else {
    showToast('Kurang tepat. Cermati pembahasan logikanya.');
  }

  const rationalePanel = document.getElementById('quizRationalePanel');
  const rationaleText = document.getElementById('rationaleText');
  const rationaleTitle = document.getElementById('rationaleTitle');
  const rationaleIcon = document.getElementById('rationaleIcon');

  if (rationalePanel && rationaleText) {
    rationaleTitle.textContent = isCorrect ? 'Jawaban Benar! Analisis Logika:' : 'Pembahasan Jawaban yang Benar:';
    rationaleIcon.textContent = isCorrect ? '🎉' : '💡';
    rationaleText.textContent = q.rationale;
    rationalePanel.style.display = 'block';
  }
}

function nextQuizQuestion() {
  AppState.quizAnswered = false;
  AppState.quizCurrentIdx++;
  renderQuizQuestion();
}

function initQuiz() {
  const btnNext = document.getElementById('btnNextQuizQuestion');
  if (btnNext) btnNext.onclick = nextQuizQuestion;

  const btnRetry = document.getElementById('btnRetryQuiz');
  if (btnRetry) {
    btnRetry.onclick = () => {
      AppState.quizCurrentIdx = 0;
      AppState.quizScore = 0;
      AppState.quizAnswered = false;
      AppState.quizTimerSeconds = 0;
      renderQuizQuestion();
    };
  }
}

// =====================================================================
// 11. MODULE 6: ASESMEN AKHIR (SUMATIF & PREDIKAT)
// =====================================================================

function startFinalExamTimer() {
  if (AppState.finalExamTimerInterval) clearInterval(AppState.finalExamTimerInterval);
  AppState.finalExamTimerInterval = setInterval(() => {
    AppState.finalExamTimerSeconds++;
    const m = String(Math.floor(AppState.finalExamTimerSeconds / 60)).padStart(2, '0');
    const s = String(AppState.finalExamTimerSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('finalExamTimer');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function renderFinalExamQuestion() {
  if (!AppState.finalExamTimerInterval) startFinalExamTimer();

  const container = document.getElementById('finalExamQuestionArea');
  const counter = document.getElementById('finalExamCounter');
  const progressBar = document.getElementById('finalExamProgressBar');
  const scoreInd = document.getElementById('finalExamLiveScore');
  const resultCard = document.getElementById('finalExamResultCard');

  if (!container) return;

  if (AppState.finalExamCurrentIdx >= FinalExamQuestions.length) {
    // Exam Completed
    clearInterval(AppState.finalExamTimerInterval);
    container.style.display = 'none';
    if (resultCard) resultCard.style.display = 'block';

    const finalScore = document.getElementById('finalExamScore');
    const predicateName = document.getElementById('predicateName');
    const badgeIcon = document.getElementById('examBadgeIcon');
    if (finalScore) finalScore.textContent = AppState.finalExamScore;

    // Determine Predicate
    let pred = 'Perlu Bimbingan';
    let rubricId = 'rubricBelow70';

    if (AppState.finalExamScore >= 90) {
      pred = 'Sangat Baik';
      rubricId = 'rubric90';
      if (badgeIcon) badgeIcon.textContent = '🌟';
      Confetti.fire(4500);
      AudioEngine.playEffect('fanfare');
      showToast('Nilai ≥ 90! Selamat meraih Predikat SANGAT BAIK! 🎉');
    } else if (AppState.finalExamScore >= 80) {
      pred = 'Baik';
      rubricId = 'rubric80';
      if (badgeIcon) badgeIcon.textContent = '👍';
      AudioEngine.playEffect('correct');
    } else if (AppState.finalExamScore >= 70) {
      pred = 'Cukup';
      rubricId = 'rubric70';
      if (badgeIcon) badgeIcon.textContent = '👌';
    } else {
      pred = 'Perlu Bimbingan';
      rubricId = 'rubricBelow70';
      if (badgeIcon) badgeIcon.textContent = '📖';
    }

    AppState.finalExamPredicate = pred;
    if (predicateName) predicateName.textContent = pred;

    // Highlight Rubric Row
    document.querySelectorAll('.rubric-row').forEach(r => r.classList.remove('highlight-achieved'));
    const row = document.getElementById(rubricId);
    if (row) row.classList.add('highlight-achieved');

    AppState.completedModules.add(6);
    checkBadges();
    updateUIProgress();
    return;
  }

  container.style.display = 'block';
  if (resultCard) resultCard.style.display = 'none';

  const q = FinalExamQuestions[AppState.finalExamCurrentIdx];
  const qNum = AppState.finalExamCurrentIdx + 1;
  const total = FinalExamQuestions.length;

  if (counter) counter.textContent = `Soal ${qNum} dari ${total}`;
  if (progressBar) progressBar.style.width = `${(qNum / total) * 100}%`;
  if (scoreInd) scoreInd.textContent = `Skor: ${AppState.finalExamScore}`;

  let optionsHtml = '';
  q.options.forEach((opt, idx) => {
    const letter = String.fromCharCode(65 + idx);
    optionsHtml += `
      <button class="quiz-opt-btn" onclick="handleFinalExamAnswer(${idx})">
        <span class="opt-letter">${letter}</span>
        <span class="opt-text">${opt}</span>
      </button>
    `;
  });

  container.innerHTML = `
    <span class="q-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">Asesmen Akhir #${qNum}</span>
    <h3 class="q-title">${q.question}</h3>
    <div class="quiz-options-list">${optionsHtml}</div>
  `;
}

function handleFinalExamAnswer(selectedIdx) {
  if (AppState.finalExamAnswered) return;
  AppState.finalExamAnswered = true;

  const q = FinalExamQuestions[AppState.finalExamCurrentIdx];
  const buttons = document.querySelectorAll('#finalExamQuestionArea .quiz-opt-btn');

  buttons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === q.answer) {
      btn.classList.add('correct');
    } else if (idx === selectedIdx) {
      btn.classList.add('wrong');
    }
  });

  if (selectedIdx === q.answer) {
    AppState.finalExamScore += 10;
    AudioEngine.playEffect('correct');
  }

  setTimeout(() => {
    AppState.finalExamAnswered = false;
    AppState.finalExamCurrentIdx++;
    renderFinalExamQuestion();
  }, 900);
}

function initFinalExam() {
  const btnRetry = document.getElementById('btnRetryFinalExam');
  if (btnRetry) {
    btnRetry.onclick = () => {
      AppState.finalExamCurrentIdx = 0;
      AppState.finalExamScore = 0;
      AppState.finalExamAnswered = false;
      AppState.finalExamTimerSeconds = 0;
      renderFinalExamQuestion();
    };
  }
}

// =====================================================================
// 12. MODULE 7: REFLEKSI
// =====================================================================

function initRefleksi() {
  // Name & Class inputs sync
  const nameInput = document.getElementById('studentNameInput');
  const classInput = document.getElementById('studentClassInput');

  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      AppState.studentName = e.target.value.trim() || 'Siswa Berprestasi';
      syncCertificateInputs();
    });
  }

  if (classInput) {
    classInput.addEventListener('input', (e) => {
      AppState.studentClass = e.target.value.trim() || 'IX-A · SMP Negeri';
      syncCertificateInputs();
    });
  }

  // Mood buttons
  const moodBtns = document.querySelectorAll('.mood-btn');
  moodBtns.forEach(btn => {
    btn.onclick = () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.reflectionMood = btn.getAttribute('data-mood');
    };
  });

  // Save Reflection
  const btnSave = document.getElementById('btnSaveReflection');
  if (btnSave) {
    btnSave.onclick = () => {
      AppState.reflections.q1 = document.getElementById('refl1')?.value.trim() || '';
      AppState.reflections.q2 = document.getElementById('refl2')?.value.trim() || '';
      AppState.reflections.q3 = document.getElementById('refl3')?.value.trim() || '';
      AppState.reflections.q4 = document.getElementById('refl4')?.value.trim() || '';

      AppState.completedModules.add(7);
      checkBadges();
      updateUIProgress();
      showToast('Lembar refleksi berhasil disimpan! 💾');
    };
  }
}

// =====================================================================
// 13. MODULE 8: SERTIFIKAT HASIL BELAJAR
// =====================================================================

function syncCertificateInputs() {
  const certNameEditor = document.getElementById('certNameEditor');
  const certClassEditor = document.getElementById('certClassEditor');
  const studentNameInput = document.getElementById('studentNameInput');
  const studentClassInput = document.getElementById('studentClassInput');

  if (certNameEditor && certNameEditor.value !== AppState.studentName) {
    certNameEditor.value = AppState.studentName;
  }
  if (certClassEditor && certClassEditor.value !== AppState.studentClass) {
    certClassEditor.value = AppState.studentClass;
  }
  if (studentNameInput && studentNameInput.value !== AppState.studentName) {
    studentNameInput.value = AppState.studentName;
  }
  if (studentClassInput && studentClassInput.value !== AppState.studentClass) {
    studentClassInput.value = AppState.studentClass;
  }

  // Render on Certificate
  const certStudentName = document.getElementById('certStudentName');
  const certStudentClass = document.getElementById('certStudentClass');
  if (certStudentName) certStudentName.textContent = AppState.studentName;
  if (certStudentClass) certStudentClass.textContent = AppState.studentClass;
}

function renderCertificate() {
  syncCertificateInputs();

  const finalScoreEl = document.getElementById('certFinalScore');
  const predicateEl = document.getElementById('certPredicate');
  const dateEl = document.getElementById('certDate');

  if (finalScoreEl) finalScoreEl.textContent = AppState.finalExamScore;
  if (predicateEl) predicateEl.textContent = AppState.finalExamPredicate.toUpperCase();

  // Current Date in Indonesian Format
  const today = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  if (dateEl) dateEl.textContent = formattedDate;

  // Mark module 8 completed
  AppState.completedModules.add(8);
  checkBadges();
  updateUIProgress();

  if (AppState.finalExamScore >= 90) {
    Confetti.fire(3000);
  }
}

function initCertificate() {
  const certNameEditor = document.getElementById('certNameEditor');
  const certClassEditor = document.getElementById('certClassEditor');

  if (certNameEditor) {
    certNameEditor.addEventListener('input', (e) => {
      AppState.studentName = e.target.value.trim() || 'Siswa Berprestasi';
      syncCertificateInputs();
    });
  }

  if (certClassEditor) {
    certClassEditor.addEventListener('input', (e) => {
      AppState.studentClass = e.target.value.trim() || 'IX-A · SMP Negeri';
      syncCertificateInputs();
    });
  }

  // Print Certificate Button
  const btnPrint = document.getElementById('btnPrintCert');
  if (btnPrint) {
    btnPrint.onclick = () => {
      window.print();
    };
  }

  // Download Certificate PDF Button
  const btnPdf = document.getElementById('btnDownloadCertPdf');
  if (btnPdf) {
    btnPdf.onclick = () => {
      showToast('Membuka pratinjau cetak PDF...');
      window.print();
    };
  }
}

// =====================================================================
// 14. FITUR TAMBAHAN: DOWNLOAD HASIL BELAJAR & RESET
// =====================================================================

function downloadLearningSummary() {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const content = `
============================================================
   RANGKUMAN HASIL BELAJAR PESERTA DIDIK
   MODUL INTERAKTIF TIK: PEMROGRAMAN VISUAL SCRATCH
============================================================

Tanggal Belajar    : ${today}
Nama Peserta Didik : ${AppState.studentName}
Kelas / Sekolah    : ${AppState.studentClass}
Progres Modul      : ${AppState.completedModules.size} dari 8 Modul Selesai (${Math.round((AppState.completedModules.size / 8) * 100)}%)

------------------------------------------------------------
1. CAPAIAN EVALUASI & PENILAIAN
------------------------------------------------------------
- Skor Asesmen Awal (Diagnostik) : ${AppState.pretestScore} / 100
- Skor Kuis Interaktif (HOTS)    : ${AppState.quizScore} / 100
- Nilai Asesmen Akhir (Sumatif)  : ${AppState.finalExamScore} / 100
- Predikat Capaian               : ${AppState.finalExamPredicate.toUpperCase()}

Kategori Predikat:
  90 - 100 : Sangat Baik
  80 - 89  : Baik
  70 - 79  : Cukup
  < 70     : Perlu Bimbingan

------------------------------------------------------------
2. LEMBAR REFLEKSI SISWA
------------------------------------------------------------
A. Hal yang sudah dipahami:
   "${AppState.reflections.q1 || document.getElementById('refl1')?.value || '-'}"

B. Hal yang paling menarik:
   "${AppState.reflections.q2 || document.getElementById('refl2')?.value || '-'}"

C. Hal yang masih membingungkan:
   "${AppState.reflections.q3 || document.getElementById('refl3')?.value || '-'}"

D. Rencana setelah belajar Scratch:
   "${AppState.reflections.q4 || document.getElementById('refl4')?.value || '-'}"

------------------------------------------------------------
Lencana (Badges) yang Terbuka: ${AppState.unlockedBadges.size} dari 5
Dokumen ini diterbitkan otomatis oleh Sistem Modul Pembelajaran TIK SMP 2026.
============================================================
`.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Hasil_Belajar_Scratch_${AppState.studentName.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Rangkuman hasil belajar berhasil diunduh! 📄');
}

function resetAndRestartCourse() {
  if (confirm('Apakah kamu yakin ingin mengulang pembelajaran dari awal?')) {
    AppState.completedModules.clear();
    AppState.pretestCurrentIdx = 0;
    AppState.pretestScore = 0;
    AppState.pretestAnswered = false;

    AppState.quizCurrentIdx = 0;
    AppState.quizScore = 0;
    AppState.quizAnswered = false;
    AppState.quizTimerSeconds = 0;

    AppState.finalExamCurrentIdx = 0;
    AppState.finalExamScore = 0;
    AppState.finalExamAnswered = false;
    AppState.finalExamTimerSeconds = 0;

    resetScratchSprite();
    updateUIProgress();
    navigateToModule(0);
    showToast('Pembelajaran di-reset. Selamat belajar kembali! 🚀');
  }
}

function confirmRestart() {
  resetAndRestartCourse();
}

// =====================================================================
// 15. INITIALIZATION ON DOM READY
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initApersepsi();
  initPretest();
  initMateri();
  initScratchLab();
  initQuiz();
  initFinalExam();
  initRefleksi();
  initCertificate();

  // Expose global methods for inline HTML onclick attributes
  window.navigateToModule = navigateToModule;
  window.navigateNext = navigateNext;
  window.navigatePrev = navigatePrev;
  window.markCompletedAndNext = markCompletedAndNext;
  window.handleSparkChoice = handleSparkChoice;
  window.handlePretestAnswer = handlePretestAnswer;
  window.nextPretestQuestion = nextPretestQuestion;
  window.handleQuizAnswer = handleQuizAnswer;
  window.nextQuizQuestion = nextQuizQuestion;
  window.handleFinalExamAnswer = handleFinalExamAnswer;
  window.removeBlockFromScript = removeBlockFromScript;
  window.resetAndRestartCourse = resetAndRestartCourse;
  window.confirmRestart = confirmRestart;
});
