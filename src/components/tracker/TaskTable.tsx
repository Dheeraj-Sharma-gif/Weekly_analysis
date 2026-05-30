import { Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Task, Member } from "@/lib/tracker/types";
import { STATUS_BORDER, StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { OwnerChip } from "./OwnerChip";
import { formatDate, isOverdue } from "@/lib/tracker/date";

export function TaskTable({
  tasks,
  members,
  onRowClick,
}: {
  tasks: Task[];
  members: Member[];
  onRowClick: (t: Task) => void;
}) {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass p-16 text-center"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, oklch(0.85 0.18 165 / 0.2), transparent 60%)",
          }}
        />
        <p className="relative font-serif text-3xl text-aurora">No tasks here yet.</p>
        <p className="relative mt-2 text-sm text-muted-foreground">
          Add your first priority for this week.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="overflow-hidden rounded-2xl glass glow-ring"
    >
      <div className="hidden grid-cols-[1fr_180px_120px_90px_140px_1fr] gap-4 border-b border-border/60 bg-white/[0.02] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
        <div>Task</div>
        <div>Owner</div>
        <div>Due</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Blocker / note</div>
      </div>
      <ul>
        <AnimatePresence initial={false}>
          {tasks.map((t, i) => {
            const owner = memberMap.get(t.owner);
            const overdue = isOverdue(t.dueDate, t.status);
            return (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(i * 0.04, 0.4),
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ x: 4 }}
                onClick={() => onRowClick(t)}
                className={cn(
                  "group grid cursor-pointer grid-cols-1 gap-3 border-b border-border/40 border-l-2 px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03] md:grid-cols-[1fr_180px_120px_90px_140px_1fr] md:items-center md:gap-4",
                  STATUS_BORDER[t.status],
                )}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground/95 group-hover:text-aurora transition-colors">
                    {t.task}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t.area}
                    </span>
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-aurora-3/10 px-1.5 py-0.5 text-[10px] text-aurora-3"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <OwnerChip member={owner} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 font-mono text-xs",
                    overdue ? "text-destructive font-semibold" : "text-muted-foreground",
                  )}
                >
                  {overdue && <Flag className="h-3 w-3 fill-destructive" />}
                  {formatDate(t.dueDate)}
                </div>
                <div>
                  <PriorityBadge priority={t.priority} />
                </div>
                <div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="min-w-0 truncate text-sm text-muted-foreground">
                  {t.blocker || <span className="italic opacity-40">—</span>}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}
