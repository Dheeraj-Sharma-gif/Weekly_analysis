import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMember, initials, removeMember, useMembers, useTasks } from "@/lib/tracker/store";
import { toast } from "sonner";

export default function TeamPage() {
  const members = useMembers();
  const tasks = useTasks();
  const [name, setName] = useState("");

  const handleAdd = () => {
    const n = name.trim();
    if (!n) return;
    addMember(n);
    setName("");
    toast.success(`Added ${n}`);
  };

  const handleRemove = (id: string, mname: string) => {
    const open = tasks.filter((t) => t.owner === id && t.status !== "done").length;
    if (open > 0) {
      if (
        !confirm(`${mname} owns ${open} open task(s). Remove anyway? You'll need to reassign them.`)
      )
        return;
    }
    removeMember(id);
    toast.success(`Removed ${mname}`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-1 font-serif text-5xl text-aurora md:text-6xl">Team</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          These names show up in the owner dropdown across the app.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 rounded-2xl glass p-4 glow-ring"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a teammate by name"
          className="bg-white/5 border-white/10"
        />
        <Button
          onClick={handleAdd}
          className="bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add
        </Button>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-2xl glass glow-ring"
      >
        <AnimatePresence initial={false}>
          {members.map((m, i) => {
            const open = tasks.filter((t) => t.owner === m.id && t.status !== "done").length;
            return (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between border-b border-white/5 px-5 py-4 last:border-b-0 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white shadow-lg ring-2 ring-white/10"
                    style={{ backgroundColor: m.color }}
                  >
                    {initials(m.name)}
                  </motion.span>
                  <div>
                    <div className="font-medium">
                      {m.name}
                      {m.isFounder && (
                        <span className="ml-2 rounded-full bg-aurora-3/15 text-aurora-3 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest">
                          Founder
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {open} open task{open === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(m.id, m.name)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
