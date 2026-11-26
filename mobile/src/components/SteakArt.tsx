interface SteakArtProps {
  /** Show the wavy steam lines above the pan. */
  withSteam?: boolean;
  /** Use the shorter version (for the timer screen). */
  compact?: boolean;
}

/** The text-based "pixel art" steak sitting in a skillet, reused on several screens. */
export function SteakArt({ withSteam = false, compact = false }: SteakArtProps) {
  return (
    <div className={compact ? 'steak-art compact' : 'steak-art'} aria-hidden="true">
      {withSteam && <div className="steam">〰　〰</div>}
      <div className="pan">
        ◢ <span>▰</span> ◣
      </div>
    </div>
  );
}
