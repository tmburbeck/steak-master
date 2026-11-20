import { useEffect, useMemo, useState } from 'react';
import {
  IonApp, IonContent, IonButton, IonSelect, IonSelectOption,
  IonItem, IonLabel, IonRange
} from '@ionic/react';
import type { CookConfig, CookPlan, Doneness, Method, Stage } from './types';
import { createPlan } from './cooking';
import { getCookingPlan } from './api';
import { requestNotificationPermission, scheduleStageNotification } from './notifications';

const DEFAULT_CONFIG: CookConfig = { cut: 'Ribeye', thicknessInches: 1.5, doneness: 'Medium Rare', method: 'Cast iron' };
type SavedSession = { stage: Stage; deadline: number | null; config: CookConfig; plan: CookPlan };

function loadSession(): SavedSession | null {
  try { return JSON.parse(localStorage.getItem('steak-master-session') || 'null'); }
  catch { return null; }
}
function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function playRetroAlert() {
  const AudioContextClass = window.AudioContext;
  const audio = new AudioContextClass();

  const now = audio.currentTime;

  const notes = [
    { frequency: 660, start: 0, duration: 0.12 },
    { frequency: 880, start: 0.16, duration: 0.2 }
  ];

  notes.forEach(note => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = note.frequency;

    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(
      0.08,
      now + note.start + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + note.start + note.duration
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start(now + note.start);
    oscillator.stop(now + note.start + note.duration);
  });

  setTimeout(() => {
    void audio.close();
  }, 1000);
}

function playVibrationAlert() {
  if ('vibrate' in navigator) {
    navigator.vibrate([150, 100, 150]);
  }
}

export default function App() {
  const saved = loadSession();
  
const [config, setConfig] = useState<CookConfig>(() => {
  if (saved?.config) {
    return saved.config;
  }

  const preferredDoneness = localStorage.getItem(
    'steak-master-default-doneness'
  );

  const validDoneness: Doneness[] = [
    'Rare',
    'Medium Rare',
    'Medium',
    'Medium Well',
    'Well Done'
  ];

  return {
    ...DEFAULT_CONFIG,
    doneness: validDoneness.includes(preferredDoneness as Doneness)
      ? (preferredDoneness as Doneness)
      : DEFAULT_CONFIG.doneness
  };
});

  const [plan, setPlan] = useState<CookPlan>(saved?.plan ?? createPlan(DEFAULT_CONFIG));
  const [stage, setStage] = useState<Stage>(saved?.stage ?? 'setup');
  const [deadline, setDeadline] = useState<number | null>(saved?.deadline ?? null);
  const [now, setNow] = useState(Date.now());
  const [temperature, setTemperature] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(true);
  const [tipsOpen, setTipsOpen] = useState(false);


const [temperatureUnit, setTemperatureUnit] = useState<'F' | 'C'>(() => {
  const saved = localStorage.getItem('steak-master-temperature-unit');
  return saved === 'C' ? 'C' : 'F';
});

const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
  const saved = localStorage.getItem('steak-master-sound');
  return saved !== 'off';
});

const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
  const saved = localStorage.getItem('steak-master-vibration');
  return saved !== 'off';
});


const [defaultDoneness, setDefaultDoneness] = useState<Doneness>(() => {
  const savedPreference = localStorage.getItem(
    'steak-master-default-doneness'
  );

  const validOptions: Doneness[] = [
    'Rare',
    'Medium Rare',
    'Medium',
    'Medium Well',
    'Well Done'
  ];

  return validOptions.includes(savedPreference as Doneness)
    ? (savedPreference as Doneness)
    : DEFAULT_CONFIG.doneness;
});



  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    const refresh = () => setNow(Date.now());
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('steak-master-session', JSON.stringify({ stage, deadline, config, plan }));
  }, [stage, deadline, config, plan]);

  const remaining = useMemo(() => deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000)), [deadline, now]);

  

