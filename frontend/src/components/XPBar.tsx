interface XPBarProps {
  current: number;
  max: number;
}

export default function XPBar({ current, max }: XPBarProps) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="xp-bar-wrapper">
      <div className="xp-bar-label">
        <span>XP</span>
        <span>{current} / {max}</span>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
