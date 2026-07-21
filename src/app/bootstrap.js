import { createAccessibilityController } from '../accessibility/accessibility.js';
import { createContentRegistry } from '../content/content-registry.js';
import { createInputController } from '../game/input-controller.js';
import { createSaveStore } from '../storage/save-store.js';
import { createNativeBridge } from './native-bridge.js';
import { installMobileShell } from './mobile-shell.js';

async function bootstrap() {
  const bridge = createNativeBridge();
  const content = createContentRegistry();
  const saveStore = await createSaveStore(bridge, content);
  const accessibility = createAccessibilityController();

  window.ToxicNative = bridge;
  window.ToxicContent = content;
  window.ToxicSaveStore = saveStore;
  window.ToxicInputControllerFactory = createInputController;
  window.ToxicAccessibility = accessibility;
  window.__TOXIC_TEDDIES_BUILD__ = 'native-phases-1-10-v1';

  await bridge.initialize();

  bridge.onPause(async () => {
    await window.__toxicPersistCurrentSession?.();
    await saveStore.flush();
  });

  bridge.onResume(() => {
    window.__toxicInputController?.refresh?.();
    window.dispatchEvent(new Event('resize'));
  });

  if (!bridge.native && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=31').catch(error => {
      console.warn('Browser prototype service worker registration failed', error);
    });
  }

  await import('../../dense-loader.js');
  await window.__toxicBootPromise;

  accessibility.install();
  await installMobileShell(bridge);

  document.documentElement.dataset.platform = bridge.platform;
  document.documentElement.classList.toggle('native-app', bridge.native);
}

bootstrap().catch(error => {
  console.error(error);
  const status = document.getElementById('statusText');
  if (status) status.textContent = 'Toxic Teddies failed to start';
});
