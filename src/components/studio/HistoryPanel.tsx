import { useState } from "react";
import { GitCompare, History, Trash2, X } from "lucide-react";
import { useApiStore, statusColor } from "@/lib/api-store";
import type { ResponseRecord } from "@/lib/api-types";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/runner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DiffView } from "./DiffView";
import { MethodBadge } from "./MethodBadge";

export function HistoryPanel() {
  const history = useApiStore((s) => s.history);
  const clearHistory = useApiStore((s) => s.clearHistory);
  const [selected, setSelected] = useState<string[]>([]);
  const [diffOpen, setDiffOpen] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length === 2) return [prev[1], id];
      return [...prev, id];
    });

  const a = history.find((h) => h.id === selected[0]);
  const b = history.find((h) => h.id === selected[1]);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">History</h3>
        <span className="text-[10px] text-muted-foreground">{history.length}</span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant={selected.length === 2 ? "default" : "ghost"}
            disabled={selected.length !== 2}
            onClick={() => setDiffOpen(true)}
            className="h-7 text-xs"
          >
            <GitCompare className="h-3.5 w-3.5 mr-1" /> Diff
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => {
              if (history.length && confirm("Clear all history?")) {
                clearHistory();
                setSelected([]);
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 && (
          <p className="text-xs text-muted-foreground italic px-4 py-6">
            No runs yet. Select two runs to compare responses.
          </p>
        )}
        {history.map((h) => (
          <HistoryRow
            key={h.id}
            rec={h}
            selected={selected.includes(h.id)}
            selectIndex={selected.indexOf(h.id)}
            onToggle={() => toggle(h.id)}
          />
        ))}
      </div>

      <Dialog open={diffOpen} onOpenChange={setDiffOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" /> Response diff
            </DialogTitle>
          </DialogHeader>
          {a && b && <DiffView a={a} b={b} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HistoryRow({
  rec,
  selected,
  selectIndex,
  onToggle,
}: {
  rec: ResponseRecord;
  selected: boolean;
  selectIndex: number;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={
        "px-3 py-2 border-b border-border cursor-pointer transition-colors text-xs " +
        (selected ? "bg-primary/10" : "hover:bg-muted/40")
      }
    >
      <div className="flex items-center gap-2">
        <MethodBadge method={rec.requestSnapshot.method} className="w-12" />
        <span
          className="mono font-bold"
          style={{ color: statusColor(rec.status) }}
        >
          {rec.status || "ERR"}
        </span>
        <span className="ml-auto mono text-[10px] text-muted-foreground">
          {formatDuration(rec.durationMs)}
        </span>
        {selected && (
          <span className="text-[10px] mono px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold">
            {selectIndex === 0 ? "A" : "B"}
          </span>
        )}
      </div>
      <div className="truncate text-muted-foreground mono text-[11px] mt-1">
        {rec.requestSnapshot.url}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">
        {new Date(rec.ranAt).toLocaleTimeString()} · {rec.requestSnapshot.name}
      </div>
    </div>
  );
}