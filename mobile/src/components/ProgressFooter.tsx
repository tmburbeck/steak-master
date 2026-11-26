import type { Stage } from '../types';

/** The stages shown as progress dots, in order. */
const PROGRESS_STAGES: Stage[] = ['first-side', 'flip', 'second-side', 'temperature', 'rest'];

/** Bottom bar during a cook: a "start over" button and a row of progress dots. */
export function ProgressFooter({ stage, onStartOver }: { stage: Stage; onStartOver: () => void }) {
  return (
    <footer className="footer">
      <button className="text-button" onClick={onStartOver}>
        START OVER
      </button>
      <span className="stage-dots">
        {PROGRESS_STAGES.map(step => (
          <i key={step} className={step === stage ? 'active' : ''} />
        ))}
      </span>
    </footer>
  );
}
