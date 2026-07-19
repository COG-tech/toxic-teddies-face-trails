import { TEDDIES, LEVELS_PER_TEDDY, TOTAL_LEVELS, DIFFICULTIES } from './characters.js';

const STORAGE_KEY = 'toxic-teddies-face-trails:v4';
const els = Object.fromEntries([
  'backButton','soundButton','collectionCounter','homeView','gameView','teddyGrid','levelKicker','characterName','alternateName','lives','trailProgress','percentProgress','instructionCard','instructionIcon','instructionTitle','instructionText','puzzleFrame','mapHost','mistakeFlash','resetButton','hintButton','startButton','levelStripTitle','difficultyBadge','levelButtons','routeTitle','trailList','rewardTitle','rewardText','miniPortrait','completionModal','completionTitle','completionTagline','revealHost','completionCopy','closeModal','replayButton','nextButton','gameOverModal','tryAgainButton'
].map(id => [id, document.getElementById(id)]));

const state = {
  teddyIndex: 0,
  level: 1,
  routes: [],
  activeIndex: 0,
  activeProgress: 0,
  lives: 3,
  started: false,
  tracing: false,
  completed: false,
  pointerId: null,
  lastSampleIndex: 0,
  sound: true,
  save: loadSave()
};

function loadSave(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { completed:{} }; }
  catch { return { completed:{} }; }
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save)); updateCollectionCounter(); }
function levelKey(teddyId, level){ return `${teddyId}-l${level}`; }
function completed(teddyId, level){ return Boolean(state.save.completed[levelKey(teddyId,level)]); }
function unlocked(teddyId, level){ return level === 1 || completed(teddyId, level - 1); }

function boot(){
  bindEvents();
  renderHome();
  updateCollectionCounter();
  const params = new URLSearchParams(location.search);
  const teddyId = params.get('teddy');
  const level = Number(params.get('level'));
  const index = TEDDIES.findIndex(t => t.id === teddyId);
  if(index >= 0) openGame(index, Number.isInteger(level) && level >= 1 && level <= 5 ? level : 1);
}

function bindEvents(){
  els.backButton.addEventListener('click', showHome);
  els.soundButton.addEventListener('click', () => {
    state.sound = !state.sound;
    els.soundButton.textContent = state.sound ? '🔊' : '🔇';
  });
  els.startButton.addEventListener('click', startTracing);
  els.resetButton.addEventListener('click', () => resetGame(true));
  els.hintButton.addEventListener('click', showHint);
  els.mapHost.addEventListener('pointerdown', pointerDown);
  els.mapHost.addEventListener('pointermove', pointerMove);
  els.mapHost.addEventListener('pointerup', pointerUp);
  els.mapHost.addEventListener('pointercancel', pointerCancel);
  els.closeModal.addEventListener('click', () => els.completionModal.classList.add('hidden'));
  els.replayButton.addEventListener('click', () => { els.completionModal.classList.add('hidden'); resetGame(true); startTracing(); });
  els.nextButton.addEventListener('click', goNext);
  els.tryAgainButton.addEventListener('click', () => { els.gameOverModal.classList.add('hidden'); resetGame(true); startTracing(); });
}

function renderHome(){
  els.teddyGrid.innerHTML = '';
  TEDDIES.forEach((teddy,index) => {
    const done = Array.from({length:5},(_,i)=>completed(teddy.id,i+1)).filter(Boolean).length;
    const button = document.createElement('button');
    button.className = 'teddy-card';
    button.type = 'button';
    button.innerHTML = `<div class="teddy-card-art">${renderTeddySvg(teddy,{mode:'portrait',level:Math.max(1,done)})}</div><div class="teddy-card-copy"><h3>${teddy.primary}</h3><p>${teddy.alternate}</p><div class="card-progress"><span>Mutation progress</span><strong>${done}/5</strong></div><div class="progress-line"><span style="width:${done*20}%"></span></div></div>`;
    button.addEventListener('click', () => {
      let target = 1;
      for(let l=1;l<=5;l+=1) if(unlocked(teddy.id,l)) target=l;
      openGame(index,target);
    });
    els.teddyGrid.append(button);
  });
}

function showHome(){
  stopPointer();
  state.started = false;
  els.homeView.classList.remove('hidden');
  els.gameView.classList.add('hidden');
  els.backButton.classList.add('hidden');
  history.replaceState({},'',location.pathname);
  renderHome();
}

