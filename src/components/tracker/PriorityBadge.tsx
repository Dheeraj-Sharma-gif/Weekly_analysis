import type { Priority } from "@/lib/tracker/types";
import { PRIORITY_LABEL } from "@/lib/tracker/types";
import { cn } from "@/lib/utils";

const styles: Record<Priority, string> = {
  high: "bg-prio-high-bg text-prio-high ring-1 ring-prio-high/20",
  mid: "bg-prio-mid-bg text-prio-mid ring-1 ring-prio-mid/20",
  low: "bg-prio-low-bg text-prio-low ring-1 ring-prio-low/15",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        styles[priority],
        className,
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
