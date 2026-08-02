/* ============================================================
   EDIT ME — add as many photos as you want.
   src: a URL or a base64 data string (data:image/jpeg;base64,....)
   caption: short line shown under the finished puzzle & polaroid
   ============================================================
   HOW TO ADD YOUR OWN PHOTOS:
   1) Easiest: upload the photos to Claude in this chat and ask
      "swap these into the puzzle game" — they'll be inlined for you.
   2) Manual: replace each `src` below with a hosted image URL,
      or a base64 data URI (drag a photo into an online base64
      converter, paste the resulting string in as the src).
   Just keep adding { src: "...", caption: "..." } objects —
   the game and the final collage both scale automatically.
============================================================ */
const PHOTOS = [
  {
    src: "photo1.jpg",
    caption: "❤️❤️❤️❤️❤️❤️"
  },
  {
    src: "photo2.jpg",
    caption: "First Date"
  },
  {
    src: "photo3.jpg",
    caption: "1st Fav❤️pic"
  },
  {
    src: "photo4.jpg",
    caption: "2st Fav❤️pic"
  },
  {
    src: "photo5.jpg",
    caption: "3st Fav❤️pic"
  }
];

const GRID = 3; // 3x3 pieces per puzzle — change to 4 for a harder game
const PROPOSAL_QUESTION = "Thank you the kind of love (And If u like this click on yes )"; // edit your own line here

/* ============================================================
   EDIT ME — your song.
   MUSIC_SRC: a hosted URL (e.g. "https://.../song.mp3") or a
   base64 data URI (data:audio/mpeg;base64,....).
   Leave it empty ("") to run with no music — the toggle button
   just won't do anything until a src is set.
   Tip: keep the file reasonably small (a few MB) if embedding
   as base64, since it gets baked directly into this HTML file.
============================================================ */
const MUSIC_SRC = "music.mp3";
const MUSIC_START_VOLUME = 0.5;

let current = 0;
let state = [];   // current[i] = identity shown at cell i
let selected = null;

function initAmbient(){
  const wrap = document.getElementById('ambient');
  const hearts = ['♥','✦','♥'];
  for(let i=0;i<18;i++){
    const el = document.createElement('span');
    el.className = 'drift';
    el.textContent = hearts[i % hearts.length];
    el.style.left = Math.random()*100 + 'vw';
    el.style.animationDuration = (14 + Math.random()*14) + 's';
    el.style.animationDelay = (Math.random()*14) + 's';
    el.style.fontSize = (14 + Math.random()*14) + 'px';
    wrap.appendChild(el);
  }
}
initAmbient();

