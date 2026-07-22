import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

const PROGRESS_PATH = 'toxic-teddies/save-state-v2.json';
const PROGRESS_BACKUP_PATH = 'toxic-teddies/save-state-v2.backup.json';
const WEB_PROGRESS_KEY = 'toxic-teddies:native-save-v2';
const WEB_PROGRESS_BACKUP_KEY = 'toxic-teddies:native-save-v2-backup';

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function createNativeBridge(buildInfo) {
  const native = Capacitor.isNativePlatform();
  const pauseListeners = new Set();
  const resumeListeners = new Set();
  const backListeners = new Set();
  const handles = [];

  async function disableLegacyBrowserCaches() {
    if (!native) return;
    try {
      const registrations = await navigator.serviceWorker?.getRegistrations?.();
      await Promise.all((registrations || []).map(registration => registration.unregister()));
    } catch (error) {
      console.warn('Legacy service worker cleanup unavailable', error);
    }
    try {
      const keys = await globalThis.caches?.keys?.();
      await Promise.all((keys || []).map(key => globalThis.caches.delete(key)));
    } catch (error) {
      console.warn('Legacy browser cache cleanup unavailable', error);
    }
  }

  async function initialize() {
    await disableLegacyBrowserCaches();
    if (native) {
      try {
        await ScreenOrientation.lock({orientation: 'portrait'});
      } catch (error) {
        console.warn('Portrait lock unavailable', error);
      }
      try {
        await StatusBar.setOverlaysWebView({overlay: false});
        await StatusBar.setBackgroundColor({color: '#f3ecdf'});
        await StatusBar.setStyle({style: Style.Dark});
      } catch (error) {
        console.warn('Status bar setup unavailable', error);
      }
      try {
        await SplashScreen.hide();
      } catch {
        // The launch screen may already be hidden.
      }
    }

    handles.push(await App.addListener('appStateChange', ({isActive}) => {
      const listeners = isActive ? resumeListeners : pauseListeners;
      for (const listener of listeners) {
        Promise.resolve(listener()).catch(error => console.error('App lifecycle listener failed', error));
      }
    }));

    handles.push(await App.addListener('appRestoredResult', () => {
      for (const listener of resumeListeners) {
        Promise.resolve(listener()).catch(error => console.error('App restore listener failed', error));
      }
    }));

    handles.push(await App.addListener('backButton', ({canGoBack}) => {
      for (const listener of backListeners) {
        if (listener({canGoBack}) === true) return;
      }
      if (canGoBack) window.history.back();
      else App.exitApp().catch(() => {});
    }));
  }

  async function destroy() {
    await Promise.all(handles.splice(0).map(handle => handle?.remove?.()));
  }

  async function readNativeFile(path) {
    try {
      const result = await Filesystem.readFile({
        path,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      return String(result.data);
    } catch {
      return null;
    }
  }

  async function readProgress() {
    if (!native) {
      const primary = safeJsonParse(localStorage.getItem(WEB_PROGRESS_KEY), null);
      if (primary) return primary;
      return safeJsonParse(localStorage.getItem(WEB_PROGRESS_BACKUP_KEY), null);
    }
    const primary = safeJsonParse(await readNativeFile(PROGRESS_PATH), null);
    if (primary) return primary;
    return safeJsonParse(await readNativeFile(PROGRESS_BACKUP_PATH), null);
  }

  async function writeProgress(value) {
    const serialized = JSON.stringify(value);
    if (!native) {
      const current = localStorage.getItem(WEB_PROGRESS_KEY);
      if (safeJsonParse(current, null)) localStorage.setItem(WEB_PROGRESS_BACKUP_KEY, current);
      localStorage.setItem(WEB_PROGRESS_KEY, serialized);
      return;
    }

    await Filesystem.mkdir({
      path: 'toxic-teddies',
      directory: Directory.Data,
      recursive: true,
    }).catch(() => {});

    const current = await readNativeFile(PROGRESS_PATH);
    if (safeJsonParse(current, null)) {
      await Filesystem.writeFile({
        path: PROGRESS_BACKUP_PATH,
        data: current,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    }

    await Filesystem.writeFile({
      path: PROGRESS_PATH,
      data: serialized,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      recursive: true,
    });
  }

  async function getAppInfo() {
    if (native) {
      try {
        const info = await App.getInfo();
        return {
          name: info.name,
          id: info.id,
          version: info.version,
          build: String(info.build),
          platform: Capacitor.getPlatform(),
        };
      } catch (error) {
        console.warn('Native app info unavailable', error);
      }
    }
    return {
      name: 'Toxic Teddies',
      id: 'com.cogtech.toxicteddies',
      version: buildInfo.appVersion,
      build: String(buildInfo.iosBuildNumber),
      platform: Capacitor.getPlatform(),
    };
  }

  async function loadSetting(key) {
    const result = await Preferences.get({key});
    return result.value;
  }

  async function saveSetting(key, value) {
    await Preferences.set({key, value: String(value)});
  }

  async function hapticValid() {
    if (!native) return;
    await Haptics.impact({style: ImpactStyle.Light}).catch(() => {});
  }

  async function hapticBlocked() {
    if (!native) return;
    await Haptics.notification({type: NotificationType.Warning}).catch(() => {});
  }

  async function hapticComplete() {
    if (!native) return;
    await Haptics.notification({type: NotificationType.Success}).catch(() => {});
  }

  async function shareResult({title, text}) {
    if (!native && navigator.share) {
      await navigator.share({title, text}).catch(() => {});
      return;
    }
    if (!native) return;
    await Share.share({title, text, dialogTitle: 'Share Toxic Teddies result'}).catch(() => {});
  }

  return Object.freeze({
    native,
    platform: Capacitor.getPlatform(),
    initialize,
    destroy,
    getAppInfo,
    disableLegacyBrowserCaches,
    readProgress,
    writeProgress,
    loadSetting,
    saveSetting,
    hapticValid,
    hapticBlocked,
    hapticComplete,
    shareResult,
    onPause(listener) {
      pauseListeners.add(listener);
      return () => pauseListeners.delete(listener);
    },
    onResume(listener) {
      resumeListeners.add(listener);
      return () => resumeListeners.delete(listener);
    },
    onBack(listener) {
      backListeners.add(listener);
      return () => backListeners.delete(listener);
    },
  });
}
