import { useState } from 'react';
import { loadPreferences, savePreferences } from '../storage';
import type { Preferences } from '../types';

/**
 * The user's Settings-panel preferences, loaded from and saved to localStorage.
 *
 * Usage:
 *   const [preferences, updatePreferences] = usePreferences();
 *   updatePreferences({ soundEnabled: false });   // change just one field
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);

  function updatePreferences(changes: Partial<Preferences>) {
    const updated = { ...preferences, ...changes };
    setPreferences(updated);
    savePreferences(updated);
  }

  return [preferences, updatePreferences] as const;
}
