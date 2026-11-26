import { SteakArt } from './SteakArt';

/** The arcade-style title screen shown when the app first opens. */
export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="intro-screen">
      <p className="intro-eyebrow">★ A BETTER STEAK STARTS HERE ★</p>

      <SteakArt withSteam />

      <h1 className="intro-title">
        STEAK
        <br />
        MASTER
      </h1>
      <p className="intro-subtitle">THE PERFECT FLIP AWAITS.</p>

      <button type="button" className="intro-start" onClick={onStart}>
        PRESS START
      </button>

      <p className="intro-footer">INSERT STEAK TO CONTINUE</p>
    </section>
  );
}
