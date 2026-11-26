// The top-level component. Its only job is to decide which screen to show.
//
// The actual logic lives elsewhere:
//   - hooks/useCookingSession.ts  the step-by-step cooking flow and timers
//   - hooks/usePreferences.ts     the user's saved settings
//   - components/                 one file per screen

import { useState } from 'react';
import { IonApp, IonContent } from '@ionic/react';
import { CompleteScreen } from './components/CompleteScreen';
import { FlipScreen } from './components/FlipScreen';
import { IntroScreen } from './components/IntroScreen';
import { ProgressFooter } from './components/ProgressFooter';
import { SetupScreen } from './components/SetupScreen';
import { TemperatureScreen } from './components/TemperatureScreen';
import { TimerScreen } from './components/TimerScreen';
import { isTimedStage, useCookingSession } from './hooks/useCookingSession';
import { usePreferences } from './hooks/usePreferences';

export default function App() {
  const [preferences, updatePreferences] = usePreferences();
  const session = useCookingSession(preferences);
  const { stage } = session;

  // The "PRESS START" title screen appears once each time the app is opened.
  const [showIntro, setShowIntro] = useState(true);

  return (
    <IonApp>
      <IonContent fullscreen>
        <main className="app-shell">
          <header className="topbar">
            <span className="brand">STEAK MASTER</span>
            <span className="pixel-steak" aria-hidden="true">▰</span>
          </header>

          {stage === 'setup' && showIntro && <IntroScreen onStart={() => setShowIntro(false)} />}

          {stage === 'setup' && !showIntro && (
            <SetupScreen
              config={session.config}
              onConfigChange={session.setConfig}
              preferences={preferences}
              onPreferencesChange={updatePreferences}
              isStarting={session.isStarting}
              statusMessage={session.statusMessage}
              onStart={session.startCooking}
            />
          )}

          {isTimedStage(stage) && (
            <TimerScreen
              stage={stage}
              secondsRemaining={session.secondsRemaining}
              onAddThirtySeconds={session.addThirtySeconds}
            />
          )}

          {stage === 'flip' && <FlipScreen onFlipped={session.confirmFlip} />}

          {stage === 'temperature' && (
            <TemperatureScreen unit={preferences.temperatureUnit} onStartRest={session.startRest} />
          )}

          {stage === 'complete' && <CompleteScreen onCookAnother={session.reset} />}

          {stage !== 'setup' && <ProgressFooter stage={stage} onStartOver={session.reset} />}

          <p className="fine-print">COOK BY TEMPERATURE. TIME IS A GUIDE.</p>
        </main>
      </IonContent>
    </IonApp>
  );
}
