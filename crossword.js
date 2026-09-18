'use strict';

/*
  TIK SMP KELAS 9 – Crossword Engine
  =====================================
  All word intersections verified:

  SECTION 1 (rows 0-5) – connected via ROUTER down at col 4:
    INTERNET  across r0, c0-c7  → [4]=R  = ROUTER[0]=R  ✓
    TOPOLOGI  across r1, c1-c8  → c4=TOPOLOGI[3]=O = ROUTER[1]=O ✓
    UPLOAD    across r2, c4-c9  → [0]=U  = ROUTER[2]=U  ✓
    BLUETOOTH across r3, c0-c8  → [4]=T  = ROUTER[3]=T  ✓
    EMAIL     across r4, c4-c8  → [0]=E  = ROUTER[4]=E  ✓
    ENKRIPSI  across r5, c1-c8  → c4=ENKRIPSI[3]=R = ROUTER[5]=R ✓
    ROUTER    down   r0-r5, c4

  SECTION 2 (rows 6-9) – connected via MODEM down at col 2:
    DOMAIN    across r7, c1-c6  → c2=DOMAIN[1]=O  = MODEM[1]=O  ✓
    DATABASE  across r8, c2-c9  → [0]=D  = MODEM[2]=D  ✓
    SERVER    across r9, c1-c6  → c2=SERVER[1]=E  = MODEM[3]=E  ✓
    MODEM     down   r6-r10, c2

  SECTION 3 (rows 11-16) – BLOG down connects NIRKABEL:
    JARINGAN  across r11, c0-c7  (standalone)
    NIRKABEL  across r13, c0-c7  → c5=NIRKABEL[5]=B = BLOG[0]=B ✓
    VIRUS     across r15, c0-c4  (standalone)
    BLOG      down   r13-r16, c5
*/

// ── Puzzle entries (raw, without numbers) ─────────
const RAW_ENTRIES = [
  // Section 1
  { dir:'across', row:0, col:0, answer:'INTERNET',  clue:'Jaringan komputer global yang menghubungkan jutaan perangkat di seluruh dunia' },
  { dir:'across', row:1, col:1, answer:'TOPOLOGI',  clue:'Pola susunan fisik/logis jaringan komputer: bintang, bus, cincin, atau mesh' },
  { dir:'across', row:2, col:4, answer:'UPLOAD',    clue:'Proses mengirimkan file dari perangkat lokal ke server atau internet' },
  { dir:'across', row:3, col:0, answer:'BLUETOOTH', clue:'Teknologi nirkabel jarak dekat menggunakan gelombang radio frekuensi 2.4 GHz' },
  { dir:'across', row:4, col:4, answer:'EMAIL',     clue:'Surat elektronik yang dikirim dan diterima melalui jaringan internet' },
  { dir:'across', row:5, col:1, answer:'ENKRIPSI',  clue:'Proses mengubah data asli menjadi kode rahasia untuk melindungi keamanan informasi' },
  { dir:'down',   row:0, col:4, answer:'ROUTER',    clue:'Perangkat jaringan yang mengarahkan paket data antar dua jaringan atau lebih' },
  // Section 2
  { dir:'down',   row:6, col:2, answer:'MODEM',     clue:'Perangkat yang memodulasi sinyal digital ke analog dan demodulasi sebaliknya' },
  { dir:'across', row:7, col:1, answer:'DOMAIN',    clue:'Nama unik untuk mengidentifikasi alamat situs web (contoh: google.com, kemdikbud.go.id)' },
  { dir:'across', row:8, col:2, answer:'DATABASE',  clue:'Kumpulan data terorganisir yang disimpan secara elektronik agar mudah diakses' },
  { dir:'across', row:9, col:1, answer:'SERVER',    clue:'Komputer yang memberikan layanan atau data kepada komputer klien dalam jaringan' },
  // Section 3
  { dir:'across', row:11, col:0, answer:'JARINGAN', clue:'Kumpulan komputer dan perangkat yang saling terhubung untuk berbagi data dan sumber daya' },
  { dir:'across', row:13, col:0, answer:'NIRKABEL', clue:'Teknologi transmisi data tanpa kabel fisik, contoh: WiFi, Bluetooth, Inframerah' },
  { dir:'down',   row:13, col:5, answer:'BLOG',     clue:'Situs web berisi tulisan/artikel yang diperbarui secara berkala; kependekan dari web log' },
  { dir:'across', row:15, col:0, answer:'VIRUS',    clue:'Program komputer berbahaya yang dapat menggandakan diri dan merusak sistem atau data' },
];

