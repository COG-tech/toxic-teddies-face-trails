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
      backgroundColor: '#f3ecdf',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f3ecdf',
      overlaysWebView: false,
    },
  },
};

export default config;
