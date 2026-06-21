"use client";

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

const ZONES = [
  { from: 0, to: 40, color: "#00d68f" },
  { from: 40, to: 70, color: "#ffb020" },
  { from: 70, to: 100, color: "#ff4d6a" },
];

function valueToAngle(value: number) {
  return -90 + (value / 100) * 180;
}

export function RiskGauge({ score, level }: { score: number; level: string }) {
  const cx = 100;
  const cy = 100;
  const r = 78;
  const clamped = Math.max(0, Math.min(100, score));
  const needleTip = polarToCartesian(cx, cy, r - 14, valueToAngle(clamped));

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 115" width="100%" style={{ maxWidth: 220 }}>
        {ZONES.map((zone) => (
          <path
            key={zone.color}
            d={describeArc(cx, cy, r, valueToAngle(zone.from), valueToAngle(zone.to))}
            stroke={zone.color}
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#e8edf5" strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill="#e8edf5" />
      </svg>
      <div className="text-center -mt-2">
        <p className="text-2xl font-mono-data font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {clamped}
        </p>
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Risk Score · {level}
        </p>
      </div>
    </div>
  );
}