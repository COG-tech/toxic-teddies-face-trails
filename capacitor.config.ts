import type { CapacitorConfig } from '@capacitor/cli';

// Production builds load the local Vite bundle from dist; no remote server URL is used.
const config: CapacitorConfig = {
  appId: 'com.cogtech.toxicteddies',
  appName: 'Toxic Teddies',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 900,
      backgroundColor: '#0F0C08',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0F0C08',
      overlaysWebView: false,
    },
  },
};

export default config;
