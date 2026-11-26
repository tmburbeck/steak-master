// The lists of choices shown on the setup and settings screens,
// and the starting values for a new cook.

import type { CookConfig, Doneness, Method } from './types';

export const STEAK_CUTS = [
  'Ribeye',
  'New York Strip',
  'Filet Mignon',
  'Sirloin',
  'T-Bone',
  'Porterhouse',
  'Flat Iron',
  'Skirt Steak',
  'Flank Steak',
];

export const DONENESS_LEVELS: Doneness[] = ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'];

export const COOKING_METHODS: Method[] = ['Cast iron', 'Grill'];

/** Limits for the thickness slider on the setup screen, in inches. */
export const THICKNESS_SLIDER = { min: 0.75, max: 2.5, step: 0.25 };

/** What the setup screen shows the first time someone opens the app. */
export const DEFAULT_CONFIG: CookConfig = {
  cut: 'Ribeye',
  thicknessInches: 1.5,
  doneness: 'Medium Rare',
  method: 'Cast iron',
};

/** Type guard: is this arbitrary value one of our doneness levels? */
export function isDoneness(value: unknown): value is Doneness {
  return DONENESS_LEVELS.includes(value as Doneness);
}