function openGame(teddyIndex, level){
  state.teddyIndex = teddyIndex;
  state.level = level;
  state.lives = 3;
  state.completed = false;
  state.started = false;
  els.homeView.classList.add('hidden');
  els.gameView.classList.remove('hidden');
  els.backButton.classList.remove('hidden');
  const url = new URL(location.href);
  url.searchParams.set('teddy', currentTeddy().id);
  url.searchParams.set('level', String(level));
  history.replaceState({},'',url);
  buildLevel();
}

function currentTeddy(){ return TEDDIES[state.teddyIndex]; }
function difficulty(){ return DIFFICULTIES[state.level - 1]; }

function buildLevel(){
  const teddy = currentTeddy();
  const diff = difficulty();
  els.levelKicker.textContent = `LEVEL ${state.level} OF 5 · ${diff.name}`;
  els.characterName.textContent = teddy.primary;
  els.alternateName.textContent = `also known as ${teddy.alternate}`;
  els.levelStripTitle.textContent = `${teddy.short}'s five mutations`;
  els.difficultyBadge.textContent = diff.name;
  els.routeTitle.textContent = `${teddy.short}'s body trails`;
  els.rewardTitle.textContent = state.level === 5 ? `Master ${teddy.primary}` : `Unlock level ${state.level + 1}`;
  els.rewardText.textContent = state.level === 5 ? `Complete the hardest full-body map to finish ${teddy.short}'s set.` : 'Finish this full-body Teddy map to open the next mutation.';
  els.miniPortrait.innerHTML = renderTeddySvg(teddy,{mode:'portrait',level:state.level});
  els.mapHost.innerHTML = renderTeddySvg(teddy,{mode:'game',level:state.level});
  prepareRoutes();
  renderLevelButtons();
  resetGame(true);
}

function renderLevelButtons(){
  const teddy = currentTeddy();
  els.levelButtons.innerHTML = '';
  for(let level=1;level<=5;level+=1){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.textContent = level;
    if(level === state.level) button.classList.add('active');
    if(completed(teddy.id,level)) button.classList.add('complete');
    if(!unlocked(teddy.id,level)) { button.classList.add('locked'); button.disabled = true; }
    button.addEventListener('click',()=>openGame(state.teddyIndex,level));
    els.levelButtons.append(button);
  }
}

function prepareRoutes(){
  const svg = els.mapHost.querySelector('svg');
  const diff = difficulty();
  state.svg = svg;
  state.routes = [...svg.querySelectorAll('[data-route]')].slice(0,diff.routes).map((path,index) => {
    const length = path.getTotalLength();
    const samples = Array.from({length:diff.sampleCount+1},(_,i)=>{
      const point = path.getPointAtLength((i/diff.sampleCount)*length);
      return {x:point.x,y:point.y};
    });
    const progress = path.cloneNode(true);
    progress.removeAttribute('data-route');
    progress.classList.add('route-progress');
    progress.style.stroke = currentTeddy().accent;
    progress.style.strokeWidth = `${Math.max(16,24-state.level)}`;
    progress.style.filter = `drop-shadow(0 0 8px ${currentTeddy().accent})`;
    progress.style.pointerEvents = 'none';
    progress.style.strokeDasharray = `${length}`;
    progress.style.strokeDashoffset = `${length}`;
    path.parentNode.insertBefore(progress,path.nextSibling);
    return { path, progress, length, samples, label:path.dataset.label || `Mutation ${index+1}`, complete:false };
  });
}

function startTracing(){
  if(state.completed || !state.svg) return;
  state.started = true;
  els.startButton.disabled = true;
  els.startButton.textContent = 'Tracing active';
  announceRoute();
  pulseMarker();
}

function pointerDown(event){
  if(!state.started || state.completed || state.tracing) return;
  const route = state.routes[state.activeIndex];
  if(!route) return;
  const point = clientToSvg(event.clientX,event.clientY);
  if(distance(point,route.samples[0]) > difficulty().startRadius){
    fail('Wrong starting point','Begin at the glowing marker.');
    return;
  }
  state.tracing = true;
  state.pointerId = event.pointerId;
  state.lastSampleIndex = 0;
  state.activeProgress = 0;
  els.mapHost.setPointerCapture?.(event.pointerId);
  updateInstruction('Keep tracing',`Stay inside ${route.label.toLowerCase()} and follow the arrow.`,false);
  event.preventDefault();
}