useEffect(() => {
  if (deadline !== null && remaining === 0) {

    // Play sound when the timer finishes
    if (soundEnabled) {
      playRetroAlert();
    }

    // Vibrate when the timer finishes
    if (vibrationEnabled) {
      playVibrationAlert();
    }

    // Move to the next cooking stage
    if (stage === 'first-side') {
      setStage('flip');
    } else if (stage === 'second-side') {
      setStage('temperature');
    } else if (stage === 'rest') {
      setStage('complete');
    }

    setDeadline(null);
  }
}, [deadline, remaining, stage, soundEnabled, vibrationEnabled]);



  function beginTimer(nextStage: Stage, seconds: number) {
    const endsAt = Date.now() + seconds * 1000;
    setStage(nextStage);
    setDeadline(endsAt);
    const title = nextStage === 'first-side' ? 'Time to flip!' : nextStage === 'second-side' ? 'Check your steak' : 'Steak is ready to serve';
    const body = nextStage === 'first-side' ? 'Turn your steak over.' : nextStage === 'second-side' ? 'Check internal temperature with a thermometer.' : 'Your resting timer is complete.';
    void scheduleStageNotification(title, body, endsAt);
  }

  async function start() {
    setBusy(true); setMessage('');
    try {
      const permission = await requestNotificationPermission();
      if (!permission) setMessage('Notifications are off. Keep the app open to hear the timer here.');
      let nextPlan: CookPlan;
      try { nextPlan = await getCookingPlan(config); }
      catch {
        nextPlan = createPlan(config);
        setMessage('Using the built-in estimate. The cooking API is not reachable yet.');
      }
      setPlan(nextPlan);
      beginTimer('first-side', nextPlan.firstSideSeconds);
    } finally { setBusy(false); }
  }
  
function reset() {
  // Start a fresh cooking session with the saved default doneness
  setConfig({
    ...DEFAULT_CONFIG,
    doneness: defaultDoneness
  });

  // Clear the previous cooking session
  setStage('setup');
  setDeadline(null);
  setTemperature('');
  setMessage('');

  // Remove the saved session
  localStorage.removeItem('steak-master-session');
}


  const isTimer = stage === 'first-side' || stage === 'second-side' || stage === 'rest';

  return <IonApp><IonContent fullscreen><main className="app-shell">
    <header className="topbar"><span className="brand">STEAK MASTER</span><span className="pixel-steak" aria-hidden="true">▰</span></header>

{introOpen && stage === 'setup' && (
  <section className="intro-screen">
    <p className="intro-eyebrow">
      ★ A BETTER STEAK STARTS HERE ★
    </p>

    
    <div className="steak-art" aria-hidden="true">
      <div className="steam">〰　〰</div>
      <div className="pan">
        ◢ <span>▰</span> ◣
      </div>
    </div>


    <h1 className="intro-title">
      STEAK<br />MASTER
    </h1>

    <p className="intro-subtitle">
      THE PERFECT FLIP AWAITS.
    </p>

    <button
      type="button"
      className="intro-start"
      onClick={() => setIntroOpen(false)}
    >
      PRESS START
    </button>

    <p className="intro-footer">
      INSERT STEAK TO CONTINUE
    </p>
  </section>
)}


    
{stage === 'setup' && !introOpen && <section className="screen">


        
<div className="settings-header">
  <button
    type="button"
    className="settings-button"
    aria-expanded={tipsOpen}
    onClick={() => {
  setTipsOpen(prev => !prev);
  setSettingsOpen(false);
}}
  >
    🥩 STEAK TIPS
  </button>

  <button
    type="button"
    className="settings-button"
    aria-expanded={settingsOpen}
    onClick={() => {
  setSettingsOpen(prev => !prev);
  setTipsOpen(false);
}}
  >
    ⚙ SETTINGS
  </button>
</div>

{tipsOpen && (
  <div className="settings-panel">
    <div className="settings-panel-header">
      <h2>🥩 STEAK TIPS</h2>

      <button
        type="button"
        className="settings-close"
        onClick={() => setTipsOpen(false)}
      >
        ✕ CLOSE
      </button>
    </div>

    <p className="settings-description">
      FIVE STEPS TO A BETTER STEAK.
    </p>

    <div className="steak-tip">
      <strong>01 — PAT DRY</strong>
      <p>Remove surface moisture with paper towels.</p>
    </div>

    <div className="steak-tip">
      <strong>02 — SEASON</strong>
      <p>Salt generously. Add pepper to taste.</p>
    </div>

    <div className="steak-tip">
      <strong>03 — PREHEAT</strong>
      <p>Heat your pan or grill before adding the steak.</p>
    </div>

    <div className="steak-tip">
      <strong>04 — SEAR</strong>
      <p>Use a little high-heat oil for pan cooking.
        Follow the flip prompts.</p>
    </div>

    <div className="steak-tip">
      <strong>05 — TEMP + REST</strong>
      <p>Check with a thermometer. For whole beef steaks,
        USDA recommends 145°F (63°C) and at least
        3 minutes of rest.</p>
    </div>
  </div>
)}


{settingsOpen && (
  <div className="settings-panel">
    <div className="settings-panel-header">
      <h2>SETTINGS</h2>
      <button
        type="button"
        className="settings-close"
        onClick={() => setSettingsOpen(false)}
      >
        ✕ CLOSE
      </button>
    </div>

    <p className="settings-description">
      MAKE IT YOUR WAY.
    </p>

    
<div className="settings-option">
  <span>TEMPERATURE</span>

  <select
    className="settings-select"
    aria-label="Temperature unit"
    value={temperatureUnit}
    onChange={e => {
      const unit = e.target.value as 'F' | 'C';
      setTemperatureUnit(unit);
      localStorage.setItem('steak-master-temperature-unit', unit);
    }}
  >
    <option value="F">°F Fahrenheit</option>
    <option value="C">°C Celsius</option>
  </select>
</div>


    
<div className="settings-option">
  <span>SOUND ALERTS</span>

  <button
    type="button"
    className="settings-toggle"
    aria-label="Toggle sound alerts"
    aria-pressed={soundEnabled}
    onClick={() => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      localStorage.setItem(
        'steak-master-sound',
        next ? 'on' : 'off'
      );
    }}
  >
    {soundEnabled ? 'ON' : 'OFF'}
  </button>
</div>

<div className="settings-option">
  <span>PREVIEW SOUND</span>

  <button
    type="button"
    className="settings-toggle"
    disabled={!soundEnabled}
    onClick={playRetroAlert}
  >
    ▶ TEST SOUND
  </button>
</div>



    
<div className="settings-option">
  <span>VIBRATION</span>

  <button
    type="button"
    className="settings-toggle"
    aria-label="Toggle vibration alerts"
    aria-pressed={vibrationEnabled}
    onClick={() => {
      const next = !vibrationEnabled;
      setVibrationEnabled(next);
      localStorage.setItem(
        'steak-master-vibration',
        next ? 'on' : 'off'
      );
    }}
  >
 
    {vibrationEnabled ? 'ON' : 'OFF'}
  </button>
</div>

<div className="settings-option">
  <span>DEFAULT DONENESS</span>

  <select
    className="settings-select"
    aria-label="Default doneness"
    value={defaultDoneness}
    onChange={e => {
      const selected = e.target.value as Doneness;

      setDefaultDoneness(selected);

      localStorage.setItem(
        'steak-master-default-doneness',
        selected
      );
    }}
  >
    <option value="Rare">Rare</option>
    <option value="Medium Rare">Medium Rare</option>
    <option value="Medium">Medium</option>
    <option value="Medium Well">Medium Well</option>
    <option value="Well Done">Well Done</option>
  </select>
</div>

</div>
)}



      <p className="eyebrow">WALL STEAK. CASTLE-AGED.</p><h1>Make it<br/>a good one.</h1>
      <div className="steak-art" aria-label="Pixel-art steak in a skillet"><div className="steam">〰　〰</div><div className="pan">◢ <span>▰</span> ◣</div></div>
      <div className="settings">
        
