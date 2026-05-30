import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { TaskModal } from "@/components/tracker/TaskModal";
import { TaskTable } from "@/components/tracker/TaskTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfWeek, isoDate, startOfWeek } from "@/lib/tracker/date";
import { useMembers, useTasks } from "@/lib/tracker/store";
import { AREAS, type Task } from "@/lib/tracker/types";

function getPastWeekStarts(tasks: Task[]): string[] {
  const currentWeek = isoDate(startOfWeek());
  const set = new Set<string>();

  for (const task of tasks) {
    if (task.weekOf < currentWeek) set.add(task.weekOf);
  }

  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

function weekLabel(iso: string): string {
  const date = new Date(iso);
  const end = endOfWeek(date);
  const format = (value: Date) =>
    value.toLocaleDateString(undefined, { day: "numeric", month: "short" });

  return `${format(date)} - ${format(end)}`;
}

export default function ArchivePage() {
  const tasks = useTasks();
  const members = useMembers();
  const weekStart = isoDate(startOfWeek());

  const archived = useMemo(
    () => tasks.filter((task) => task.weekOf < weekStart && task.status === "done"),
    [tasks, weekStart],
  );

  const weeks = useMemo(() => getPastWeekStarts(archived), [archived]);
  const [week, setWeek] = useState<string>("all");
  const [owner, setOwner] = useState<string>("all");
  const [area, setArea] = useState<string>("all");
  const [editing, setEditing] = useState<Task | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = archived.filter((task) => {
    if (week !== "all" && task.weekOf !== week) return false;
    if (owner !== "all" && task.owner !== owner) return false;
    if (area !== "all" && task.area !== area) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          History
        </p>
        <h1 className="mt-1 font-serif text-5xl text-aurora md:text-6xl">Archive</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Tasks marked Done in past weeks. Unfinished work auto-carries to this week.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <Select value={week} onValueChange={setWeek}>
          <SelectTrigger className="w-[200px] glass border-white/10">
            <SelectValue placeholder="Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All weeks</SelectItem>
            {weeks.map((value) => (
              <SelectItem key={value} value={value}>
                {weekLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="w-[180px] glass border-white/10">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-[160px] glass border-white/10">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {AREAS.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <TaskTable
        tasks={filtered}
        members={members}
        onRowClick={(task) => {
          setEditing(task);
          setOpen(true);
        }}
      />

      <TaskModal open={open} onOpenChange={setOpen} task={editing} members={members} />
    </div>
  );
}
