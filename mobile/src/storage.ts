// Everything the app saves in the browser's localStorage lives here.
//
// Two kinds of data are saved:
//   1. The in-progress cooking session, so a refresh or closed tab mid-cook
//      picks up right where the user left off.
//   2. The user's preferences from the Settings panel.

import { DEFAULT_CONFIG, isDoneness } from './options';
import type { CookConfig, CookPlan, Preferences, Stage } from './types';

const KEYS = {
  session: 'steak-master-session',
  temperatureUnit: 'steak-master-temperature-unit',
  sound: 'steak-master-sound',
  vibration: 'steak-master-vibration',
  defaultDoneness: 'steak-master-default-doneness',
};

/** A snapshot of an in-progress cook. `deadline` is when the current timer ends (ms since epoch). */
export interface SavedSession {
  stage: Stage;
  deadline: number | null;
  config: CookConfig;
  plan: CookPlan;
}

// ---- Cooking session ------------------------------------------------------

export function loadSession(): SavedSession | null {
  try {
    return JSON.parse(localStorage.getItem(KEYS.session) ?? 'null');
  } catch {
    // Corrupt or unreadable data: just start fresh.
    return null;
  }
}

export function saveSession(session: SavedSession): void {
  localStorage.setItem(KEYS.session, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.session);
}

// ---- Preferences ----------------------------------------------------------

/** Reads saved preferences, falling back to sensible defaults for anything missing. */
export function loadPreferences(): Preferences {
  const savedDoneness = localStorage.getItem(KEYS.defaultDoneness);

  return {
    temperatureUnit: localStorage.getItem(KEYS.temperatureUnit) === 'C' ? 'C' : 'F',
    // Alerts are on unless the user has explicitly turned them off.
    soundEnabled: localStorage.getItem(KEYS.sound) !== 'off',
    vibrationEnabled: localStorage.getItem(KEYS.vibration) !== 'off',
    defaultDoneness: isDoneness(savedDoneness) ? savedDoneness : DEFAULT_CONFIG.doneness,
  };
}

export function savePreferences(preferences: Preferences): void {
  localStorage.setItem(KEYS.temperatureUnit, preferences.temperatureUnit);
  localStorage.setItem(KEYS.sound, preferences.soundEnabled ? 'on' : 'off');
  localStorage.setItem(KEYS.vibration, preferences.vibrationEnabled ? 'on' : 'off');
  localStorage.setItem(KEYS.defaultDoneness, preferences.defaultDoneness);
}
