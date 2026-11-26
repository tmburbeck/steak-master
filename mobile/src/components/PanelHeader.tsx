/** Title row with a close button, shared by the Tips and Settings panels. */
export function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="settings-panel-header">
      <h2>{title}</h2>
      <button type="button" className="settings-close" onClick={onClose}>
        ✕ CLOSE
      </button>
    </div>
  );
}
