import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { OwnerChip } from "@/components/tracker/OwnerChip";
import { PriorityBadge } from "@/components/tracker/PriorityBadge";
import { StatusBadge } from "@/components/tracker/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isOverdue, isoDate, startOfWeek } from "@/lib/tracker/date";
import { upsertTask } from "@/lib/tracker/store";
import { STATUSES, STATUS_LABEL, type Member, type Status, type Task } from "@/lib/tracker/types";

function buildQueue(tasks: Task[]): Task[] {
  const weekStart = isoDate(startOfWeek());
  const inWeek = tasks.filter((task) => task.weekOf >= weekStart || task.status !== "done");
  const blocked = inWeek.filter((task) => task.status === "blocked");
  const overdue = inWeek.filter(
    (task) => task.status !== "blocked" && isOverdue(task.dueDate, task.status),
  );
  const highNotStarted = inWeek.filter(
    (task) =>
      task.priority === "high" &&
      task.status === "not-started" &&
      !blocked.includes(task) &&
      !overdue.includes(task),
  );
  const rest = inWeek.filter(
    (task) =>
      task.status !== "done" &&
      !blocked.includes(task) &&
      !overdue.includes(task) &&
      !highNotStarted.includes(task),
  );

  return [...blocked, ...overdue, ...highNotStarted, ...rest];
}

export function ReviewMode({
  open,
  onOpenChange,
  tasks,
  members,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  tasks: Task[];
  members: Member[];
}) {
  const queue = useMemo(() => buildQueue(tasks), [tasks]);
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const [idx, setIdx] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [stillBlocked, setStillBlocked] = useState(0);

  const reset = () => {
    setIdx(0);
    setDoneCount(0);
    setStillBlocked(0);
  };

  const current = queue[idx];
  const isFinished = idx >= queue.length;

  const handleStatus = (status: Status) => {
    if (!current) return;

    upsertTask({ ...current, status });

    if (status === "done") setDoneCount((count) => count + 1);
    if (status === "blocked") setStillBlocked((count) => count + 1);

    setIdx((value) => value + 1);
  };

  const handleOwner = (ownerId: string) => {
    if (!current) return;
    upsertTask({ ...current, owner: ownerId });
  };

  const handleBlocker = (text: string) => {
    if (!current) return;
    upsertTask({ ...current, blocker: text });
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  if (queue.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">All clear</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Nothing pending. Add some priorities for this week.
          </p>
          <Button onClick={close}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (isFinished) {
    const carried = queue.length - doneCount - stillBlocked;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl">Review complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <SummaryRow label="Done" value={doneCount} tone="text-status-done" />
            <SummaryRow label="Still blocked" value={stillBlocked} tone="text-status-blocked" />
            <SummaryRow
              label="Carried over"
              value={Math.max(carried, 0)}
              tone="text-muted-foreground"
            />
          </div>
          <Button onClick={close}>Done</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const owner = memberMap.get(current.owner);
  const sectionLabel =
    current.status === "blocked"
      ? "Blocked"
      : isOverdue(current.dueDate, current.status)
        ? "Overdue"
        : current.priority === "high" && current.status === "not-started"
          ? "High priority - not started"
          : "Other";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {sectionLabel} | {idx + 1} of {queue.length}
            </span>
            <PriorityBadge priority={current.priority} />
          </div>
          <DialogTitle className="font-serif text-2xl leading-tight">{current.task}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <OwnerChip member={owner} />
            <StatusBadge status={current.status} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reassign owner
            </label>
            <Select value={current.owner} onValueChange={handleOwner}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Blocker / note
            </label>
            <Textarea
              defaultValue={current.blocker}
              onBlur={(event) => handleBlocker(event.target.value)}
              placeholder="Clear it, or name the person and deadline"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Update status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <Button
                  key={status}
                  variant={current.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatus(status)}
                >
                  {status === "done" && <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                  {STATUS_LABEL[status]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <Button variant="ghost" onClick={close}>
            Exit review
          </Button>
          <Button variant="outline" onClick={() => setIdx((value) => value + 1)}>
            Skip <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-baseline justify-between border-b pb-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-serif text-3xl ${tone}`}>{value}</span>
    </div>
  );
}
