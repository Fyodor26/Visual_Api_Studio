import { X } from "lucide-react";
import { useApiStore } from "@/lib/api-store";
import { MethodBadge } from "./MethodBadge";

export function TabBar() {
  const openTabs = useApiStore((s) => s.openTabs);
  const requests = useApiStore((s) => s.requests);
  const activeId = useApiStore((s) => s.activeRequestId);
  const selectRequest = useApiStore((s) => s.selectRequest);
  const closeTab = useApiStore((s) => s.closeTab);

  return (
    <div className="flex items-stretch overflow-x-auto bg-muted/30 border-b border-border">
      {openTabs.map((id) => {
        const r = requests.find((x) => x.id === id);
        if (!r) return null;
        const active = activeId === id;
        return (
          <div
            key={id}
            onClick={() => selectRequest(id)}
            className={
              "group flex items-center gap-2 pl-3 pr-2 py-2 border-r border-border cursor-pointer text-xs min-w-[140px] max-w-[200px] " +
              (active ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background/60")
            }
          >
            <MethodBadge method={r.method} className="w-10 shrink-0" />
            <span className="truncate flex-1">{r.name || "Untitled"}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(id);
              }}
              className="h-4 w-4 grid place-items-center rounded hover:bg-muted opacity-60 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}