<IonItem lines="none">
  <IonLabel>STEAK CUT</IonLabel>
  <IonSelect
  interface="alert"
  interfaceOptions={{ cssClass: 'steak-select-alert' }}
  value={config.cut}
    onIonChange={e => setConfig({ ...config, cut: e.detail.value })}
  >
    {[
      'Ribeye',
      'New York Strip',
      'Filet Mignon',
      'Sirloin',
      'T-Bone',
      'Porterhouse',
      'Flat Iron',
      'Skirt Steak',
      'Flank Steak'
    ].map(cut => (
      <IonSelectOption key={cut} value={cut}>
        {cut}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>

        <div className="range-row"><label>THICKNESS</label><strong>{config.thicknessInches.toFixed(1)}″</strong></div>
        <IonRange min={0.75} max={2.5} step={0.25} value={config.thicknessInches} onIonChange={e=>setConfig({...config,thicknessInches:Number(e.detail.value)})}/>
        
<IonItem lines="none">
  <IonLabel>DONENESS</IonLabel>
  <IonSelect
    interface="alert"
    interfaceOptions={{ cssClass: 'steak-select-alert' }}
    value={config.doneness}
    onIonChange={e =>
      setConfig({
        ...config,
        doneness: e.detail.value as Doneness
      })
    }
  >
    {([
      'Rare',
      'Medium Rare',
      'Medium',
      'Medium Well',
      'Well Done'
    ] as Doneness[]).map(doneness => (
      <IonSelectOption key={doneness} value={doneness}>
        {doneness}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>

        
<IonItem lines="none">
  <IonLabel>METHOD</IonLabel>
  <IonSelect
    interface="alert"
    interfaceOptions={{ cssClass: 'steak-select-alert' }}
    value={config.method}
    onIonChange={e =>
      setConfig({
        ...config,
        method: e.detail.value as Method
      })
    }
  >
    {(['Cast iron', 'Grill'] as Method[]).map(method => (
      <IonSelectOption key={method} value={method}>
        {method}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>

      </div>
      {message && <p className="status-message">{message}</p>}
      <IonButton expand="block" className="primary-button" disabled={busy} onClick={start}>{busy ? 'PREPARING…' : 'START COOKING →'}</IonButton>
    </section>}

    {isTimer && <section className="screen timer-screen">
      <p className="eyebrow">{stage==='rest'?'THE FINAL STAGE':'ON THE HEAT'}</p>
      <h1>{stage==='first-side'?'First side':stage==='second-side'?'Second side':'Let it rest'}</h1>
      <div className="timer">{formatTime(remaining)}</div>
      <div className="steak-art compact"><div className="steam">〰　〰</div><div className="pan">◢ <span>▰</span> ◣</div></div>
      <p className="instruction">{stage==='rest'?'Give it a few minutes.':'Let the heat do its thing.'}</p>
      <button className="text-button" onClick={()=>setDeadline(Date.now()+(remaining+30)*1000)}>+30 SEC</button>
    </section>}

    
{stage === 'flip' && (
  <section className="screen event-screen">
    <p className="eyebrow">CONTINUE?</p>

    <h1>FLIP.</h1>

    <div className="steak-art">
      <div className="pan">
        ◢ <span>▰</span> ◣
      </div>
    </div>

    <p className="instruction">
      Turn the steak over.
    </p>

    <IonButton
      expand="block"
      className="primary-button"
      onClick={() =>
        beginTimer('second-side', plan.secondSideSeconds)
      }
    >
      I FLIPPED IT
    </IonButton>
  </section>
)}

    

{stage === 'temperature' && (
  <section className="screen">
    <p className="eyebrow">CHECK YOUR STEAK</p>

    <h1>
      Temperature<br />check.
    </h1>

    <p className="instruction">
      Use an instant-read thermometer in the thickest part.
    </p>

    <div className="temp-entry">
      <input
        inputMode="decimal"
        type="number"
        step="0.1"
        placeholder={temperatureUnit === 'F' ? '°F' : '°C'}
        aria-label={`Internal temperature in degrees ${
          temperatureUnit === 'F' ? 'Fahrenheit' : 'Celsius'
        }`}
        value={temperature}
        onChange={e => setTemperature(e.target.value)}
      />

      <span className="temp-unit">
        °{temperatureUnit}
      </span>
    </div>

    {temperature.trim() !== '' &&
      Number.isFinite(Number(temperature)) &&
      Number(temperature) > 0 && (
        <div className="temperature-feedback">
          {(
            temperatureUnit === 'F'
              ? Number(temperature)
              : Number(temperature) * 9 / 5 + 32
          ) >= 145 ? (
            <>
              <strong>✓ MINIMUM TEMPERATURE REACHED</strong>
              <p>
                Your reading meets the USDA minimum temperature
                for whole beef steaks. Rest for at least
                3 minutes before serving.
              </p>
            </>
          ) : (
            <>
              <strong>! BELOW USDA MINIMUM</strong>
              <p>
                Continue cooking and check again.
                USDA recommends 145°F (63°C) followed by
                at least 3 minutes of rest for whole beef steaks.
              </p>
            </>
          )}
        </div>
      )}

    <p className="safety-note">
      Time is only a guide. For food safety, verify
      temperature using current USDA guidance.
      Whole cuts of beef should reach{' '}
      {temperatureUnit === 'F' ? '145°F' : '63°C'}
      {' '}and rest for at least 3 minutes.
    </p>

    <IonButton
      expand="block"
      className="primary-button"
      disabled={
        temperature.trim() === '' ||
        !Number.isFinite(Number(temperature)) ||
        Number(temperature) <= 0 ||
        (
          temperatureUnit === 'F'
            ? Number(temperature)
            : Number(temperature) * 9 / 5 + 32
        ) < 145
      }
      onClick={() => beginTimer('rest', Math.max(plan.restSeconds, 180))}
    >
      START REST
    </IonButton>
  </section>
)}



    {stage==='complete' && <section className="screen event-screen"><p className="eyebrow">SESSION COMPLETE</p><h1>Ready to<br/>eat.</h1><div className="steak-art"><div className="pan">◢ <span>▰</span> ◣</div></div><p className="instruction">Your steak has rested. Time to eat.</p><IonButton expand="block" className="primary-button" onClick={reset}>COOK ANOTHER</IonButton></section>}

    {stage!=='setup' && <footer className="footer"><button className="text-button" onClick={reset}>START OVER</button><span className="stage-dots">{['first-side','flip','second-side','temperature','rest'].map(s=><i key={s} className={stage===s?'active':''}/>)}</span></footer>}
    <p className="fine-print">COOK BY TEMPERATURE. TIME IS A GUIDE.</p>
  </main></IonContent></IonApp>;
}
