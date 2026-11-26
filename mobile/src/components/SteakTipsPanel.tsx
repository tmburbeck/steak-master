import { PanelHeader } from './PanelHeader';

const TIPS = [
  { title: '01 — PAT DRY', text: 'Remove surface moisture with paper towels.' },
  { title: '02 — SEASON', text: 'Salt generously. Add pepper to taste.' },
  { title: '03 — PREHEAT', text: 'Heat your pan or grill before adding the steak.' },
  { title: '04 — SEAR', text: 'Use a little high-heat oil for pan cooking. Follow the flip prompts.' },
  {
    title: '05 — TEMP + REST',
    text: 'Check with a thermometer. For whole beef steaks, USDA recommends 145°F (63°C) and at least 3 minutes of rest.',
  },
];

/** A pop-open panel with five quick steak-cooking tips. */
export function SteakTipsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="settings-panel">
      <PanelHeader title="🥩 STEAK TIPS" onClose={onClose} />
      <p className="settings-description">FIVE STEPS TO A BETTER STEAK.</p>

      {TIPS.map(tip => (
        <div key={tip.title} className="steak-tip">
          <strong>{tip.title}</strong>
          <p>{tip.text}</p>
        </div>
      ))}
    </div>
  );
}