function pointerMove(event){
  if(!state.tracing || event.pointerId !== state.pointerId) return;
  const route = state.routes[state.activeIndex];
  const point = clientToSvg(event.clientX,event.clientY);
  const nearest = nearestSample(route,point);
  if(nearest.distance > difficulty().tolerance){ fail('You left the Teddy','Stay on the mutation trail.',true); return; }
  if(nearest.index < state.lastSampleIndex - difficulty().backtrack){ fail('Wrong direction','Follow the arrow through the Teddy.',true); return; }
  state.lastSampleIndex = Math.max(state.lastSampleIndex,nearest.index);
  state.activeProgress = state.lastSampleIndex/(route.samples.length-1);
  paint(route,state.activeProgress);
  updateProgress();
  event.preventDefault();
}

function pointerUp(event){
  if(!state.tracing || event.pointerId !== state.pointerId) return;
  stopPointer();
  if(state.activeProgress >= .96) completeRoute();
  else fail('Trail interrupted','Finish the full trail before lifting your finger.');
}
function pointerCancel(event){ if(state.tracing && event.pointerId === state.pointerId){ stopPointer(); fail('Trail interrupted','Keep your finger on the Teddy.'); } }
function stopPointer(){
  if(state.pointerId !== null && els.mapHost.hasPointerCapture?.(state.pointerId)) els.mapHost.releasePointerCapture(state.pointerId);
  state.pointerId = null; state.tracing = false;
}

function completeRoute(){
  const route = state.routes[state.activeIndex];
  route.complete = true;
  paint(route,1);
  state.activeIndex += 1;
  state.activeProgress = 0;
  playTone(600 + state.activeIndex*25,.07);
  renderTrails();
  updateProgress();
  if(state.activeIndex >= state.routes.length){ completeLevel(); return; }
  activateRoute(); announceRoute(); pulseMarker();
}

function completeLevel(){
  state.completed = true; state.started = false;
  const teddy = currentTeddy();
  state.save.completed[levelKey(teddy.id,state.level)] = { completedAt:new Date().toISOString(), lives:state.lives };
  persist();
  renderLevelButtons();
  playVictory();
  state.svg.classList.add('revealed');
  els.completionTitle.textContent = `${teddy.primary} · Level ${state.level}`;
  els.completionTagline.textContent = teddy.tagline;
  els.revealHost.innerHTML = renderTeddySvg(teddy,{mode:'reveal',level:state.level});
  els.completionCopy.textContent = state.level === 5 ? `${teddy.primary}'s full five-level mutation set is complete.` : `Level ${state.level + 1} is now unlocked. ${teddy.lore}`;
  els.nextButton.textContent = state.level === 5 ? 'Choose another Teddy' : `Play level ${state.level+1}`;
  setTimeout(()=>els.completionModal.classList.remove('hidden'),350);
}

function goNext(){
  els.completionModal.classList.add('hidden');
  if(state.level < 5) openGame(state.teddyIndex,state.level+1);
  else showHome();
}

function fail(title,message,pointerActive=false){
  if(pointerActive) stopPointer();
  const route = state.routes[state.activeIndex];
  if(route && !route.complete) paint(route,0);
  state.activeProgress = 0;
  state.lives = Math.max(0,state.lives-1);
  renderLives(); updateProgress(); updateInstruction(title,message,true); flashMistake(); playTone(110,.14);
  if(state.lives === 0){ state.started=false; setTimeout(()=>els.gameOverModal.classList.remove('hidden'),350); }
  else pulseMarker();
}

function resetGame(restoreLives){
  stopPointer();
  state.routes.forEach(route=>{ route.complete=false; paint(route,0); });
  state.activeIndex=0; state.activeProgress=0; state.completed=false; state.started=false;
  if(restoreLives) state.lives=3;
  state.svg?.classList.remove('revealed');
  renderLives(); renderTrails(); updateProgress(); activateRoute();
  updateInstruction('Start at the glowing marker',`Trace ${currentTeddy().primary}'s full body in the arrow direction.`,false);
  els.startButton.disabled=false; els.startButton.textContent='Start tracing';
}

function activateRoute(){
  state.routes.forEach((route,index)=>{
    route.path.style.opacity = index===state.activeIndex ? '1' : route.complete ? '.22' : '.48';
    route.path.style.strokeWidth = index===state.activeIndex ? '21' : '17';
  });
  state.svg?.querySelectorAll('[data-start]').forEach((marker,index)=>{
    const active = index===state.activeIndex;
    marker.setAttribute('opacity',active?'1':'.35');
    marker.setAttribute('r',active?'15':'9');
    marker.setAttribute('fill',active?'#e8ff72':'#87905d');
  });
}

