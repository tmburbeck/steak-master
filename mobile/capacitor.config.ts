import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor wraps the built web app (the "dist" folder) as a native iOS/Android app.
const config: CapacitorConfig = {
  appId: 'com.steakmaster.app',
  appName: 'Steak Master',
  webDir: 'dist',
  bundledWebRuntime: false,
};

export default config;
