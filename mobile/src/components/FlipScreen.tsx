import { IonButton } from '@ionic/react';
import { SteakArt } from './SteakArt';

/** Shown when the first side is done. Waits for the user to confirm they flipped. */
export function FlipScreen({ onFlipped }: { onFlipped: () => void }) {
  return (
    <section className="screen event-screen">
      <p className="eyebrow">CONTINUE?</p>
      <h1>FLIP.</h1>
      <SteakArt />
      <p className="instruction">Turn the steak over.</p>
      <IonButton expand="block" className="primary-button" onClick={onFlipped}>
        I FLIPPED IT
      </IonButton>
    </section>
  );
}
