export function ConfidenceMeter({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 rounded-full overflow-hidden"
        style={{ backgroundColor: "rgba(148, 163, 184, 0.15)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: "var(--color-accent)" }}
        />
      </div>
      <span className="font-mono-data text-xs" style={{ color: "var(--color-text-secondary)" }}>
        {clamped}%
      </span>
    </div>
  );
}