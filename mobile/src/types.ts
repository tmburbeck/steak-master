// Shared type definitions used across the app.

/** How cooked the user wants the steak. */
export type Doneness = 'Rare' | 'Medium Rare' | 'Medium' | 'Medium Well' | 'Well Done';

/** The heat source the steak is cooked on. */
export type Method = 'Cast iron' | 'Grill';

/** Fahrenheit or Celsius, chosen in Settings. */
export type TemperatureUnit = 'F' | 'C';

/**
 * The app is a simple step-by-step flow. Each "stage" is one screen:
 *
 *   setup -> first-side -> flip -> second-side -> temperature -> rest -> complete
 *
 * Stages ending in "-side" and "rest" are timed; the others wait for the user.
 */
export type Stage = 'setup' | 'first-side' | 'flip' | 'second-side' | 'temperature' | 'rest' | 'complete';

/** What the user picked on the setup screen. */
export interface CookConfig {
  cut: string;
  thicknessInches: number;
  doneness: Doneness;
  method: Method;
}

/** How long each timed stage should last, in seconds. */
export interface CookPlan {
  firstSideSeconds: number;
  secondSideSeconds: number;
  restSeconds: number;
  note: string;
}

/** User preferences that persist between visits (set in the Settings panel). */
export interface Preferences {
  temperatureUnit: TemperatureUnit;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultDoneness: Doneness;
}
