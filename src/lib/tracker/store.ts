import { useEffect, useState, useCallback } from "react";
import type { Task, Member } from "./types";
import { startOfWeek, isoDate } from "./date";

const TASKS_KEY = "fwpt:tasks:v1";
const MEMBERS_KEY = "fwpt:members:v1";
const CARRY_KEY = "fwpt:lastCarry:v1";

const MEMBER_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
];

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultMembers(): Member[] {
  return [
    { id: uuid(), name: "You (Founder)", color: MEMBER_COLORS[0], isFounder: true },
    { id: uuid(), name: "Rahul", color: MEMBER_COLORS[1] },
    { id: uuid(), name: "Priya", color: MEMBER_COLORS[2] },
  ];
}

// Subscriber pattern so multiple components stay in sync
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getTasks(): Task[] {
  return read<Task[]>(TASKS_KEY, []);
}
export function getMembers(): Member[] {
  const m = read<Member[] | null>(MEMBERS_KEY, null);
  if (!m || m.length === 0) {
    const d = defaultMembers();
    write(MEMBERS_KEY, d);
    return d;
  }
  return m;
}

export function saveTasks(tasks: Task[]) {
  write(TASKS_KEY, tasks);
  notify();
}
export function saveMembers(members: Member[]) {
  write(MEMBERS_KEY, members);
  notify();
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());
  useEffect(() => {
    const sync = () => setTasks(getTasks());
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return tasks;
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(() => getMembers());
  useEffect(() => {
    const sync = () => setMembers(getMembers());
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return members;
}

export function upsertTask(t: Partial<Task> & { task: string }): Task {
  const now = new Date().toISOString();
  const tasks = getTasks();
  if (t.id) {
    const idx = tasks.findIndex((x) => x.id === t.id);
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...t, updatedAt: now } as Task;
      saveTasks(tasks);
      return tasks[idx];
    }
  }
  const newTask: Task = {
    id: uuid(),
    task: t.task,
    area: t.area ?? "Other",
    owner: t.owner ?? "",
    dueDate: t.dueDate ?? "",
    priority: t.priority ?? "mid",
    status: t.status ?? "not-started",
    blocker: t.blocker ?? "",
    tags: t.tags ?? [],
    weekOf: t.weekOf ?? isoDate(startOfWeek()),
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function deleteTask(id: string) {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

export function addMember(name: string): Member {
  const members = getMembers();
  const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
  const m: Member = { id: uuid(), name, color };
  saveMembers([...members, m]);
  return m;
}
export function removeMember(id: string) {
  saveMembers(getMembers().filter((m) => m.id !== id));
}
export function updateMember(id: string, patch: Partial<Member>) {
  saveMembers(getMembers().map((m) => (m.id === id ? { ...m, ...patch } : m)));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * On app load, carry over incomplete tasks from past weeks into the current week.
 * Runs at most once per day.
 */
export function carryOverIfNeeded() {
  if (typeof window === "undefined") return;
  const currentWeek = isoDate(startOfWeek());
  const last = read<string | null>(CARRY_KEY, null);
  const todayKey = new Date().toISOString().slice(0, 10);
  if (last === todayKey) return;

  const tasks = getTasks();
  const carried: Task[] = [];
  for (const t of tasks) {
    if (t.status === "done") continue;
    if (t.weekOf >= currentWeek) continue;
    // Avoid duplicate carryover: skip if same task name already in current week
    const exists = tasks.some(
      (x) => x.weekOf === currentWeek && x.task === t.task && x.owner === t.owner,
    );
    if (exists) continue;
    const now = new Date().toISOString();
    carried.push({
      ...t,
      id: uuid(),
      weekOf: currentWeek,
      status: "not-started",
      tags: Array.from(new Set([...(t.tags ?? []), "Carried over"])),
      createdAt: now,
      updatedAt: now,
    });
  }
  if (carried.length) {
    saveTasks([...tasks, ...carried]);
  }
  write(CARRY_KEY, todayKey);
}

export { uuid };
