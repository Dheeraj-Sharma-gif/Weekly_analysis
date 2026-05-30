import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member } from "@/lib/tracker/types";
import { cn } from "@/lib/utils";

export type FilterKey = "all" | "blocked" | "high" | "mine";

export interface Filters {
  quick: FilterKey;
  owner: string;
}

export function FiltersBar({
  filters,
  onChange,
  members,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  members: Member[];
}) {
  const quick: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "blocked", label: "Blocked" },
    { key: "high", label: "High" },
    { key: "mine", label: "Mine" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex flex-wrap items-center gap-2"
    >
      <div className="relative inline-flex rounded-xl glass p-1">
        {quick.map((q) => {
          const active = filters.quick === q.key;
          return (
            <button
              key={q.key}
              onClick={() => onChange({ ...filters, quick: q.key })}
              className={cn(
                "relative z-10 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 -z-10 rounded-lg bg-primary shadow-glow"
                />
              )}
              {q.label}
            </button>
          );
        })}
      </div>

      <Select value={filters.owner} onValueChange={(v) => onChange({ ...filters, owner: v })}>
        <SelectTrigger className="w-[180px] glass border-white/10">
          <SelectValue placeholder="By Owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All owners</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filters.quick !== "all" || filters.owner !== "all") && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ quick: "all", owner: "all" })}>
          Clear
        </Button>
      )}
    </motion.div>
  );
}
