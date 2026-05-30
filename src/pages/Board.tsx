import { useMemo, useState } from "react";
import { PlayCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { FiltersBar, type Filters } from "@/components/tracker/FiltersBar";
import { ReviewMode } from "@/components/tracker/ReviewMode";
import { StatCards } from "@/components/tracker/StatCards";
import { TaskModal } from "@/components/tracker/TaskModal";
import { TaskTable } from "@/components/tracker/TaskTable";
import { Button } from "@/components/ui/button";
import { endOfWeek, formatWeekRange, isOverdue, isoDate, startOfWeek } from "@/lib/tracker/date";
import { useMembers, useTasks } from "@/lib/tracker/store";
import type { Task } from "@/lib/tracker/types";

export default function BoardPage() {
  const tasks = useTasks();
  const members = useMembers();
  const [filters, setFilters] = useState<Filters>({ quick: "all", owner: "all" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const founderId = members.find((m) => m.isFounder)?.id;
  const weekStart = isoDate(startOfWeek());
  const weekEndIso = isoDate(endOfWeek());

  const weekTasks = useMemo(
    () => tasks.filter((t) => t.weekOf >= weekStart && t.weekOf <= weekEndIso),
    [tasks, weekStart, weekEndIso],
  );

  const filtered = useMemo(() => {
    return weekTasks.filter((t) => {
      if (filters.quick === "blocked" && t.status !== "blocked") return false;
      if (filters.quick === "high" && t.priority !== "high") return false;
      if (filters.quick === "mine" && t.owner !== founderId) return false;
      if (filters.owner !== "all" && t.owner !== filters.owner) return false;
      return true;
    });
  }, [weekTasks, filters, founderId]);

  const stats = useMemo(
    () => ({
      total: weekTasks.length,
      done: weekTasks.filter((t) => t.status === "done").length,
      blocked: weekTasks.filter((t) => t.status === "blocked").length,
      overdue: weekTasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
    }),
    [weekTasks],
  );

  const progress = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-10 glow-ring"
      >
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.6), transparent 70%)",
            filter: "blur(30px)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, oklch(0.55 0.25 285 / 0.6), transparent 70%)",
            filter: "blur(30px)",
          }}
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora-3 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora-3" />
              </span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Live week of
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="mt-3 font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl"
            >
              <span className="text-aurora">{formatWeekRange()}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 max-w-lg text-sm text-muted-foreground md:text-base"
            >
              One owner per task. Specific blockers. Earned priority.
              <span className="text-foreground/80"> Ship the week.</span>
            </motion.p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewOpen(true)}
                className="glass border-white/10 hover:bg-white/10"
              >
                <PlayCircle className="mr-1.5 h-4 w-4" /> Weekly Review
              </Button>
              <Button
                onClick={openNew}
                className="relative overflow-hidden bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                New task
              </Button>
            </div>

            <div className="flex items-center gap-3 self-end">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Progress
              </div>
              <div className="relative h-12 w-12">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="oklch(1 0 0 / 0.08)"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="url(#progGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 15}
                    initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - progress / 100) }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <defs>
                    <linearGradient id="progGrad" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.85 0.18 165)" />
                      <stop offset="100%" stopColor="oklch(0.78 0.2 200)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold">
                  {progress}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <StatCards {...stats} />
      <FiltersBar filters={filters} onChange={setFilters} members={members} />
      <TaskTable tasks={filtered} members={members} onRowClick={openEdit} />

      <TaskModal open={modalOpen} onOpenChange={setModalOpen} task={editing} members={members} />
      <ReviewMode open={reviewOpen} onOpenChange={setReviewOpen} tasks={tasks} members={members} />
    </div>
  );
}
