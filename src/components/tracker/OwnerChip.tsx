import { initials } from "@/lib/tracker/store";
import type { Member } from "@/lib/tracker/types";
import { cn } from "@/lib/utils";

export function OwnerChip({
  member,
  className,
  showName = true,
}: {
  member?: Member;
  className?: string;
  showName?: boolean;
}) {
  if (!member) {
    return <span className="text-xs text-muted-foreground">Unassigned</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
        style={{ backgroundColor: member.color }}
      >
        {initials(member.name)}
      </span>
      {showName && <span className="text-sm">{member.name}</span>}
    </span>
  );
}
