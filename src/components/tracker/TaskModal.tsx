import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AREAS, PRIORITY_HELP, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "@/lib/tracker/types";
import type { Task, Priority, Status, Area, Member } from "@/lib/tracker/types";
import { upsertTask, deleteTask } from "@/lib/tracker/store";
import { isoDate, startOfWeek } from "@/lib/tracker/date";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task | null;
  members: Member[];
}

const emptyDraft = (): Partial<Task> => ({
  task: "",
  area: "Other",
  owner: "",
  dueDate: "",
  priority: "mid",
  status: "not-started",
  blocker: "",
  tags: [],
  weekOf: isoDate(startOfWeek()),
});

export function TaskModal({ open, onOpenChange, task, members }: Props) {
  const [draft, setDraft] = useState<Partial<Task>>(emptyDraft());
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (open) {
      if (task) {
        setDraft(task);
        setTagsInput((task.tags ?? []).join(", "));
      } else {
        setDraft(emptyDraft());
        setTagsInput("");
      }
    }
  }, [open, task]);

  const update = <K extends keyof Task>(k: K, v: Task[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = () => {
    if (!draft.task?.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!draft.owner) {
      toast.error("Pick one owner — every task needs exactly one");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    upsertTask({ ...(draft as Task), tags });
    toast.success(task ? "Task updated" : "Task created");
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    toast.success("Task deleted");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {task ? "Edit task" : "New task"}
          </DialogTitle>
          <DialogDescription>
            Every task needs one owner, a due date, and an honest priority.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              value={draft.task ?? ""}
              onChange={(e) => update("task", e.target.value)}
              placeholder="e.g. Close Acme contract"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Area</Label>
              <Select value={draft.area} onValueChange={(v) => update("area", v as Area)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Owner (one person)</Label>
              <Select value={draft.owner || undefined} onValueChange={(v) => update("owner", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign owner" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !draft.dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {draft.dueDate ? format(new Date(draft.dueDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={draft.dueDate ? new Date(draft.dueDate) : undefined}
                    onSelect={(d) => update("dueDate", d ? isoDate(d) : "")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => update("status", v as Status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={draft.priority}
              onValueChange={(v) => update("priority", v as Priority)}
              className="grid grid-cols-1 gap-2"
            >
              {(["high", "mid", "low"] as Priority[]).map((p) => (
                <label
                  key={p}
                  htmlFor={`prio-${p}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    draft.priority === p ? "border-foreground/40 bg-accent/40" : "hover:bg-muted",
                  )}
                >
                  <RadioGroupItem id={`prio-${p}`} value={p} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{PRIORITY_LABEL[p]}</div>
                    <div className="text-xs text-muted-foreground">{PRIORITY_HELP[p]}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blocker">Blocker / note</Label>
            <Textarea
              id="blocker"
              value={draft.blocker ?? ""}
              onChange={(e) => update("blocker", e.target.value)}
              placeholder="e.g. Need NDA from Rahul by Wed"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Be specific — name a person and a deadline.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Comma separated"
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div>
            {task && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save task</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
