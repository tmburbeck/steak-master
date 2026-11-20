import type { CookConfig, CookPlan } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export async function getCookingPlan(config: CookConfig): Promise<CookPlan> {
  const response = await fetch(`${API_BASE}/api/cooking/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cut: config.cut,
      thicknessInches: config.thicknessInches,
      doneness: config.doneness,
      method: config.method
    })
  });
  if (!response.ok) throw new Error(`Cooking API returned ${response.status}`);
  const data = await response.json();
  return {
    firstSideSeconds: data.firstSideSeconds,
    secondSideSeconds: data.secondSideSeconds,
    restSeconds: data.restSeconds,
    note: data.note
  };
}
