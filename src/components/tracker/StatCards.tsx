import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertOctagon, Clock, ListTodo } from "lucide-react";

interface StatProps {
  label: string;
  value: number;
  tone?: "default" | "done" | "blocked" | "overdue";
  icon: React.ReactNode;
  accent: string;
  delay: number;
}

const toneStyles = {
  default: "text-foreground",
  done: "text-status-done",
  blocked: "text-status-blocked",
  overdue: "text-destructive",
};

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function StatCard({ label, value, tone = "default", icon, accent, delay }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-50, 50], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-50, 50], [-8, 8]), { stiffness: 200, damping: 20 });
  const count = useCountUp(value);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl glass p-5 glow-ring"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--x,50%) var(--y,50%), ${accent}, transparent 40%)`,
        }}
      />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className={cn("opacity-80", toneStyles[tone])}>{icon}</span>
      </div>
      <div className="relative mt-4 flex items-baseline gap-2">
        <div className={cn("font-serif text-5xl leading-none tracking-tight", toneStyles[tone])}>
          {count}
        </div>
        <div className="h-1 flex-1 rounded-full opacity-30" style={{ background: accent }} />
      </div>
    </motion.div>
  );
}

export function StatCards({
  total,
  done,
  blocked,
  overdue,
}: {
  total: number;
  done: number;
  blocked: number;
  overdue: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="Total"
        value={total}
        icon={<ListTodo className="h-4 w-4" />}
        accent="oklch(0.78 0.2 200 / 0.3)"
        delay={0}
      />
      <StatCard
        label="Done"
        value={done}
        tone="done"
        icon={<CheckCircle2 className="h-4 w-4" />}
        accent="oklch(0.85 0.18 165 / 0.35)"
        delay={0.08}
      />
      <StatCard
        label="Blocked"
        value={blocked}
        tone="blocked"
        icon={<AlertOctagon className="h-4 w-4" />}
        accent="oklch(0.72 0.24 22 / 0.35)"
        delay={0.16}
      />
      <StatCard
        label="Overdue"
        value={overdue}
        tone="overdue"
        icon={<Clock className="h-4 w-4" />}
        accent="oklch(0.65 0.24 22 / 0.35)"
        delay={0.24}
      />
    </div>
  );
}