function renderLives(){
  els.lives.innerHTML='';
  for(let i=0;i<3;i+=1){ const s=document.createElement('span'); s.className=`toxic-drop${i>=state.lives?' lost':''}`; s.textContent='💧'; els.lives.append(s); }
  els.lives.setAttribute('aria-label',`${state.lives} toxic drops remaining`);
}
function renderTrails(){
  els.trailList.innerHTML='';
  state.routes.forEach((route,index)=>{ const li=document.createElement('li'); li.textContent=route.label; if(route.complete)li.classList.add('complete'); else if(index===state.activeIndex)li.classList.add('active'); els.trailList.append(li); });
}
function updateProgress(){
  const done=state.routes.filter(r=>r.complete).length;
  const total=state.routes.length;
  const pct=total?Math.round(((done+(state.completed?0:state.activeProgress))/total)*100):0;
  els.trailProgress.textContent=`${done} / ${total} trails`;
  els.percentProgress.textContent=`${pct}%`;
}
function updateCollectionCounter(){
  const count=Object.keys(state.save.completed||{}).length;
  els.collectionCounter.textContent=`${count} / ${TOTAL_LEVELS}`;
}
function updateInstruction(title,text,error){
  els.instructionTitle.textContent=title; els.instructionText.textContent=text; els.instructionIcon.textContent=error?'⚠':'☝'; els.instructionCard.classList.toggle('error',error);
}
function announceRoute(){ const r=state.routes[state.activeIndex]; if(r) updateInstruction(`Trace ${r.label}`,`Trail ${state.activeIndex+1} of ${state.routes.length}. Start at the glowing marker.`,false); }
function showHint(){
  const r=state.routes[state.activeIndex]; if(!r)return;
  r.path.animate([{stroke:'#4a351f'},{stroke:currentTeddy().accent},{stroke:'#4a351f'}],{duration:650,iterations:3});
  pulseMarker(); updateInstruction(`Hint: ${r.label}`,'Begin at the bright dot and move toward the arrow.',false);
}
function pulseMarker(){
  const marker=state.svg?.querySelectorAll('[data-start]')[state.activeIndex];
  marker?.animate?.([{transform:'scale(1)',transformOrigin:'center'},{transform:'scale(1.5)',transformOrigin:'center'},{transform:'scale(1)',transformOrigin:'center'}],{duration:850,iterations:2});
}
function flashMistake(){
  els.mistakeFlash.classList.remove('active'); els.puzzleFrame.classList.remove('shake'); void els.mistakeFlash.offsetWidth;
  els.mistakeFlash.classList.add('active'); els.puzzleFrame.classList.add('shake');
  setTimeout(()=>{els.mistakeFlash.classList.remove('active');els.puzzleFrame.classList.remove('shake');},430);
  navigator.vibrate?.([40,25,55]);
}
function paint(route,p){ route.progress.style.strokeDashoffset=`${route.length*(1-Math.max(0,Math.min(1,p)))}`; }
function nearestSample(route,point){ let best={index:0,distance:Infinity}; route.samples.forEach((sample,index)=>{ const d=distance(sample,point); if(d<best.distance)best={index,distance:d}; }); return best; }
function clientToSvg(x,y){ const matrix=state.svg.getScreenCTM(); const p=new DOMPoint(x,y).matrixTransform(matrix.inverse()); return {x:p.x,y:p.y}; }
function distance(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
function playTone(freq,duration){
  if(!state.sound)return; const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
  const c=new C(),o=c.createOscillator(),g=c.createGain(); o.type='sawtooth';o.frequency.value=freq;g.gain.setValueAtTime(.04,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration);o.addEventListener('ended',()=>c.close());
}
function playVictory(){ [330,440,660].forEach((f,i)=>setTimeout(()=>playTone(f,.16),i*120)); }

function renderTeddySvg(teddy,{mode='portrait',level=1}={}){
  const [fur,dark,mutant,light]=teddy.palette;
  const game = mode==='game';
  const texture = game ? '.35' : '.75';
  const routes = routePaths(teddy.feature,level);
  const routeMarkup = game ? routes.map((r,i)=>`<path data-route="${i}" data-label="${r.label}" d="${r.d}"/><circle data-start="${i}" cx="${r.start[0]}" cy="${r.start[1]}" r="${i===0?15:9}" fill="${i===0?'#e8ff72':'#87905d'}" opacity="${i===0?1:.35}"/><path class="arrow-guide" d="${r.arrow}" marker-end="url(#arrow)"/>`).join('') : '';
  const mutation = mutationMarkup(teddy.feature,mutant,light,dark);
  return `<svg viewBox="0 0 700 900" role="img" aria-label="${teddy.primary} full body Toxic Teddy">
  <defs>
    <filter id="furNoise"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="${Number(teddy.id.slice(2))+7}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#49351f"/></marker>
  </defs>
  <rect width="700" height="900" rx="38" fill="${game?'#ead9ae':'#18150f'}"/>
  <g class="teddy-art" opacity="${game?texture:1}">
    <ellipse cx="350" cy="822" rx="210" ry="28" fill="#000" opacity=".18"/>
    <circle cx="188" cy="178" r="90" fill="${fur}" stroke="${dark}" stroke-width="18" filter="url(#furNoise)"/>
    <circle cx="512" cy="178" r="90" fill="${fur}" stroke="${dark}" stroke-width="18" filter="url(#furNoise)"/>
    <circle cx="350" cy="290" r="210" fill="${fur}" stroke="${dark}" stroke-width="20" filter="url(#furNoise)"/>
    <ellipse cx="350" cy="612" rx="190" ry="220" fill="${fur}" stroke="${dark}" stroke-width="20" filter="url(#furNoise)"/>
    <ellipse cx="145" cy="590" rx="78" ry="180" transform="rotate(10 145 590)" fill="${fur}" stroke="${dark}" stroke-width="18"/>
    <ellipse cx="555" cy="590" rx="78" ry="180" transform="rotate(-10 555 590)" fill="${fur}" stroke="${dark}" stroke-width="18"/>
    <ellipse cx="255" cy="790" rx="110" ry="76" fill="${fur}" stroke="${dark}" stroke-width="18"/>
    <ellipse cx="445" cy="790" rx="110" ry="76" fill="${fur}" stroke="${dark}" stroke-width="18"/>
    <path d="M350 90 C330 150 360 205 338 260 C322 300 340 338 350 378" fill="none" stroke="#2b1f16" stroke-width="10" stroke-dasharray="16 10"/>
    <circle cx="275" cy="278" r="53" fill="#171511" stroke="#080706" stroke-width="12"/><path d="M250 255 300 303M300 255 250 303" stroke="#696057" stroke-width="10"/>
    <ellipse cx="425" cy="278" rx="52" ry="58" fill="${light}" stroke="#171511" stroke-width="12"/><circle cx="436" cy="291" r="14" fill="#19150e"/><circle cx="420" cy="263" r="8" fill="#fff"/>
    <ellipse cx="350" cy="370" rx="108" ry="78" fill="#b98957" stroke="${dark}" stroke-width="12"/>
    <ellipse cx="350" cy="342" rx="52" ry="38" fill="#171511"/><path d="M290 397 Q350 455 410 397 Q350 430 290 397" fill="#24140e" stroke="#17100b" stroke-width="10"/><path d="M308 405 326 429 344 409 363 431 382 406" fill="#e8dfbf"/>
    <ellipse cx="350" cy="625" rx="118" ry="145" fill="#b98856" opacity=".72" stroke="${dark}" stroke-width="12"/>
    ${mutation}
  </g>
  <g class="routes" fill="none" stroke="#49351f" stroke-width="17" stroke-linecap="round" stroke-linejoin="round">${routeMarkup}</g>
</svg>`;
}

function mutationMarkup(feature,accent,light,dark){
  const common=`<path d="M160 470 195 452 215 487 179 503Z" fill="#b45a6c" stroke="${dark}" stroke-width="7"/><path d="M505 690 545 675 560 715 520 725Z" fill="#6e9d91" stroke="${dark}" stroke-width="7"/>`;
  const map={
    radiation:`<circle cx="350" cy="625" r="74" fill="#e1c62f" stroke="#18140d" stroke-width="12"/><circle cx="350" cy="625" r="18" fill="#18140d"/><path d="M350 553 323 606 377 606ZM287 664 344 652 317 702ZM413 664 356 652 383 702Z" fill="#18140d"/><path d="M190 175 Q172 218 198 242" stroke="${accent}" stroke-width="16" fill="none"/><circle cx="190" cy="248" r="12" fill="${accent}"/>`,
    mold:`<g fill="${accent}" stroke="${dark}" stroke-width="5"><circle cx="190" cy="175" r="24"/><circle cx="165" cy="205" r="15"/><circle cx="505" cy="205" r="20"/><circle cx="210" cy="565" r="18"/><circle cx="500" cy="650" r="22"/></g><path d="M302 548 q25-58 54 0 q-28 24-54 0M360 558 q30-70 64 0 q-34 28-64 0" fill="${light}" stroke="${dark}" stroke-width="7"/>`,
    trash:`<path d="M120 130 580 130 540 210 160 210Z" fill="#62645e" stroke="#222" stroke-width="14"/><path d="M260 95h180l28 38H232Z" fill="#777a72" stroke="#222" stroke-width="12"/><circle cx="350" cy="625" r="72" fill="#6e726b" stroke="#222" stroke-width="12"/><path d="M310 585 390 665M390 585 310 665" stroke="#35372f" stroke-width="14"/>`,
    sludge:`<path d="M220 715 Q250 690 275 735 T330 735 T385 735 T440 735 T490 715 L490 815 Q430 852 350 850 Q270 850 210 815Z" fill="${accent}" opacity=".85"/><path d="M520 520 Q545 570 520 625 Q500 670 530 710" stroke="${accent}" stroke-width="22" fill="none"/>`,
    battery:`<g stroke="#1b1a16" stroke-width="9"><rect x="120" y="455" width="76" height="150" rx="12" fill="#e0cc3f"/><rect x="504" y="455" width="76" height="150" rx="12" fill="#e0cc3f"/><path d="M140 480h36M530 480h30"/><path d="M154 520v45M132 542h44M542 520v45"/></g><path d="M330 510 300 590 342 578 320 655 405 555 361 568 385 510Z" fill="${accent}" stroke="#211b12" stroke-width="8"/>`,
    maggot:`<g fill="${light}" stroke="${dark}" stroke-width="4"><path d="M205 185q38-35 62 5q-25 30-62-5"/><path d="M480 510q42-32 62 12q-30 28-62-12"/><path d="M260 700q38-30 60 8q-28 30-60-8"/></g><g fill="#21170f"><circle cx="220" cy="182" r="4"/><circle cx="496" cy="508" r="4"/><circle cx="278" cy="699" r="4"/></g>`,
    burger:`<g stroke="${dark}" stroke-width="9"><path d="M260 555 Q350 490 440 555Z" fill="#d79a43"/><rect x="250" y="555" width="200" height="45" rx="14" fill="#5f321d"/><path d="M250 600h200l-22 36H272Z" fill="#e8c84c"/><rect x="255" y="636" width="190" height="44" rx="14" fill="#6f3d22"/><path d="M260 680 Q350 745 440 680Z" fill="#d79a43"/></g>`,
    rust:`<g fill="#a9562b" stroke="#34241a" stroke-width="8"><path d="M150 430 215 405 235 475 165 498Z"/><path d="M460 565 540 548 555 625 475 640Z"/><path d="M290 665 370 650 380 720 300 732Z"/></g><g fill="#e1a36f"><circle cx="177" cy="445" r="6"/><circle cx="510" cy="585" r="6"/><circle cx="335" cy="680" r="6"/></g>`,
    acid:`<path d="M145 430 Q190 455 170 510 Q150 560 185 600" stroke="${accent}" stroke-width="24" fill="none"/><path d="M480 690q25-55 55 0q-28 35-55 0" fill="${accent}"/><g fill="#19150f"><circle cx="250" cy="565" r="20"/><circle cx="455" cy="520" r="14"/><circle cx="390" cy="730" r="18"/></g>`,
    mask:`<path d="M250 315 Q350 235 450 315 L425 440 Q350 480 275 440Z" fill="#49534a" stroke="#151713" stroke-width="14"/><circle cx="295" cy="330" r="36" fill="#8ba06b" stroke="#151713" stroke-width="10"/><circle cx="405" cy="330" r="36" fill="#8ba06b" stroke="#151713" stroke-width="10"/><circle cx="350" cy="410" r="34" fill="#252b27"/><path d="M270 430 Q210 470 180 560M430 430 Q490 470 520 560" fill="none" stroke="#252b27" stroke-width="18"/>`,
    patchwork:`${common}<path d="M290 510 410 520 400 650 280 640Z" fill="#ca5c76" stroke="${dark}" stroke-width="9"/><path d="M290 510 400 650M410 520 280 640" stroke="#f2c0cc" stroke-width="6" stroke-dasharray="10 8"/><path d="M200 160 250 190 220 235 175 208Z" fill="#5aa3a0" stroke="${dark}" stroke-width="8"/>`,
    plague:`<path d="M300 300 Q350 260 405 300 L520 370 405 410 Q350 450 300 410Z" fill="#d7c49b" stroke="#171511" stroke-width="14"/><circle cx="305" cy="315" r="22" fill="#20221b"/><circle cx="390" cy="315" r="22" fill="#20221b"/><path d="M190 420 Q350 350 510 420 L560 720 Q350 830 140 720Z" fill="#24221d" opacity=".72"/><path d="M140 700h420" stroke="#58663c" stroke-width="12"/>`
  };
  return map[feature] || common;
}

function routePaths(feature,level){
  return [
    {label:'Left ruined ear',d:'M238 132 C188 87 114 112 105 182 C98 240 138 270 190 266 C229 263 247 226 239 191',start:[238,132],arrow:'M132 142 Q105 180 133 220'},
    {label:'Right infected ear',d:'M462 132 C514 88 586 112 596 182 C604 239 565 271 513 266 C474 262 454 227 462 190',start:[462,132],arrow:'M568 143 Q596 180 568 220'},
    {label:'Button-eye socket',d:'M225 272 C248 229 309 222 337 267 C321 316 258 332 222 298 C210 287 212 279 225 272 C250 252 286 256 299 278 C309 297 297 315 276 321',start:[225,272],arrow:'M240 252 Q270 235 302 258'},
    {label:'Mutant eye',d:'M374 269 C401 225 461 226 489 272 C469 318 408 330 376 298 C364 286 363 278 374 269 C403 250 437 257 450 281 C459 298 448 315 429 321',start:[374,269],arrow:'M390 252 Q423 236 457 262'},
    {label:'Rotten muzzle',d:'M350 324 C303 326 276 355 280 388 C284 426 322 445 354 442 C389 439 421 416 420 382 C419 348 391 323 350 324 C328 335 319 356 325 377 C330 397 350 406 367 397',start:[350,324],arrow:'M310 347 Q344 319 383 344'},
    {label:'Toxic grin',d:'M282 407 C316 448 383 451 420 407 C404 468 376 489 350 489 C321 489 297 465 282 407',start:[282,407],arrow:'M307 431 Q347 458 389 430'},
    {label:'Left arm seam',d:'M190 445 C128 480 105 562 129 642 C149 708 179 745 216 729 C243 716 239 678 222 640 C198 585 202 514 236 480',start:[190,445],arrow:'M155 495 Q125 560 151 628'},
    {label:'Right arm leak',d:'M510 445 C572 480 596 562 571 642 C551 708 521 745 484 729 C457 716 461 678 478 640 C502 585 498 514 464 480',start:[510,445],arrow:'M545 495 Q575 560 549 628'},
    {label:'Belly mutation',d:'M350 492 C276 493 231 551 236 632 C241 711 287 755 350 755 C416 755 463 709 464 632 C465 552 421 493 350 492 C306 520 296 574 315 613 C331 646 370 655 391 628',start:[350,492],arrow:'M277 535 Q240 612 276 690'},
    {label:'Chest fracture',d:'M350 493 L326 540 L362 568 L330 612 L370 645 L345 691',start:[350,493],arrow:'M342 510 L330 538 L349 553'},
    {label:'Left infected leg',d:'M290 735 C235 724 176 742 168 786 C160 832 209 856 273 846 C320 839 338 811 325 779 C317 758 304 744 290 735',start:[290,735],arrow:'M220 750 Q170 780 200 817'},
    {label:'Right infected leg',d:'M410 735 C465 724 524 742 532 786 C540 832 491 856 427 846 C380 839 362 811 375 779 C383 758 396 744 410 735',start:[410,735],arrow:'M480 750 Q530 780 500 817'},
    {label: feature==='plague'?'Lantern drip':'Final toxic drip',d:'M350 755 C356 790 387 801 379 833 C371 863 344 871 331 847 C320 828 337 808 324 789 C313 773 293 768 282 754',start:[350,755],arrow:'M344 775 Q365 796 357 822'}
  ];
}

boot();
