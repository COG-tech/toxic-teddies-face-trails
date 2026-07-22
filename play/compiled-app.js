const NS = 'http://www.w3.org/2000/svg';
const STORAGE_KEY = 'toxic-teddies:compiled-patterns-v1';
const LEVELS_PER_TEDDY = 5;
const TEDDIES = [
  ['tt01','Toxic Toby','Radioactive Ricky','#9dbb3c'],
  ['tt02','Moldy Molly','Fungus Faye','#91b44a'],
  ['tt03','Dumpster Danny','Trashcan Travis','#b18b50'],
  ['tt04','Sludge Sam','Gooey Grant','#88a84b'],
  ['tt05','Battery Barry','Leaking Leon','#c4aa43'],
  ['tt06','Maggot Mitch','Wormy Walt','#a6b45d'],
  ['tt07','Burger Bear','Greasy Gina','#b37d48'],
  ['tt08','Rusty Randy','Corroded Cory','#b46c42'],
  ['tt09','Acid Andy','Meltdown Mel','#9fc642'],
  ['tt10','Gas Mask Max','Fumey Frank','#8ca25d'],
  ['tt11','Patchwork Pat','Quilted Quinn','#b46f8f'],
  ['tt12','Plague Bear','Sickly Sonny','#7d9a54'],
].map(([id,primary,alternate,accent]) => ({id,primary,alternate,accent}));
const DIRS = {
  up:{dr:-1,dc:0,dx:0,dy:-1},
  right:{dr:0,dc:1,dx:1,dy:0},
  down:{dr:1,dc:0,dx:0,dy:1},
  left:{dr:0,dc:-1,dx:-1,dy:0},
};
const els = Object.fromEntries([
  'homeView','gameView','teddyGrid','collectionCounter','backButton','levelTitle','characterName',
  'lives','clearProgress','percentProgress','board','boardBackdrop','pieceLayer','previewLayer',
  'statusText','resetButton','hintButton','levelButtons','completionModal','completionTitle',
  'completionCopy','replayButton','nextButton','gameOverModal','tryAgainButton',
].map(id => [id, document.getElementById(id)]));
const state = {
  teddyIndex:0,
  level:1,
  data:null,
  pieces:[],
  byId:new Map(),
  active:new Set(),
  occupancy:new Map(),
  lives:3,
  transitionLock:false,
  pressTimer:null,
  longPressTriggered:false,
  previewTimer:null,
  save:loadSave(),
};

function loadSave(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {completed:{}};}
  catch{return {completed:{}};}
}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.save));updateCollectionCounter();}
function levelKey(teddyId,level){return `${teddyId}-l${level}`;}
function completed(teddyId,level){return Boolean(state.save.completed[levelKey(teddyId,level)]);}
function unlocked(teddyId,level){return level===1 || completed(teddyId,level-1);}
function teddy(){return TEDDIES[state.teddyIndex];}

function bindEvents(){
  els.backButton.addEventListener('click',showHome);
  els.resetButton.addEventListener('click',resetLevel);
  els.hintButton.addEventListener('click',showHint);
  els.replayButton.addEventListener('click',()=>{hideModals();resetLevel();});
  els.nextButton.addEventListener('click',goNext);
  els.tryAgainButton.addEventListener('click',()=>{hideModals();resetLevel();});
  window.addEventListener('blur',clearPressTimer);
}

function boot(){
  bindEvents();
  renderHome();
  updateCollectionCounter();
  const params = new URLSearchParams(location.search);
  const index = TEDDIES.findIndex(item => item.id === params.get('teddy'));
  const level = Number(params.get('level'));
  if(index >= 0) openGame(index,Number.isInteger(level)&&level>=1&&level<=5?level:1);
}

function renderHome(){
  els.teddyGrid.innerHTML='';
  TEDDIES.forEach((item,index)=>{
    const done = Array.from({length:5},(_,i)=>completed(item.id,i+1)).filter(Boolean).length;
    const card=document.createElement('button');
    card.className='teddy-card';
    card.type='button';
    card.style.setProperty('--card-accent',item.accent);
    card.innerHTML=`<div class="teddy-card-art"><span class="mini-face"></span></div><div><h3>${item.primary}</h3><p>${item.alternate}</p><strong>${done}/5</strong></div>`;
    card.addEventListener('click',()=>openGame(index,latestUnlocked(item)));
    els.teddyGrid.append(card);
  });
}
function latestUnlocked(item){let target=1;for(let level=1;level<=5;level++)if(unlocked(item.id,level))target=level;return target;}
function updateCollectionCounter(){els.collectionCounter.textContent=`${Object.keys(state.save.completed).length} / ${TEDDIES.length*5}`;}

