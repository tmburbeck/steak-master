import { useState } from 'react';
import { IonButton } from '@ionic/react';
import { meetsUsdaMinimum, parseTemperature, USDA_MINIMUM_TEMP_C, USDA_MINIMUM_TEMP_F } from '../cooking';
import type { TemperatureUnit } from '../types';

interface TemperatureScreenProps {
  unit: TemperatureUnit;
  onStartRest: () => void;
}

/**
 * Food-safety checkpoint after both sides are cooked.
 * The user types in a thermometer reading, and can only move on to
 * resting once it reaches the USDA minimum for whole cuts of beef.
 */
export function TemperatureScreen({ unit, onStartRest }: TemperatureScreenProps) {
  const [input, setInput] = useState('');

  const reading = parseTemperature(input);
  const isSafe = reading !== null && meetsUsdaMinimum(reading, unit);
  const minimumTemp = unit === 'F' ? `${USDA_MINIMUM_TEMP_F}°F` : `${USDA_MINIMUM_TEMP_C}°C`;

  return (
    <section className="screen">
      <p className="eyebrow">CHECK YOUR STEAK</p>
      <h1>
        Temperature
        <br />
        check.
      </h1>
      <p className="instruction">Use an instant-read thermometer in the thickest part.</p>

      <div className="temp-entry">
        <input
          inputMode="decimal"
          type="number"
          step="0.1"
          placeholder={`°${unit}`}
          aria-label={`Internal temperature in degrees ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}`}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <span className="temp-unit">°{unit}</span>
      </div>

      {/* Feedback only appears once the user has typed a valid number. */}
      {reading !== null && (
        <div className="temperature-feedback">
          {isSafe ? (
            <>
              <strong>✓ MINIMUM TEMPERATURE REACHED</strong>
              <p>
                Your reading meets the USDA minimum temperature for whole beef steaks. Rest for at least 3 minutes
                before serving.
              </p>
            </>
          ) : (
            <>
              <strong>! BELOW USDA MINIMUM</strong>
              <p>
                Continue cooking and check again. USDA recommends 145°F (63°C) followed by at least 3 minutes of rest
                for whole beef steaks.
              </p>
            </>
          )}
        </div>
      )}

      <p className="safety-note">
        Time is only a guide. For food safety, verify temperature using current USDA guidance. Whole cuts of beef
        should reach {minimumTemp} and rest for at least 3 minutes.
      </p>

      <IonButton expand="block" className="primary-button" disabled={!isSafe} onClick={onStartRest}>
        START REST
      </IonButton>
    </section>
  );
}