const GRID_ROWS = 17;
const GRID_COLS = 14;

// ── Game state ─────────────────────────────────────
let entries      = [];
let gridData     = [];
let selCell      = null;
let selDir       = 'across';
let selEntry     = null;
let solved       = new Set();
let score        = 0;
let timerRef     = null;
let startTime    = 0;

// ── Boot ───────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initGame();
  document.getElementById('btnCheck').addEventListener('click', checkAnswers);
  document.getElementById('btnClear').addEventListener('click', clearAll);
  document.getElementById('btnReveal').addEventListener('click', revealAll);
  document.getElementById('btnReset').addEventListener('click', resetGame);
  document.getElementById('btnPlayAgain').addEventListener('click', resetGame);
  spawnParticles();
});

// ── Init ───────────────────────────────────────────
function initGame() {
  solved  = new Set();
  score   = 0;
  entries = numberEntries(RAW_ENTRIES, GRID_ROWS, GRID_COLS);

  // Build gridData
  gridData = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({
      letter:    null,
      active:    false,
      cellNum:   null,
      userInput: '',
      el:        null,
    }))
  );

  // Fill letters
  for (const e of entries) {
    for (let i = 0; i < e.answer.length; i++) {
      const r = e.dir === 'down'   ? e.row + i : e.row;
      const c = e.dir === 'across' ? e.col + i : e.col;
      gridData[r][c].letter = e.answer[i];
      gridData[r][c].active = true;
    }
  }

  // Fill cell numbers
  for (const e of entries) {
    const gd = gridData[e.row][e.col];
    if (gd.cellNum === null || gd.cellNum > e.num) gd.cellNum = e.num;
  }

  buildGrid();
  buildClues();
  startTimer();

  document.getElementById('scoreVal').textContent     = '0';
  document.getElementById('timerVal').textContent     = '00:00';
  document.getElementById('completedVal').textContent = `0/${entries.length}`;
}

// ── Number entries ─────────────────────────────────
function numberEntries(raw, rows, cols) {
  // Build occupancy grid
  const occ = Array.from({ length: rows }, () => Array(cols).fill(false));
  for (const e of raw) {
    for (let i = 0; i < e.answer.length; i++) {
      const r = e.dir === 'down'   ? e.row + i : e.row;
      const c = e.dir === 'across' ? e.col + i : e.col;
      occ[r][c] = true;
    }
  }

  // Assign numbers by scan order
  let n = 1;
  const numMap = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!occ[r][c]) continue;
      const sa = occ[r][c] && (c === 0 || !occ[r][c-1]) && c+1 < cols && occ[r][c+1];
      const sd = occ[r][c] && (r === 0 || !occ[r-1][c]) && r+1 < rows && occ[r+1][c];
      if (sa || sd) numMap[`${r},${c}`] = n++;
    }
  }

  return raw.map(e => ({ ...e, num: numMap[`${e.row},${e.col}`] || 0 }))
            .sort((a, b) => a.num - b.num || (a.dir === 'across' ? -1 : 1));
}