function showHome(){
  clearPreview();clearPressTimer();hideModals();
  els.gameView.classList.add('hidden');els.homeView.classList.remove('hidden');
  history.replaceState({},'',location.pathname);renderHome();
}
async function openGame(index,level){
  state.teddyIndex=index;state.level=level;
  els.homeView.classList.add('hidden');els.gameView.classList.remove('hidden');
  const url=new URL(location.href);url.searchParams.set('teddy',teddy().id);url.searchParams.set('level',String(level));history.replaceState({},'',url);
  await loadLevel();
}

async function fetchLevel(){
  const candidates=[`./levels/${teddy().id}/level-${state.level}.json`,`./levels/tt01/level-${state.level}.json`];
  for(const path of candidates){
    const response=await fetch(`${path}?v=1`,{cache:'no-store'});
    if(response.ok)return response.json();
  }
  throw new Error('Compiled level JSON is missing');
}

async function loadLevel(){
  state.transitionLock=true;
  setStatus('Loading compiled pattern…');
  try{
    state.data=await fetchLevel();
    state.pieces=state.data.pieces.map(piece=>({...piece,removed:false,element:null}));
    state.byId=new Map(state.pieces.map(piece=>[piece.id,piece]));
    state.active=new Set(state.pieces.map(piece=>piece.id));
    state.occupancy=new Map();
    for(const piece of state.pieces)for(const [row,col] of piece.cells)state.occupancy.set(`${row}:${col}`,piece.id);
    state.lives=3;state.transitionLock=false;
    els.levelTitle.textContent=`Level ${state.level}`;
    els.characterName.textContent=teddy().primary;
    document.documentElement.style.setProperty('--accent',teddy().accent);
    if(teddy().id==='tt01'){
      els.boardBackdrop.style.backgroundImage="url('./assets/backdrops/toxic-toby-expression-sheet.svg')";
      els.boardBackdrop.style.opacity='.018';
      els.boardBackdrop.style.setProperty('--backdrop-position',['4% 50%','27% 50%','50% 50%','73% 50%','96% 50%'][state.level-1]);
    }else{
      els.boardBackdrop.style.backgroundImage='none';els.boardBackdrop.style.opacity='0';
    }
    renderLives();renderLevelButtons();renderBoard();updateProgress();
    setStatus(`${state.data.expression.replaceAll('_',' ')} · find a clear exit`);
  }catch(error){
    console.error(error);state.transitionLock=true;setStatus('Compiled pattern failed to load');
  }
}
function resetLevel(){clearPreview();clearPressTimer();hideModals();loadLevel();}

function renderLevelButtons(){
  els.levelButtons.innerHTML='';
  for(let level=1;level<=5;level++){
    const button=document.createElement('button');button.textContent=level;button.className='level-chip';
    if(level===state.level)button.classList.add('active');
    if(completed(teddy().id,level))button.classList.add('done');
    if(!unlocked(teddy().id,level))button.disabled=true;
    button.addEventListener('click',()=>openGame(state.teddyIndex,level));els.levelButtons.append(button);
  }
}
function renderLives(){
  els.lives.innerHTML='';for(let i=0;i<3;i++){const drop=document.createElement('span');drop.className=`life-drop${i>=state.lives?' lost':''}`;els.lives.append(drop);}
}