function show(id){
  ['screen-intro','screen-puzzle','screen-finale','screen-celebrate'].forEach(s=>{
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
}

function startGame(){
  document.getElementById('puzzle-total').textContent = PHOTOS.length;
  current = 0;
  show('screen-puzzle');
  buildPuzzle(current);
  playMusic();
}

/* ---------- background music ---------- */
let musicStarted = false;

function playMusic(){
  if(!MUSIC_SRC || musicStarted) return;
  const audio = document.getElementById('bg-music');
  audio.src = MUSIC_SRC;
  audio.volume = MUSIC_START_VOLUME;
  audio.play().catch(()=>{
    // Browser blocked autoplay — the toggle button still lets her start it manually.
  });
  musicStarted = true;
  document.getElementById('music-toggle').classList.remove('muted');
}

function toggleMusic(){
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');

  if(!MUSIC_SRC){
    return; // no song set yet
  }
  if(!musicStarted){
    playMusic();
    return;
  }
  if(audio.paused){
    audio.play();
    btn.classList.remove('muted');
  } else {
    audio.pause();
    btn.classList.add('muted');
  }
}

function shuffledArray(n){
  let arr = [...Array(n).keys()];
  let solvedCheck;
  do{
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    solvedCheck = arr.every((v,i)=>v===i);
  } while(solvedCheck);
  return arr;
}

function buildPuzzle(index){
  const photo = PHOTOS[index];
  document.getElementById('puzzle-num').textContent = index+1;
  document.getElementById('puzzle-caption').textContent = '';
  document.getElementById('continue-btn').classList.add('hidden');

  const grid = document.getElementById('puzzle-grid');
  grid.classList.remove('solved');
  grid.style.gridTemplateColumns = `repeat(${GRID},1fr)`;
  grid.style.gridTemplateRows = `repeat(${GRID},1fr)`;
  grid.innerHTML = '';

  const overlay = document.getElementById('reveal-overlay');
  overlay.classList.remove('show');
  overlay.style.backgroundImage = `url("${photo.src}")`;

  const total = GRID*GRID;
  state = shuffledArray(total);
  selected = null;

  for(let cell=0; cell<total; cell++){
    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.dataset.cell = cell;
    piece.style.backgroundImage = `url("${photo.src}")`;
    piece.style.backgroundSize = `${GRID*100}% ${GRID*100}%`;
    piece.addEventListener('click', ()=>onPieceClick(cell));
    grid.appendChild(piece);
  }
  renderPieces();
}

function posForIdentity(identity){
  const row = Math.floor(identity/GRID);
  const col = identity % GRID;
  const x = (col/(GRID-1))*100;
  const y = (row/(GRID-1))*100;
  return `${x}% ${y}%`;
}

function renderPieces(){
  const grid = document.getElementById('puzzle-grid');
  [...grid.children].forEach((el,cell)=>{
    el.style.backgroundPosition = posForIdentity(state[cell]);
  });
}

function onPieceClick(cell){
  const grid = document.getElementById('puzzle-grid');
  const els = [...grid.children];

  if(selected === null){
    selected = cell;
    els[cell].classList.add('selected');
    return;
  }
  if(selected === cell){
    els[cell].classList.remove('selected');
    selected = null;
    return;
  }
  // swap
  [state[selected], state[cell]] = [state[cell], state[selected]];
  els[selected].classList.remove('selected');
  selected = null;
  renderPieces();

  if(state.every((v,i)=>v===i)){
    solvePuzzle();
  }
}

function solvePuzzle(){
  const grid = document.getElementById('puzzle-grid');
  grid.classList.add('solved');
  document.getElementById('reveal-overlay').classList.add('show');
  document.getElementById('puzzle-caption').textContent = PHOTOS[current].caption;
  document.getElementById('continue-btn').classList.remove('hidden');
  burstHearts();
}

function burstHearts(){
  const grid = document.getElementById('puzzle-grid');
  const rect = grid.getBoundingClientRect();
  for(let i=0;i<10;i++){
    const h = document.createElement('div');
    h.className = 'burst';
    h.textContent = '♥';
    h.style.left = (rect.left + Math.random()*rect.width) + 'px';
    h.style.top = (rect.top + rect.height*0.6) + 'px';
    document.body.appendChild(h);
    setTimeout(()=>h.remove(), 1150);
  }
}

function nextPuzzle(){
  current++;
  if(current >= PHOTOS.length){
    buildFinale();
    show('screen-finale');
  } else {
    buildPuzzle(current);
  }
}

function buildFinale(){
  document.getElementById('finale-question').textContent = PROPOSAL_QUESTION;
  const collage = document.getElementById('collage');
  collage.innerHTML = '';
  PHOTOS.forEach((p,i)=>{
    const rot = (i % 2 === 0 ? -1 : 1) * (4 + (i*7) % 9);
    const fig = document.createElement('figure');
    fig.className = 'polaroid';
    fig.style.setProperty('--r', rot+'deg');
    fig.innerHTML = `
      <div class="tape"></div>
      <img src="${p.src}" alt="">
      <figcaption>${p.caption}</figcaption>
    `;
    collage.appendChild(fig);
  });
  setupDodgingNoButton();
}

function setupDodgingNoButton(){
  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');
  const container = noBtn.parentElement;

  function dodge(){
    const cw = container.clientWidth, ch = container.clientHeight;
    const bw = noBtn.offsetWidth, bh = noBtn.offsetHeight;
    const maxX = Math.max(cw - bw - 10, 10);
    const maxY = Math.max(ch - bh - 10, 10);
    const x = Math.random()*maxX;
    const y = Math.random()*maxY;
    noBtn.style.position = 'absolute';
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
  }
  noBtn.addEventListener('mouseenter', dodge);
  noBtn.addEventListener('click', (e)=>{ e.preventDefault(); dodge(); });
  noBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); dodge(); });
}

function sayYes(){
  show('screen-celebrate');
  const audio = document.getElementById('bg-music');
  if(MUSIC_SRC && audio.paused){ audio.play(); document.getElementById('music-toggle').classList.remove('muted'); }
  const el = document.getElementById('ambient');
  for(let i=0;i<40;i++){
    const h = document.createElement('div');
    h.className = 'drift';
    h.textContent = '♥';
    h.style.left = Math.random()*100 + 'vw';
    h.style.bottom = '-5%';
    h.style.animationDuration = (2.5 + Math.random()*3) + 's';
    h.style.animationDelay = (Math.random()*1.5) + 's';
    h.style.fontSize = (16 + Math.random()*22) + 'px';
    h.style.color = Math.random()>0.5 ? 'var(--gold)' : 'var(--blush)';
    el.appendChild(h);
    setTimeout(()=>h.remove(), 7000);
  }
}