// ── Build DOM grid ─────────────────────────────────
function buildGrid() {
  const container = document.getElementById('crosswordGrid');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${GRID_COLS}, var(--cell-size))`;
  container.style.gridTemplateRows    = `repeat(${GRID_ROWS}, var(--cell-size))`;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const div = document.createElement('div');
      div.className = 'cell';
      div.dataset.r = r;
      div.dataset.c = c;

      const gd = gridData[r][c];
      gd.el = div;

      if (gd.active) {
        div.classList.add('word-cell');
        if (gd.cellNum !== null) {
          const span = document.createElement('span');
          span.className = 'cell-num';
          span.textContent = gd.cellNum;
          div.appendChild(span);
        }
        const inp = document.createElement('input');
        inp.maxLength = 1;
        inp.autocomplete = 'off';
        inp.spellcheck   = false;
        inp.autocapitalize = 'characters';
        inp.dataset.r = r;
        inp.dataset.c = c;
        inp.addEventListener('click',   onCellClick);
        inp.addEventListener('keydown', onKeyDown);
        inp.addEventListener('input',   onInput);
        div.appendChild(inp);
      } else {
        div.classList.add('blocked');
      }

      container.appendChild(div);
    }
  }
}

// ── Build clues panel ──────────────────────────────
function buildClues() {
  renderClueList('across');

  document.getElementById('tabAcross').addEventListener('click', () => {
    setTab('across');
    renderClueList('across');
  });
  document.getElementById('tabDown').addEventListener('click', () => {
    setTab('down');
    renderClueList('down');
  });
}

function setTab(dir) {
  document.querySelectorAll('.clue-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(dir === 'across' ? 'tabAcross' : 'tabDown').classList.add('active');
}

function renderClueList(dir) {
  const list = document.getElementById('cluesList');
  list.innerHTML = '';
  entries.filter(e => e.dir === dir).forEach(e => {
    const item = document.createElement('div');
    item.className = 'clue-item';
    item.id = `clue-${e.num}-${e.dir}`;
    if (solved.has(key(e)))    item.classList.add('solved');
    if (selEntry && key(selEntry) === key(e)) item.classList.add('active');

    const numEl = document.createElement('span');
    numEl.className = 'clue-num';
    numEl.textContent = e.num;

    const txt = document.createElement('span');
    txt.className = 'clue-text';
    txt.textContent = e.clue;

    item.append(numEl, txt);
    item.addEventListener('click', () => selectEntry(e));
    list.appendChild(item);
  });
}

const key = e => `${e.num}-${e.dir}`;

// ── Select entry ───────────────────────────────────
function selectEntry(e) {
  selEntry = e;
  selDir   = e.dir;
  selCell  = { r: e.row, c: e.col };
  highlightWord(e);
  updateClueBar(e);
  updateClueHighlight(e);
  // Focus first empty cell
  for (let i = 0; i < e.answer.length; i++) {
    const r = e.dir === 'down'   ? e.row + i : e.row;
    const c = e.dir === 'across' ? e.col + i : e.col;
    const inp = getInput(r, c);
    if (inp && !inp.value) {
      inp.focus();
      selCell = { r, c };
      return;
    }
  }
  getInput(e.row, e.col)?.focus();
}

// ── Event handlers ─────────────────────────────────
function onCellClick(ev) {
  const r = +ev.target.dataset.r;
  const c = +ev.target.dataset.c;

  if (selCell && selCell.r === r && selCell.c === c) {
    const other = selDir === 'across' ? 'down' : 'across';
    const e = findEntry(r, c, other);
    if (e) { selDir = other; selEntry = e; }
  } else {
    selCell = { r, c };
    const e = findEntry(r, c, selDir) || findEntry(r, c, selDir === 'across' ? 'down' : 'across');
    if (e) { selDir = e.dir; selEntry = e; }
  }

  if (selEntry) {
    highlightWord(selEntry);
    updateClueBar(selEntry);
    updateClueHighlight(selEntry);
  }
}

function onKeyDown(ev) {
  const r = +ev.target.dataset.r;
  const c = +ev.target.dataset.c;

  if (ev.key === 'Backspace') {
    ev.preventDefault();
    if (ev.target.value) {
      ev.target.value = '';
      gridData[r][c].userInput = '';
      clearCellState(r, c);
    } else {
      moveDelta(r, c, -1);
    }
  } else if (ev.key === 'ArrowRight')  { ev.preventDefault(); moveTo(r, c, 0, 1);  selDir = 'across'; }
  else if (ev.key === 'ArrowLeft')    { ev.preventDefault(); moveTo(r, c, 0, -1); selDir = 'across'; }
  else if (ev.key === 'ArrowDown')    { ev.preventDefault(); moveTo(r, c, 1, 0);  selDir = 'down'; }
  else if (ev.key === 'ArrowUp')      { ev.preventDefault(); moveTo(r, c, -1, 0); selDir = 'down'; }
  else if (ev.key === 'Tab') {
    ev.preventDefault();
    const idx  = entries.indexOf(selEntry);
    const next = entries[(idx + (ev.shiftKey ? -1 : 1) + entries.length) % entries.length];
    selectEntry(next);
  } else if (ev.key === 'Enter') {
    ev.preventDefault();
    checkAnswers();
  }
}

function onInput(ev) {
  const r   = +ev.target.dataset.r;
  const c   = +ev.target.dataset.c;
  const val = (ev.target.value || '').toUpperCase().replace(/[^A-Z]/g, '');
  ev.target.value = val ? val[val.length - 1] : '';
  gridData[r][c].userInput = ev.target.value;
  clearCellState(r, c);
  if (ev.target.value) moveDelta(r, c, 1);
}

// ── Movement ───────────────────────────────────────
function moveDelta(r, c, delta) {
  const nr = selDir === 'down'   ? r + delta : r;
  const nc = selDir === 'across' ? c + delta : c;
  if (inBounds(nr, nc) && gridData[nr][nc].active) {
    getInput(nr, nc)?.focus();
    selCell = { r: nr, c: nc };
  }
}

function moveTo(r, c, dr, dc) {
  const nr = r + dr, nc = c + dc;
  if (inBounds(nr, nc) && gridData[nr][nc].active) {
    getInput(nr, nc)?.focus();
    selCell = { r: nr, c: nc };
    const e = findEntry(nr, nc, selDir);
    if (e) { selEntry = e; highlightWord(e); updateClueBar(e); updateClueHighlight(e); }
  }
}

function inBounds(r, c) {
  return r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS;
}

// ── Highlight ──────────────────────────────────────
function highlightWord(e) {
  for (let row = 0; row < GRID_ROWS; row++)
    for (let col = 0; col < GRID_COLS; col++)
      gridData[row][col].el?.classList.remove('highlighted', 'selected');

  for (let i = 0; i < e.answer.length; i++) {
    const r = e.dir === 'down'   ? e.row + i : e.row;
    const c = e.dir === 'across' ? e.col + i : e.col;
    gridData[r][c].el?.classList.add('highlighted');
  }
  if (selCell) gridData[selCell.r]?.[selCell.c]?.el?.classList.add('selected');
}

// ── Clue bar / highlight ───────────────────────────
function updateClueBar(e) {
  document.getElementById('activeClueNum').textContent  = e.num;
  document.getElementById('activeClueDir').textContent  = e.dir === 'across' ? '➡️' : '⬇️';
  document.getElementById('activeClueText').textContent = e.clue;
}

function updateClueHighlight(e) {
  document.querySelectorAll('.clue-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(`clue-${e.num}-${e.dir}`);
  if (el) { el.classList.add('active'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

// ── Find entry ─────────────────────────────────────
function findEntry(r, c, dir) {
  return entries.find(e => {
    if (e.dir !== dir) return false;
    for (let i = 0; i < e.answer.length; i++) {
      const er = e.dir === 'down'   ? e.row + i : e.row;
      const ec = e.dir === 'across' ? e.col + i : e.col;
      if (er === r && ec === c) return true;
    }
    return false;
  }) || null;
}

function getInput(r, c) {
  return gridData[r]?.[c]?.el?.querySelector('input') || null;
}

function clearCellState(r, c) {
  gridData[r][c].el?.classList.remove('correct', 'incorrect', 'revealed');
}

// ── Check answers ──────────────────────────────────
function checkAnswers() {
  let newlySolved = 0;
  let allDone     = true;

  for (const e of entries) {
    let entryOk = true;
    for (let i = 0; i < e.answer.length; i++) {
      const r  = e.dir === 'down'   ? e.row + i : e.row;
      const c  = e.dir === 'across' ? e.col + i : e.col;
      const gd = gridData[r][c];
      const ok = gd.userInput === e.answer[i];
      if (gd.userInput) {
        gd.el.classList.remove('correct', 'incorrect', 'revealed');
        gd.el.classList.add(ok ? 'correct' : 'incorrect');
      }
      if (!ok) { entryOk = false; allDone = false; }
    }
    if (entryOk && !solved.has(key(e))) {
      solved.add(key(e));
      newlySolved++;
      document.getElementById(`clue-${e.num}-${e.dir}`)?.classList.add('solved');
    }
  }

  score += newlySolved * 10;
  document.getElementById('scoreVal').textContent     = score;
  document.getElementById('completedVal').textContent = `${solved.size}/${entries.length}`;

  const allFilled = [...Array(GRID_ROWS)].every((_, r) =>
    [...Array(GRID_COLS)].every((__, c) =>
      !gridData[r][c].active || !!gridData[r][c].userInput
    )
  );

  if (allDone && allFilled) {
    setTimeout(showVictory, 600);
  } else if (newlySolved > 0) {
    showToast(`✅ ${newlySolved} kata benar! +${newlySolved * 10} poin`);
  } else {
    showToast('❌ Ada yang salah, coba lagi!');
  }
}

// ── Reveal / Clear / Reset ─────────────────────────
function revealAll() {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const gd = gridData[r][c];
      if (!gd.active) continue;
      const inp = getInput(r, c);
      if (inp) inp.value = gd.letter;
      gd.userInput = gd.letter;
      gd.el.classList.remove('correct', 'incorrect');
      gd.el.classList.add('revealed');
    }
  }
  entries.forEach(e => {
    solved.add(key(e));
    document.getElementById(`clue-${e.num}-${e.dir}`)?.classList.add('solved');
  });
  document.getElementById('completedVal').textContent = `${entries.length}/${entries.length}`;
  score = Math.max(0, Math.floor(score / 2));
  document.getElementById('scoreVal').textContent = score;
  showToast('💡 Jawaban telah ditampilkan!');
}

function clearAll() {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const gd = gridData[r][c];
      if (!gd.active) continue;
      const inp = getInput(r, c);
      if (inp) inp.value = '';
      gd.userInput = '';
      gd.el.classList.remove('correct', 'incorrect', 'revealed');
    }
  }
  solved.clear();
  document.querySelectorAll('.clue-item').forEach(el => el.classList.remove('solved'));
  document.getElementById('completedVal').textContent = `0/${entries.length}`;
  showToast('🗑️ Semua jawaban dihapus');
}

function resetGame() {
  clearInterval(timerRef);
  document.getElementById('modalOverlay').classList.remove('show');
  initGame();
}

// ── Timer ──────────────────────────────────────────
function startTimer() {
  clearInterval(timerRef);
  startTime = Date.now();
  timerRef  = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timerVal').textContent = `${m}:${s}`;
  }, 1000);
}

// ── Victory modal ──────────────────────────────────
function showVictory() {
  clearInterval(timerRef);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalTime').textContent  = `${m}:${s}`;
  document.getElementById('finalStars').textContent = elapsed < 120 ? '⭐⭐⭐' : elapsed < 300 ? '⭐⭐' : '⭐';
  document.getElementById('modalOverlay').classList.add('show');
}

// ── Toast ──────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Particles ──────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('bgParticles');
  container.innerHTML = '';
  const colors = ['#6c63ff', '#a78bfa', '#38bdf8', '#fbbf24', '#10b981'];
  for (let i = 0; i < 35; i++) {
    const p   = document.createElement('div');
    p.className = 'particle';
    const sz  = Math.random() * 6 + 2;
    p.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${Math.random() * 100}%;
      bottom:-10px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 14 + 8}s;
      animation-delay:${Math.random() * 12}s;
      filter:blur(${Math.random()}px);
    `;
    container.appendChild(p);
  }
}
