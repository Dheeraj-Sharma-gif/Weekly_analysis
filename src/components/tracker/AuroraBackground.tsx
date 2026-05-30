export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="orb orb-1"
        style={{
          top: "-10%",
          left: "10%",
          width: "520px",
          height: "520px",
          background: "radial-gradient(circle, oklch(0.55 0.25 285 / 0.55), transparent 70%)",
        }}
      />
      <div
        className="orb orb-2"
        style={{
          top: "30%",
          right: "-8%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, oklch(0.78 0.2 200 / 0.4), transparent 70%)",
        }}
      />
      <div
        className="orb orb-3"
        style={{
          bottom: "-15%",
          left: "30%",
          width: "640px",
          height: "640px",
          background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.32), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, oklch(0.14 0.025 270 / 0.4) 100%)",
        }}
      />
    </div>
  );
}
