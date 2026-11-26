import { IonButton } from '@ionic/react';
import { SteakArt } from './SteakArt';

/** The final "you're done" screen. */
export function CompleteScreen({ onCookAnother }: { onCookAnother: () => void }) {
  return (
    <section className="screen event-screen">
      <p className="eyebrow">SESSION COMPLETE</p>
      <h1>
        Ready to
        <br />
        eat.
      </h1>
      <SteakArt />
      <p className="instruction">Your steak has rested. Time to eat.</p>
      <IonButton expand="block" className="primary-button" onClick={onCookAnother}>
        COOK ANOTHER
      </IonButton>
    </section>
  );
}
