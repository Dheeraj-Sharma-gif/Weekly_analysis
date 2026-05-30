import type { Status } from "@/lib/tracker/types";
import { STATUS_LABEL } from "@/lib/tracker/types";
import { cn } from "@/lib/utils";

const styles: Record<Status, string> = {
  done: "bg-status-done-bg text-status-done",
  "in-progress": "bg-status-progress-bg text-status-progress",
  blocked: "bg-status-blocked-bg text-status-blocked",
  "in-review": "bg-status-review-bg text-status-review",
  "not-started": "bg-status-idle-bg text-status-idle",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export const STATUS_BORDER: Record<Status, string> = {
  done: "border-l-status-done",
  "in-progress": "border-l-status-progress",
  blocked: "border-l-status-blocked",
  "in-review": "border-l-status-review",
  "not-started": "border-l-status-idle",
};
