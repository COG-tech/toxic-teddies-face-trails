import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cogtech.toxicteddies',
  appName: 'Toxic Teddies: Arrow Escape',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#f3ecdf',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#f3ecdf',
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
    ScreenOrientation: {
      orientation: 'portrait',
    },
  },
};

export default config;
