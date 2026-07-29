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
if (!Number.isInteger(width) || !Number.isInteger(height)) throw new Error('Viewport dimensions must be integers');

const port = 9300 + (process.pid % 500);
const profilePath = `/tmp/toxic-teddies-cdp-${process.pid}-${width}x${height}`;
const baseOutput = outputPath.replace(/\.png$/i, '');
const diagnosticPath = `${baseOutput}.json`;
const domPath = `${baseOutput}.html`;

await mkdir(path.dirname(outputPath), {recursive: true});
await rm(profilePath, {recursive: true, force: true});

const chrome = spawn(chromeBinary, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-sync',
  '--no-first-run',
  '--no-default-browser-check',
  '--hide-scrollbars',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profilePath}`,
  'about:blank',
], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let chromeStdout = '';
let chromeStderr = '';
chrome.stdout.on('data', chunk => { chromeStdout += chunk; });
chrome.stderr.on('data', chunk => { chromeStderr += chunk; });

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitForPageTarget() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (chrome.exitCode !== null) throw new Error(`Chrome exited before CDP became available: ${chromeStderr}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const targets = await response.json();
      const target = targets.find(item => item.type === 'page');
      if (target?.webSocketDebuggerUrl) return target;
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Chrome DevTools endpoint did not become available. ${chromeStderr}`);
}

const target = await waitForPageTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, {once: true});
  socket.addEventListener('error', reject, {once: true});
});

let nextId = 0;
const pending = new Map();
const networkEvents = [];
const runtimeExceptions = [];
const consoleErrors = [];

socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const {resolve, reject} = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(`${message.error.message}: ${JSON.stringify(message.error.data || {})}`));
    else resolve(message.result);
    return;
  }

  if (message.method === 'Network.responseReceived') {
    const response = message.params?.response;
    if (response?.url?.includes('/assets/backdrops/')) {
      networkEvents.push({
        type: 'response',
        url: response.url,
        status: response.status,
        mimeType: response.mimeType,
        fromDiskCache: response.fromDiskCache,
        fromServiceWorker: response.fromServiceWorker,
      });
    }
  }

  if (message.method === 'Network.loadingFailed') {
    networkEvents.push({
      type: 'failure',
      requestId: message.params?.requestId,
      errorText: message.params?.errorText,
      blockedReason: message.params?.blockedReason,
    });
  }

  if (message.method === 'Runtime.exceptionThrown') {
    runtimeExceptions.push(message.params?.exceptionDetails || message.params);
  }

  if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
    consoleErrors.push(message.params.args?.map(argument => argument.value || argument.description).join(' ') || 'console.error');
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
  const response = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) throw new Error(`Evaluation failed: ${JSON.stringify(response.exceptionDetails)}`);
  return response.result?.value;
}

const diagnosticExpression = `(() => {
  const splash = document.getElementById('bootSplash');
  const game = document.getElementById('gameView');
  const board = document.querySelector('.board-shell');
  const splashStyle = splash ? getComputedStyle(splash) : null;
  const gameStyle = game ? getComputedStyle(game) : null;
  const boardStyle = board ? getComputedStyle(board) : null;
  const gameRect = game?.getBoundingClientRect();
  const boardRect = board?.getBoundingClientRect();
  return {
    href: location.href,
    readyState: document.readyState,
    bodyClass: document.body?.className || null,
    splashClass: splash?.className || null,
    splashDisplay: splashStyle?.display || null,
    splashVisibility: splashStyle?.visibility || null,
    splashOpacity: splashStyle?.opacity || null,
    splashHidden: !splash || splash.classList.contains('boot-splash-hidden') || splashStyle?.display === 'none' || splashStyle?.visibility === 'hidden',
    gameClass: game?.className || null,
    gameVisible: Boolean(game && !game.classList.contains('hidden') && gameStyle?.display !== 'none'),
    backdropStatus: game?.dataset.gameplayBackdropStatus || null,
    backdropUrl: game?.dataset.gameplayBackdropUrl || null,
    inlineBackgroundImage: game?.style.backgroundImage || null,
    computedBackgroundImage: gameStyle?.backgroundImage || null,
    computedBackgroundSize: gameStyle?.backgroundSize || null,
    computedBackgroundColor: gameStyle?.backgroundColor || null,
    gameRect: gameRect ? {x: gameRect.x, y: gameRect.y, width: gameRect.width, height: gameRect.height} : null,
    boardBackground: boardStyle?.backgroundImage || null,
    boardRect: boardRect ? {x: boardRect.x, y: boardRect.y, width: boardRect.width, height: boardRect.height} : null,
    pathCount: document.querySelectorAll('.dense-path, .path-piece').length,
    statusText: document.getElementById('statusText')?.textContent || null,
  };
})()`;

let finalDiagnostics = null;
let auditError = null;
let transientEvaluationError = null;

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 620,
    screenWidth: width,
    screenHeight: height,
    dontSetVisibleSize: false,
  });

  const navigation = await send('Page.navigate', {url});
  if (navigation.errorText) throw new Error(`Navigation failed: ${navigation.errorText}`);

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      finalDiagnostics = await evaluate(diagnosticExpression);
      transientEvaluationError = null;
    } catch (error) {
      transientEvaluationError = error;
      await sleep(250);
      continue;
    }

    const ready = finalDiagnostics?.splashHidden
      && finalDiagnostics?.gameVisible
      && finalDiagnostics?.backdropStatus === 'loaded'
      && finalDiagnostics?.computedBackgroundImage?.includes('/assets/backdrops/tt01/neutral.webp')
      && finalDiagnostics?.pathCount > 0;
    if (ready) break;
    await sleep(250);
  }

  if (!finalDiagnostics && transientEvaluationError) throw transientEvaluationError;
  if (!finalDiagnostics?.splashHidden) throw new Error('Loading screen did not hand off to gameplay');
  if (!finalDiagnostics?.gameVisible) throw new Error('Gameplay view is not visible');
  if (finalDiagnostics?.backdropStatus !== 'loaded') throw new Error(`Backdrop status is ${finalDiagnostics?.backdropStatus}`);
  if (!finalDiagnostics?.computedBackgroundImage?.includes('/assets/backdrops/tt01/neutral.webp')) {
    throw new Error(`Computed background image is incorrect: ${finalDiagnostics?.computedBackgroundImage}`);
  }
  if (!(finalDiagnostics?.pathCount > 0)) throw new Error('No puzzle paths rendered');

  const backdropResponse = networkEvents.find(event =>
    event.type === 'response'
    && event.url.endsWith('/assets/backdrops/tt01/neutral.webp')
    && event.status === 200,
  );
  if (!backdropResponse) throw new Error(`No successful neutral.webp network response: ${JSON.stringify(networkEvents)}`);
  if (runtimeExceptions.length) throw new Error(`Runtime exception detected: ${JSON.stringify(runtimeExceptions)}`);
  if (consoleErrors.some(message => message.includes('Gameplay backdrop failed'))) {
    throw new Error(`Backdrop console error detected: ${consoleErrors.join(' | ')}`);
  }

  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await sleep(250);
} catch (error) {
  auditError = error;
} finally {
  try {
    finalDiagnostics = await evaluate(diagnosticExpression);
  } catch (evidenceError) {
    if (!auditError) auditError = evidenceError;
  }

  try {
    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(outputPath, Buffer.from(screenshot.data, 'base64'));
    const dom = await evaluate('document.documentElement?.outerHTML || ""');
    await writeFile(domPath, dom || '', 'utf8');
  } catch (evidenceError) {
    if (!auditError) auditError = evidenceError;
  }

  await writeFile(diagnosticPath, `${JSON.stringify({
    viewport: {width, height},
    diagnostics: finalDiagnostics,
    networkEvents,
    runtimeExceptions,
    consoleErrors,
    chromeStdout,
    chromeStderr,
    error: auditError ? {name: auditError.name, message: auditError.message, stack: auditError.stack} : null,
  }, null, 2)}\n`, 'utf8');

  try {
    await send('Browser.close');
  } catch {
    chrome.kill('SIGTERM');
  }
  socket.close();
  await Promise.race([
    new Promise(resolve => chrome.once('exit', resolve)),
    sleep(2_000).then(() => chrome.kill('SIGKILL')),
  ]);
  await rm(profilePath, {recursive: true, force: true});
}

if (auditError) throw auditError;