function createSvg(tag,attrs={}){const el=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));return el;}
function renderBoard(){
  const unit=state.data.cellSize || 36;
  const sizePx=state.data.gridSize*unit;
  els.board.setAttribute('viewBox',`0 0 ${sizePx} ${sizePx}`);
  els.previewLayer.setAttribute('viewBox',`0 0 ${sizePx} ${sizePx}`);
  els.pieceLayer.innerHTML='';els.previewLayer.innerHTML='';
  els.pieceLayer.append(createDefs());
  const decorationLayer=createSvg('g',{class:'compiled-decoration-layer','pointer-events':'none'});
  renderDecorations(decorationLayer,unit);
  els.pieceLayer.append(decorationLayer);
  const playable=createSvg('g',{class:'compiled-piece-layer'});els.pieceLayer.append(playable);
  for(const piece of state.pieces){
    const group=createSvg('g',{class:`path-piece style-${piece.style||'fur'}`,'data-id':piece.id});
    const points=piece.cells.map(([row,col])=>`${col*unit+unit/2},${row*unit+unit/2}`).join(' ');
    const line=createSvg('polyline',{points,class:'piece-line'});
    const tip=piece.tipCell || extremeCell(piece.cells,piece.exitDirection);
    const dir=DIRS[piece.exitDirection];
    const x1=tip[1]*unit+unit/2,y1=tip[0]*unit+unit/2;
    const arrow=createSvg('line',{x1,y1,x2:x1+dir.dx*unit*.44,y2:y1+dir.dy*unit*.44,class:'piece-arrow','marker-end':'url(#compiledArrow)'});
    const hit=createSvg('polyline',{points,class:'piece-hit'});
    group.append(line,arrow,hit);
    group.addEventListener('pointerdown',event=>beginLongPress(event,piece));
    group.addEventListener('pointerup',endLongPress);group.addEventListener('pointercancel',endLongPress);group.addEventListener('pointerleave',cancelLongPress);
    group.addEventListener('click',event=>{event.preventDefault();if(state.longPressTriggered){state.longPressTriggered=false;return;}attemptMove(piece);});
    piece.element=group;playable.append(group);
  }
}
function createDefs(){
  const defs=createSvg('defs');
  defs.innerHTML='<marker id="compiledArrow" viewBox="0 0 12 12" refX="10.2" refY="6" markerWidth="5.4" markerHeight="5.4" orient="auto" markerUnits="strokeWidth"><path d="M1 1L10.3 6L1 11" fill="none" stroke="#6e5438" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></marker>';
  return defs;
}
function renderDecorations(layer,unit){
  for(const item of state.data.decorations||[]){
    let element=null;
    if(item.type==='circle')element=createSvg('circle',{cx:item.cx*unit+unit/2,cy:item.cy*unit+unit/2,r:item.r*unit,class:`decoration ${item.class}`});
    if(item.type==='ellipse')element=createSvg('ellipse',{cx:item.cx*unit+unit/2,cy:item.cy*unit+unit/2,rx:item.rx*unit,ry:item.ry*unit,class:`decoration ${item.class}`});
    if(item.type==='line')element=createSvg('line',{x1:item.x1*unit+unit/2,y1:item.y1*unit+unit/2,x2:item.x2*unit+unit/2,y2:item.y2*unit+unit/2,class:`decoration ${item.class}`});
    if(item.type==='rect')element=createSvg('rect',{x:item.x*unit+unit/2,y:item.y*unit+unit/2,width:item.width*unit,height:item.height*unit,rx:(item.rx||0)*unit,class:`decoration ${item.class}`});
    if(item.type==='polygon')element=createSvg('polygon',{points:item.points.map(([x,y])=>`${x*unit+unit/2},${y*unit+unit/2}`).join(' '),class:`decoration ${item.class}`});
    if(item.type==='path')element=createSvg('polyline',{points:item.d.map(([x,y])=>`${x*unit+unit/2},${y*unit+unit/2}`).join(' '),class:`decoration ${item.class}`});
    if(element)layer.append(element);
  }
}

function extremeCell(cells,direction){
  return cells.reduce((best,cell)=>{
    if(direction==='up')return cell[0]<best[0]?cell:best;
    if(direction==='down')return cell[0]>best[0]?cell:best;
    if(direction==='left')return cell[1]<best[1]?cell:best;
    return cell[1]>best[1]?cell:best;
  },cells[0]);
}
function blockersAhead(piece){
  const blockers=[];const seen=new Set();const dir=DIRS[piece.exitDirection];
  const [tipRow,tipCol]=piece.tipCell||extremeCell(piece.cells,piece.exitDirection);
  let row=tipRow+dir.dr,col=tipCol+dir.dc;
  while(row>=0&&row<state.data.gridSize&&col>=0&&col<state.data.gridSize){
    const id=state.occupancy.get(`${row}:${col}`);
    if(id&&id!==piece.id&&state.active.has(id)&&!seen.has(id)){seen.add(id);blockers.push(state.byId.get(id));}
    row+=dir.dr;col+=dir.dc;
  }
  return blockers;
}

