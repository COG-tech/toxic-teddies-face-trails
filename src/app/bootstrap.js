import { createAccessibilityController } from '../accessibility/accessibility.js';
import { createContentRegistry } from '../content/content-registry.js';
import buildInfo from '../generated/build-info.json';
import { createInputController } from '../game/input-controller.js';
import { createSaveStore } from '../storage/save-store.js';
import { verifyBundledContent } from './content-integrity.js';
import { createNativeBridge } from './native-bridge.js';
import { installMobileShell } from './mobile-shell.js';

function showStartupFailure(error, platform) {
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
  const content = createContentRegistry();
  const accessibility = createAccessibilityController();

  await bridge.disableLegacyBrowserCaches();
  const integrity = await verifyBundledContent(buildInfo);
  const appInfo = await bridge.getAppInfo();
  const runtimeBuildInfo = Object.freeze({...buildInfo, ...appInfo, integrity});
  const saveStore = await createSaveStore(bridge, content, buildInfo);

  window.ToxicNative = bridge;
  window.ToxicContent = content;
  window.ToxicSaveStore = saveStore;
  window.ToxicInputControllerFactory = createInputController;
  window.ToxicAccessibility = accessibility;
  window.ToxicBuildInfo = runtimeBuildInfo;
  window.__TOXIC_TEDDIES_BUILD__ = buildInfo.buildId;

  await bridge.initialize();

  async function persistLifecycleState() {
    await window.__toxicPersistCurrentSession?.();
    await saveStore.flush();
  }

  bridge.onPause(persistLifecycleState);
  bridge.onResume(() => {
    window.__toxicInputController?.refresh?.();
    window.dispatchEvent(new Event('resize'));
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistLifecycleState().catch(console.error);
    else window.__toxicInputController?.refresh?.();
  });
  window.addEventListener('pagehide', () => persistLifecycleState().catch(console.error));
  window.addEventListener('pageshow', () => window.__toxicInputController?.refresh?.());

  if (!bridge.native && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=32').catch(error => {
      console.warn('Browser prototype service worker registration failed', error);
    });
  }

  await import('../../dense-loader.js');
  await window.__toxicBootPromise;

  accessibility.install();
  await installMobileShell(bridge);
  await saveStore.markSuccessfulLaunch();

  document.documentElement.dataset.platform = bridge.platform;
  document.documentElement.dataset.build = buildInfo.buildId;
  document.documentElement.classList.toggle('native-app', bridge.native);
}

bootstrap().catch(error => showStartupFailure(error, globalThis.Capacitor?.getPlatform?.() || 'web'));
