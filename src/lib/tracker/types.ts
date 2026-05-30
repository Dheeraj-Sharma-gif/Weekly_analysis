export type Priority = "high" | "mid" | "low";
export type Status = "not-started" | "in-progress" | "in-review" | "blocked" | "done";

export const AREAS = [
  "Sales",
  "Product",
  "Marketing",
  "Ops",
  "Legal",
  "Finance",
  "HR",
  "Other",
] as const;
export type Area = (typeof AREAS)[number];

export interface Task {
  id: string;
  task: string;
  area: Area;
  owner: string; // member id
  dueDate: string; // ISO
  priority: Priority;
  status: Status;
  blocker: string;
  tags: string[];
  weekOf: string; // ISO date of Monday
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  color: string; // hex/oklch
  isFounder?: boolean;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  mid: "Mid",
  low: "Low",
};

export const PRIORITY_HELP: Record<Priority, string> = {
  high: "External party waiting or revenue at risk",
  mid: "Internal deadline this week",
  low: "No dependency",
};

export const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  "in-review": "In Review",
  blocked: "Blocked",
  done: "Done",
};

export const STATUSES: Status[] = ["not-started", "in-progress", "in-review", "blocked", "done"];