function beginLongPress(event,piece){
  if(state.transitionLock||piece.removed)return;clearPressTimer();state.longPressTriggered=false;
  state.pressTimer=setTimeout(()=>{state.longPressTriggered=true;previewPiece(piece);navigator.vibrate?.(16);},340);
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function endLongPress(){clearPressTimer();}
function cancelLongPress(){clearPressTimer();}
function clearPressTimer(){if(state.pressTimer)clearTimeout(state.pressTimer);state.pressTimer=null;}
function previewPiece(piece){
  clearPreview();const blockers=blockersAhead(piece);piece.element?.classList.add('inspecting');
  if(blockers.length){blockers[0].element?.classList.add('blocking');setStatus('Blocked · clear the first line in that lane');}
  else setStatus('Open exit · this line can leave now');
  drawPreviewRay(piece,Boolean(blockers.length));state.previewTimer=setTimeout(clearPreview,1300);
}
function drawPreviewRay(piece,blocked){
  const unit=state.data.cellSize||36;const dir=DIRS[piece.exitDirection];const [row,col]=piece.tipCell||extremeCell(piece.cells,piece.exitDirection);
  const x1=col*unit+unit/2,y1=row*unit+unit/2;
  const x2=dir.dc>0?state.data.gridSize*unit:dir.dc<0?0:x1;
  const y2=dir.dr>0?state.data.gridSize*unit:dir.dr<0?0:y1;
  els.previewLayer.append(createSvg('line',{x1,y1,x2,y2,class:`preview-ray${blocked?' blocked':''}`}));
}
function clearPreview(){
  if(state.previewTimer)clearTimeout(state.previewTimer);state.previewTimer=null;els.previewLayer.innerHTML='';
  for(const piece of state.pieces)piece.element?.classList.remove('inspecting','hinting','blocking','blocked-bump');
}

function attemptMove(piece){
  if(state.transitionLock||piece.removed)return;clearPreview();const blockers=blockersAhead(piece);
  if(blockers.length){loseLife(piece,blockers[0]);return;}removePiece(piece);
}
function loseLife(piece,blocker){
  state.lives=Math.max(0,state.lives-1);renderLives();piece.element?.classList.add('blocked-bump');blocker.element?.classList.add('blocking');
  setStatus('Blocked line · one toxic drop lost');navigator.vibrate?.([25,18,30]);
  setTimeout(()=>{piece.element?.classList.remove('blocked-bump');blocker.element?.classList.remove('blocking');},440);
  if(state.lives===0)setTimeout(()=>els.gameOverModal.classList.remove('hidden'),260);
}
function removePiece(piece){
  state.transitionLock=true;const animation=state.data.animation||{pauseMs:100,slideMs:780};const dir=DIRS[piece.exitDirection];
  const unit=state.data.cellSize||36;const distance=state.data.gridSize*unit*1.2;
  piece.element.style.setProperty('--exit-x',`${dir.dx*distance}px`);piece.element.style.setProperty('--exit-y',`${dir.dy*distance}px`);
  piece.element.style.setProperty('--slide-ms',`${animation.slideMs}ms`);
  piece.element.classList.add('escape-armed');setStatus('Line released…');
  setTimeout(()=>{
    piece.element.classList.add('exiting');setStatus('Line escaping · watch the lane open');
    setTimeout(()=>{
      piece.removed=true;piece.element.classList.add('removed');state.active.delete(piece.id);state.transitionLock=false;updateProgress();
      if(!state.active.size)completeLevel();
    },animation.slideMs+40);
  },animation.pauseMs);
}
function showHint(){
  clearPreview();const open=state.pieces.filter(piece=>!piece.removed&&!blockersAhead(piece).length);if(!open.length)return;
  const expected=state.data.solutionOrder?.find(id=>state.active.has(id));const piece=state.byId.get(expected)||open[0];
  piece.element?.classList.add('hinting');drawPreviewRay(piece,false);setStatus('Hint · this line has a clear exit');state.previewTimer=setTimeout(clearPreview,1400);
}
function updateProgress(){
  const total=state.pieces.length,cleared=total-state.active.size,percent=Math.round(cleared/total*100);
  els.clearProgress.textContent=`${cleared} / ${total}`;els.percentProgress.textContent=`${percent}%`;
}
function completeLevel(){
  state.save.completed[levelKey(teddy().id,state.level)]=true;persist();renderLevelButtons();
  els.completionTitle.textContent=`${teddy().primary} · Level ${state.level}`;
  els.completionCopy.textContent=state.level===5?`You cleared all five ${teddy().primary} expressions.`:`Level ${state.level+1} is unlocked.`;
  els.completionModal.classList.remove('hidden');
}
function goNext(){hideModals();if(state.level<5)openGame(state.teddyIndex,state.level+1);else showHome();}
function hideModals(){els.completionModal.classList.add('hidden');els.gameOverModal.classList.add('hidden');}
function setStatus(text){els.statusText.textContent=text;}

boot();