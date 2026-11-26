import { playRetroAlert } from '../alerts';
import { DONENESS_LEVELS } from '../options';
import type { Doneness, Preferences, TemperatureUnit } from '../types';
import { PanelHeader } from './PanelHeader';

interface SettingsPanelProps {
  preferences: Preferences;
  onChange: (changes: Partial<Preferences>) => void;
  onClose: () => void;
}

/** Lets the user choose units, alert types and their usual doneness. Changes save instantly. */
export function SettingsPanel({ preferences, onChange, onClose }: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <PanelHeader title="SETTINGS" onClose={onClose} />
      <p className="settings-description">MAKE IT YOUR WAY.</p>

      <div className="settings-option">
        <span>TEMPERATURE</span>
        <select
          className="settings-select"
          aria-label="Temperature unit"
          value={preferences.temperatureUnit}
          onChange={e => onChange({ temperatureUnit: e.target.value as TemperatureUnit })}
        >
          <option value="F">°F Fahrenheit</option>
          <option value="C">°C Celsius</option>
        </select>
      </div>

      <div className="settings-option">
        <span>SOUND ALERTS</span>
        <OnOffToggle
          label="Toggle sound alerts"
          isOn={preferences.soundEnabled}
          onToggle={() => onChange({ soundEnabled: !preferences.soundEnabled })}
        />
      </div>

      <div className="settings-option">
        <span>PREVIEW SOUND</span>
        <button
          type="button"
          className="settings-toggle"
          disabled={!preferences.soundEnabled}
          onClick={playRetroAlert}
        >
          ▶ TEST SOUND
        </button>
      </div>

      <div className="settings-option">
        <span>VIBRATION</span>
        <OnOffToggle
          label="Toggle vibration alerts"
          isOn={preferences.vibrationEnabled}
          onToggle={() => onChange({ vibrationEnabled: !preferences.vibrationEnabled })}
        />
      </div>

      <div className="settings-option">
        <span>DEFAULT DONENESS</span>
        <select
          className="settings-select"
          aria-label="Default doneness"
          value={preferences.defaultDoneness}
          onChange={e => onChange({ defaultDoneness: e.target.value as Doneness })}
        >
          {DONENESS_LEVELS.map(level => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** A small ON/OFF button. `aria-pressed` tells screen readers whether it is on. */
function OnOffToggle({ label, isOn, onToggle }: { label: string; isOn: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="settings-toggle" aria-label={label} aria-pressed={isOn} onClick={onToggle}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
