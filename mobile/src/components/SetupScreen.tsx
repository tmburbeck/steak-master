import { useState } from 'react';
import { IonButton, IonItem, IonLabel, IonRange, IonSelect, IonSelectOption } from '@ionic/react';
import { COOKING_METHODS, DONENESS_LEVELS, STEAK_CUTS, THICKNESS_SLIDER } from '../options';
import type { CookConfig, Preferences } from '../types';
import { SettingsPanel } from './SettingsPanel';
import { SteakArt } from './SteakArt';
import { SteakTipsPanel } from './SteakTipsPanel';

interface SetupScreenProps {
  config: CookConfig;
  onConfigChange: (config: CookConfig) => void;
  preferences: Preferences;
  onPreferencesChange: (changes: Partial<Preferences>) => void;
  isStarting: boolean;
  statusMessage: string;
  onStart: () => void;
}

/** Only one of the two pop-open panels can be open at a time. */
type OpenPanel = 'tips' | 'settings' | null;

/** Where the user picks their cut, thickness, doneness and cooking method. */
export function SetupScreen(props: SetupScreenProps) {
  const { config, onConfigChange, preferences, onPreferencesChange, isStarting, statusMessage, onStart } = props;
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);

  // Clicking a panel's button opens it, or closes it if it's already open.
  const togglePanel = (panel: OpenPanel) => setOpenPanel(current => (current === panel ? null : panel));
  const closePanel = () => setOpenPanel(null);

  // Updates one field of the config and leaves the rest unchanged.
  const updateConfig = (changes: Partial<CookConfig>) => onConfigChange({ ...config, ...changes });

  return (
    <section className="screen">
      <div className="settings-header">
        <button
          type="button"
          className="settings-button"
          aria-expanded={openPanel === 'tips'}
          onClick={() => togglePanel('tips')}
        >
          🥩 STEAK TIPS
        </button>
        <button
          type="button"
          className="settings-button"
          aria-expanded={openPanel === 'settings'}
          onClick={() => togglePanel('settings')}
        >
          ⚙ SETTINGS
        </button>
      </div>

      {openPanel === 'tips' && <SteakTipsPanel onClose={closePanel} />}
      {openPanel === 'settings' && (
        <SettingsPanel preferences={preferences} onChange={onPreferencesChange} onClose={closePanel} />
      )}

      <p className="eyebrow">WALL STEAK. CASTLE-AGED.</p>
      <h1>
        Make it
        <br />a good one.
      </h1>
      <SteakArt withSteam />

      <div className="settings">
        <Dropdown
          label="STEAK CUT"
          value={config.cut}
          options={STEAK_CUTS}
          onChange={cut => updateConfig({ cut })}
        />

        <div className="range-row">
          <label>THICKNESS</label>
          <strong>{config.thicknessInches.toFixed(1)}″</strong>
        </div>
        <IonRange
          min={THICKNESS_SLIDER.min}
          max={THICKNESS_SLIDER.max}
          step={THICKNESS_SLIDER.step}
          value={config.thicknessInches}
          onIonChange={e => updateConfig({ thicknessInches: Number(e.detail.value) })}
        />

        <Dropdown
          label="DONENESS"
          value={config.doneness}
          options={DONENESS_LEVELS}
          onChange={doneness => updateConfig({ doneness })}
        />

        <Dropdown
          label="METHOD"
          value={config.method}
          options={COOKING_METHODS}
          onChange={method => updateConfig({ method })}
        />
      </div>

      {statusMessage && <p className="status-message">{statusMessage}</p>}

      <IonButton expand="block" className="primary-button" disabled={isStarting} onClick={onStart}>
        {isStarting ? 'PREPARING…' : 'START COOKING →'}
      </IonButton>
    </section>
  );
}

interface DropdownProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

/** A labeled Ionic dropdown, styled to match the retro theme. */
function Dropdown<T extends string>({ label, value, options, onChange }: DropdownProps<T>) {
  return (
    <IonItem lines="none">
      <IonLabel>{label}</IonLabel>
      <IonSelect
        interface="alert"
        interfaceOptions={{ cssClass: 'steak-select-alert' }}
        value={value}
        onIonChange={e => onChange(e.detail.value as T)}
      >
        {options.map(option => (
          <IonSelectOption key={option} value={option}>
            {option}
          </IonSelectOption>
        ))}
      </IonSelect>
    </IonItem>
  );
}
