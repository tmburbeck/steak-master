import { formatTime } from '../cooking';
import { SteakArt } from './SteakArt';

interface TimerScreenProps {
  stage: 'first-side' | 'second-side' | 'rest';
  secondsRemaining: number;
  onAddThirtySeconds: () => void;
}

/** Text that changes depending on which timer is running. */
const SCREEN_TEXT = {
  'first-side': { eyebrow: 'ON THE HEAT', title: 'First side', instruction: 'Let the heat do its thing.' },
  'second-side': { eyebrow: 'ON THE HEAT', title: 'Second side', instruction: 'Let the heat do its thing.' },
  'rest': { eyebrow: 'THE FINAL STAGE', title: 'Let it rest', instruction: 'Give it a few minutes.' },
};

/** The big countdown shown while a side is cooking or the steak is resting. */
export function TimerScreen({ stage, secondsRemaining, onAddThirtySeconds }: TimerScreenProps) {
  const text = SCREEN_TEXT[stage];

  return (
    <section className="screen timer-screen">
      <p className="eyebrow">{text.eyebrow}</p>
      <h1>{text.title}</h1>
      <div className="timer">{formatTime(secondsRemaining)}</div>
      <SteakArt withSteam compact />
      <p className="instruction">{text.instruction}</p>
      <button className="text-button" onClick={onAddThirtySeconds}>
        +30 SEC
      </button>
    </section>
  );
}
