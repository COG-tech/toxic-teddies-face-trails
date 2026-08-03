import {spawn} from 'node:child_process';
import {mkdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const [url, outputPath, widthArg, heightArg] = process.argv.slice(2);
if (!url || !outputPath || !widthArg || !heightArg) {
  throw new Error('Usage: node scripts/capture-gameplay-backdrop-audit.mjs <url> <output.png> <width> <height>');
}

const chromeBinary = process.env.CHROME_BIN;
if (!chromeBinary) throw new Error('CHROME_BIN is required');
const width = Number(widthArg);
const height = Number(heightArg);
const port = 9300 + (process.pid % 500);
const profilePath = `/tmp/toxic-teddies-cdp-${process.pid}-${width}x${height}`;
const baseOutput = outputPath.replace(/\.png$/i, '');
await mkdir(path.dirname(outputPath), {recursive: true});
await rm(profilePath, {recursive: true, force: true});

const chrome = spawn(chromeBinary, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--disable-background-networking', '--disable-extensions', '--no-first-run',
  '--hide-scrollbars', '--remote-allow-origins=*', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profilePath}`, 'about:blank',
], {stdio: ['ignore', 'pipe', 'pipe']});

let chromeStderr = '';
chrome.stderr.on('data', chunk => { chromeStderr += chunk; });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForTarget() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const target = (await response.json()).find(item => item.type === 'page');
      if (target?.webSocketDebuggerUrl) return target;
    } catch {}
    await sleep(100);
  }
  throw new Error(`Chrome DevTools endpoint unavailable: ${chromeStderr}`);
}

const target = await waitForTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, {once: true});
  socket.addEventListener('error', reject, {once: true});
});

let nextId = 0;
const pending = new Map();
const runtimeExceptions = [];
const consoleErrors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(message.error.message));
    else entry.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') runtimeExceptions.push(message.params?.exceptionDetails || message.params);
  if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
    consoleErrors.push(message.params.args?.map(arg => arg.value || arg.description).join(' ') || 'console.error');
  }
});

function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result?.value;
}

const diagnosticExpression = `(() => {
  const serialize = rect => rect ? ({x:rect.x,y:rect.y,width:rect.width,height:rect.height,right:rect.right,bottom:rect.bottom}) : null;
  const transformed = element => {
    if (!element?.getBBox || !element?.getScreenCTM) return null;
    const b = element.getBBox(); const m = element.getScreenCTM();
    const p = (x,y) => ({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f});
    const points=[p(b.x,b.y),p(b.x+b.width,b.y),p(b.x,b.y+b.height),p(b.x+b.width,b.y+b.height)];
    const xs=points.map(v=>v.x), ys=points.map(v=>v.y);
    const left=Math.min(...xs), right=Math.max(...xs), top=Math.min(...ys), bottom=Math.max(...ys);
    return {x:left,y:top,width:right-left,height:bottom-top,right,bottom};
  };
  const splash=document.getElementById('bootSplash');
  const game=document.getElementById('gameView');
  const board=document.querySelector('.board-shell');
  const puzzle=document.querySelector('.dense-piece-layer')||document.querySelector('.compiled-piece-layer')||document.getElementById('pieceLayer');
  const gameRect=game?.getBoundingClientRect(); const boardRect=board?.getBoundingClientRect(); const puzzleRect=transformed(puzzle);
  const splashStyle=splash?getComputedStyle(splash):null; const gameStyle=game?getComputedStyle(game):null;
  const metrics=window.ToxicPuzzleFit?.getMetrics?.()||null;
  const puzzleAspectRatio=puzzleRect?.height ? puzzleRect.width/puzzleRect.height : null;
  const lockedAspectRatio=metrics?.aspectRatio||null;
  return {
    splashHidden: !splash || splash.classList.contains('boot-splash-hidden') || splashStyle?.display==='none' || splashStyle?.visibility==='hidden',
    gameVisible: Boolean(game && !game.classList.contains('hidden') && gameStyle?.display!=='none'),
    backdropStatus: game?.dataset.gameplayBackdropStatus||null,
    backdropMode: game?.dataset.gameplayBackdropMode||null,
    puzzleFitStatus: game?.dataset.puzzleFitStatus||null,
    puzzleScaleLocked: game?.dataset.puzzleScaleLocked||null,
    puzzleAspectPreserved: game?.dataset.puzzleAspectPreserved||null,
    computedBackgroundImage: gameStyle?.backgroundImage||null,
    gameRect: serialize(gameRect), boardRect: serialize(boardRect), puzzleRect: serialize(puzzleRect),
    boardWidthRatio: gameRect?.width&&boardRect?boardRect.width/gameRect.width:null,
    puzzleWidthRatio: gameRect?.width&&puzzleRect?puzzleRect.width/gameRect.width:null,
    puzzleHeightRatio: gameRect?.height&&puzzleRect?puzzleRect.height/gameRect.height:null,
    puzzleAspectRatio, lockedAspectRatio,
    puzzleInsideGame: Boolean(gameRect&&puzzleRect&&puzzleRect.x>=gameRect.x-6&&puzzleRect.right<=gameRect.right+6&&puzzleRect.y>=gameRect.y-6&&puzzleRect.bottom<=gameRect.bottom+6),
    pathCount: document.querySelectorAll('.dense-path, .path-piece').length,
  };
})()`;

let diagnostics = null;
let auditError = null;
try {
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:width<=620,screenWidth:width,screenHeight:height});
  await send('Page.navigate', {url});
  const deadline=Date.now()+30000;
  while(Date.now()<deadline){
    diagnostics=await evaluate(diagnosticExpression);
    if(diagnostics?.splashHidden&&diagnostics?.gameVisible&&diagnostics?.backdropMode==='generated-css'&&diagnostics?.puzzleFitStatus==='fitted') break;
    await sleep(250);
  }
  if(!diagnostics?.splashHidden) throw new Error('Loading screen did not hand off');
  if(diagnostics?.backdropStatus!=='loaded'||diagnostics?.backdropMode!=='generated-css') throw new Error('Generated gameplay frame is not ready');
  if(diagnostics?.computedBackgroundImage?.includes('/assets/backdrops/')) throw new Error('Raster gameplay backdrop is still active');
  if(!(diagnostics?.pathCount>0)) throw new Error('No puzzle paths rendered');
  if(!(diagnostics?.boardWidthRatio>=0.98)) throw new Error(`Board is too narrow: ${diagnostics?.boardWidthRatio}`);
  if(!(Math.max(diagnostics?.puzzleWidthRatio||0,diagnostics?.puzzleHeightRatio||0)>=0.82)) throw new Error('Puzzle does not use the dominant viewport dimension');
  if(!(Math.min(diagnostics?.puzzleWidthRatio||0,diagnostics?.puzzleHeightRatio||0)>=0.40)) throw new Error('Puzzle is too small on the secondary viewport dimension');
  if(!diagnostics?.puzzleInsideGame) throw new Error('Puzzle is clipped');
  if(!diagnostics?.lockedAspectRatio||Math.abs(diagnostics.puzzleAspectRatio-diagnostics.lockedAspectRatio)>0.03) throw new Error('Teddy aspect ratio changed');
  if(runtimeExceptions.length) throw new Error(`Runtime exceptions: ${JSON.stringify(runtimeExceptions)}`);
} catch (error) { auditError = error; }

try {
  const screenshot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
  await writeFile(outputPath,Buffer.from(screenshot.data,'base64'));
  await writeFile(`${baseOutput}.html`,await evaluate('document.documentElement.outerHTML'),'utf8');
} catch (error) { if(!auditError) auditError=error; }
await writeFile(`${baseOutput}.json`,`${JSON.stringify({viewport:{width,height},diagnostics,runtimeExceptions,consoleErrors,error:auditError?{message:auditError.message,stack:auditError.stack}:null},null,2)}\n`,'utf8');
try { await send('Browser.close'); } catch { chrome.kill('SIGTERM'); }
socket.close();
await rm(profilePath,{recursive:true,force:true});
if(auditError) throw auditError;
