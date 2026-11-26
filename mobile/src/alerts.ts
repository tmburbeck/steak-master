// In-app alerts that fire when a timer finishes: a retro beep and a phone buzz.
// (System notifications for when the app is in the background live in notifications.ts.)

/** The two-note "level up" chirp: each note's pitch (Hz), start offset and length (seconds). */
const ALERT_NOTES = [
  { frequency: 660, start: 0, duration: 0.12 },
  { frequency: 880, start: 0.16, duration: 0.2 },
];

const ALERT_VOLUME = 0.08;

/** Plays a short 8-bit style beep using the Web Audio API (no audio files needed). */
export function playRetroAlert(): void {
  const audio = new AudioContext();
  const now = audio.currentTime;

  for (const note of ALERT_NOTES) {
    // A square wave is what gives old game consoles their "chiptune" sound.
    const oscillator = audio.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = note.frequency;

    // Quickly fade the note in and out so it doesn't click.
    const gain = audio.createGain();
    const noteStart = now + note.start;
    const noteEnd = noteStart + note.duration;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(ALERT_VOLUME, noteStart + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd);
  }

  // Release the audio hardware once the sound has finished.
  setTimeout(() => void audio.close(), 1000);
}

/** Buzz-pause-buzz, on devices that support vibration (most Android phones). */
export function playVibrationAlert(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([150, 100, 150]);
  }
}
