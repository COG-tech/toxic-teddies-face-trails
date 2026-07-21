import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

const PROGRESS_PATH = 'toxic-teddies/save-state-v1.json';
const WEB_PROGRESS_KEY = 'toxic-teddies:native-save-v1';

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function createNativeBridge() {
  const native = Capacitor.isNativePlatform();
  const pauseListeners = new Set();
  const resumeListeners = new Set();
  let appListenerHandle = null;

  async function initialize() {
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

    appListenerHandle = await App.addListener('appStateChange', ({isActive}) => {
      const listeners = isActive ? resumeListeners : pauseListeners;
      for (const listener of listeners) {
        Promise.resolve(listener()).catch(error => console.error('App lifecycle listener failed', error));
      }
    });
  }

  async function destroy() {
    await appListenerHandle?.remove?.();
    appListenerHandle = null;
  }

  async function readProgress() {
    if (!native) {
      return safeJsonParse(localStorage.getItem(WEB_PROGRESS_KEY), null);
    }
    try {
      const result = await Filesystem.readFile({
        path: PROGRESS_PATH,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      return safeJsonParse(String(result.data), null);
    } catch {
      return null;
    }
  }

  async function writeProgress(value) {
    const serialized = JSON.stringify(value);
    if (!native) {
      localStorage.setItem(WEB_PROGRESS_KEY, serialized);
      return;
    }
    await Filesystem.mkdir({
      path: 'toxic-teddies',
      directory: Directory.Data,
      recursive: true,
    }).catch(() => {});
    await Filesystem.writeFile({
      path: PROGRESS_PATH,
      data: serialized,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      recursive: true,
    });
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
  });
}
