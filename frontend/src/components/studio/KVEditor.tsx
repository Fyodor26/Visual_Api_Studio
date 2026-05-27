import { Plus, Trash2 } from "lucide-react";
import type { KV } from "@/lib/api-types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Props {
  rows: KV[];
  onChange: (rows: KV[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function KVEditor({ rows, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value" }: Props) {
  const update = (id: string, patch: Partial<KV>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const add = () => onChange([...rows, { id: uid(), key: "", value: "", enabled: true }]);

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground italic px-1">No entries yet.</p>
      )}
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-2">
          <Checkbox
            checked={r.enabled}
            onCheckedChange={(v) => update(r.id, { enabled: Boolean(v) })}
          />
          <Input
            className="mono text-xs h-8 flex-1"
            placeholder={keyPlaceholder}
            value={r.key}
            onChange={(e) => update(r.id, { key: e.target.value })}
          />
          <Input
            className="mono text-xs h-8 flex-[2]"
            placeholder={valuePlaceholder}
            value={r.value}
            onChange={(e) => update(r.id, { value: e.target.value })}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(r.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="text-xs h-7">
        <Plus className="h-3 w-3 mr-1" /> Add row
      </Button>
    </div>
  );
}