import type { CookConfig, CookPlan } from './types';

// MVP estimates only. Real-world cooking varies; thermometer readings take priority.
export function createPlan(config: CookConfig): CookPlan {
  const thicknessFactor = config.thicknessInches / 1.25;
  const methodFactor = config.method === 'Grill' ? 0.95 : 1;
  const donenessFactor: Record<CookConfig['doneness'], number> = {
    'Rare': 0.78, 'Medium Rare': 0.92, 'Medium': 1,
    'Medium Well': 1.12, 'Well Done': 1.28
  };
  const cutFactor = config.cut === 'Filet mignon' ? 0.95 : 1;
  const base = 210 * thicknessFactor * methodFactor * donenessFactor[config.doneness] * cutFactor;
  const total = Math.max(120, Math.round(base));
  const first = Math.round(total * 0.52);
  return {
    firstSideSeconds: first,
    secondSideSeconds: total - first,
    restSeconds: 300,
    note: 'Estimate only. Check internal temperature with an instant-read thermometer.'
  };
}
