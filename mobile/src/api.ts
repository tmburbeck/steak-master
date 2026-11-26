// Talks to the ASP.NET Core backend (see backend/SteakMaster.Api).

import type { CookConfig, CookPlan } from './types';

// Set VITE_API_BASE_URL in mobile/.env to point at a different server.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

/**
 * Asks the backend for a cooking plan.
 * Throws if the server is unreachable or returns an error, so the caller
 * can fall back to the built-in estimate in cooking.ts.
 */
export async function getCookingPlan(config: CookConfig): Promise<CookPlan> {
  const response = await fetch(`${API_BASE}/api/cooking/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Cooking API returned ${response.status}`);
  }

  const data: CookPlan = await response.json();
  return {
    firstSideSeconds: data.firstSideSeconds,
    secondSideSeconds: data.secondSideSeconds,
    restSeconds: data.restSeconds,
    note: data.note,
  };
}
