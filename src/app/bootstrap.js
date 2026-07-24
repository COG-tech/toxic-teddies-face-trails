import { createAccessibilityController } from '../accessibility/accessibility.js';
import { createAnalytics } from '../analytics/analytics.js';
import { createContentRegistry } from '../content/content-registry.js';
import buildInfo from '../generated/build-info.json';
import { createInputController } from '../game/input-controller.js';
import * as progression from '../game/progression.js';
import { createSaveStore } from '../storage/save-store.js';
import { verifyBundledContent } from './content-integrity.js';
import { createNativeBridge } from './native-bridge.js';
import { installMobileShell } from './mobile-shell.js';

let startupPlatform = 'web';
const loadingScreen = window.ToxicLoadingScreen;
const setLoadingStage = (message, progress) => loadingScreen?.setStage?.(message, progress);

function showStartupFailure(error, platform) {
  loadingScreen?.fail?.();
  console.error(error);
  document.body.innerHTML = '';
  const main = document.createElement('main');
  main.className = 'startup-failure';
  main.setAttribute('role', 'alert');
  const action = platform === 'web'
    ? 'Refresh the page. Clear the site data if the problem remains.'
    : 'Install the latest app update. Reinstall the app if the problem remains.';
  main.innerHTML = `
    <p class="eyebrow">STARTUP CHECK FAILED</p>
    <h1>Toxic Teddies could not verify its game files.</h1>
    <p>${action}</p>
    <p class="build-diagnostic">Build ${buildInfo.buildId}</p>
  `;
  document.body.append(main);
}

async function bootstrap() {
  const bridge = createNativeBridge(buildInfo);
  startupPlatform = bridge.platform;
  const content = createContentRegistry();
  const accessibility = createAccessibilityController();

  setLoadingStage('Clearing old contamination…', 0.16);
  await bridge.disableLegacyBrowserCaches();
  setLoadingStage('Checking the toxic cargo…', 0.3);
  const integrity = await verifyBundledContent(buildInfo);
  const appInfo = await bridge.getAppInfo();
  const runtimeBuildInfo = Object.freeze({...buildInfo, ...appInfo, integrity});
  setLoadingStage('Restoring your collection…', 0.46);
  const saveStore = await createSaveStore(bridge, content, buildInfo);
  const analytics = createAnalytics({bridge, buildInfo: runtimeBuildInfo});

  window.ToxicNative = bridge;
  window.ToxicContent = content;
  window.ToxicSaveStore = saveStore;
  window.ToxicProgression = progression;
  window.ToxicInputControllerFactory = createInputController;
  window.ToxicAccessibility = accessibility;
  window.ToxicBuildInfo = runtimeBuildInfo;
  window.ToxicAnalytics = analytics;
  window.__TOXIC_TEDDIES_BUILD__ = buildInfo.buildId;

  setLoadingStage('Waking the laboratory…', 0.6);
  await bridge.initialize();
  await analytics.initialize();

  async function persistLifecycleState(reason = 'lifecycle') {
    await window.__toxicPersistCurrentSession?.();
    await saveStore.flush();
    await analytics.track('progress_saved', {reason});
  }

  bridge.onPause(async () => {
    await analytics.track('app_pause');
    await persistLifecycleState('app_pause');
  });
  bridge.onResume(async () => {
    window.__toxicInputController?.refresh?.();
    window.dispatchEvent(new Event('resize'));
    await analytics.track('app_resume');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistLifecycleState('visibility_hidden').catch(console.error);
    else window.__toxicInputController?.refresh?.();
  });
  window.addEventListener('pagehide', () => persistLifecycleState('pagehide').catch(console.error));
  window.addEventListener('pageshow', () => window.__toxicInputController?.refresh?.());

  if (!bridge.native && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=37').catch(error => {
      console.warn('Browser prototype service worker registration failed', error);
    });
  }

  setLoadingStage('Loading the face puzzles…', 0.78);
  await import('../../dense-loader.js');
  await window.__toxicBootPromise;

  setLoadingStage('Finishing the contamination…', 0.92);
  accessibility.install();
  await installMobileShell(bridge);
  await saveStore.markSuccessfulLaunch();

  document.documentElement.dataset.platform = bridge.platform;
  document.documentElement.dataset.build = buildInfo.buildId;
  document.documentElement.classList.toggle('native-app', bridge.native);
  await loadingScreen?.hide?.();
}

bootstrap().catch(error => showStartupFailure(error, startupPlatform));
