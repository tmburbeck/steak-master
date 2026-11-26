// Cooking math: how long to cook, and whether a temperature reading is safe.
//
// The time estimate below is a rough rule of thumb, not a guarantee.
// It is deliberately kept in sync with the backend's CookingPlanCalculator
// so the app gives the same answer when it can't reach the API.

import type { CookConfig, CookPlan, Doneness, TemperatureUnit } from './types';

/** A 1.25" medium steak in cast iron takes roughly 3.5 minutes total. */
const BASE_SECONDS = 210;
const BASE_THICKNESS_INCHES = 1.25;

/** Never suggest less than 2 minutes of total cook time. */
const MINIMUM_TOTAL_SECONDS = 120;

/** The first side gets slightly more time than the second (52% / 48%). */
const FIRST_SIDE_SHARE = 0.52;

/** USDA recommends at least 3 minutes of rest; we suggest 5. */
const REST_SECONDS = 300;
export const USDA_MINIMUM_REST_SECONDS = 180;

/** USDA minimum safe internal temperature for whole cuts of beef. */
export const USDA_MINIMUM_TEMP_F = 145;
export const USDA_MINIMUM_TEMP_C = 63;

/** Rarer steaks need less time; more well-done steaks need more. */
const DONENESS_MULTIPLIER: Record<Doneness, number> = {
  'Rare': 0.78,
  'Medium Rare': 0.92,
  'Medium': 1.0,
  'Medium Well': 1.12,
  'Well Done': 1.28,
};

/**
 * Builds an offline cooking plan from the user's choices.
 * Used as a fallback when the backend API is unavailable.
 */
export function createPlan(config: CookConfig): CookPlan {
  // Thicker steaks take proportionally longer.
  const thicknessMultiplier = config.thicknessInches / BASE_THICKNESS_INCHES;

  // A grill runs a little hotter than a pan.
  const methodMultiplier = config.method === 'Grill' ? 0.95 : 1.0;

  // Filet mignon is lean and cooks a bit faster.
  const cutMultiplier = config.cut.toLowerCase() === 'filet mignon' ? 0.95 : 1.0;

  const estimatedSeconds =
    BASE_SECONDS * thicknessMultiplier * methodMultiplier * DONENESS_MULTIPLIER[config.doneness] * cutMultiplier;

  const totalSeconds = Math.max(MINIMUM_TOTAL_SECONDS, Math.round(estimatedSeconds));
  const firstSideSeconds = Math.round(totalSeconds * FIRST_SIDE_SHARE);

  return {
    firstSideSeconds,
    secondSideSeconds: totalSeconds - firstSideSeconds,
    restSeconds: REST_SECONDS,
    note: 'Estimate only. Check internal temperature with an instant-read thermometer.',
  };
}

/**
 * Turns the raw text from the thermometer input into a number,
 * or returns null if it isn't a usable, positive reading yet.
 */
export function parseTemperature(input: string): number | null {
  if (input.trim() === '') return null;
  const value = Number(input);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Checks a reading (in the user's chosen unit) against the USDA minimum. */
export function meetsUsdaMinimum(reading: number, unit: TemperatureUnit): boolean {
  const fahrenheit = unit === 'F' ? reading : (reading * 9) / 5 + 32;
  return fahrenheit >= USDA_MINIMUM_TEMP_F;
}

/** Formats a number of seconds as a "MM:SS" countdown. */
export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const remainder = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}
