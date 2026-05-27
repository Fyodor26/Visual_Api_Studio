import { useState } from "react";
import { Globe, Plus, Settings2 } from "lucide-react";
import { useApiStore } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { KVEditor } from "./KVEditor";

export function EnvironmentBar() {
  const environments = useApiStore((s) => s.environments);
  const activeEnvId = useApiStore((s) => s.activeEnvId);
  const setActiveEnv = useApiStore((s) => s.setActiveEnv);
  const newEnvironment = useApiStore((s) => s.newEnvironment);
  const updateEnvironment = useApiStore((s) => s.updateEnvironment);
  const deleteEnvironment = useApiStore((s) => s.deleteEnvironment);
  const [open, setOpen] = useState(false);

  const env = environments.find((e) => e.id === activeEnvId) ?? null;

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <Select value={activeEnvId ?? ""} onValueChange={(v) => setActiveEnv(v || null)}>
        <SelectTrigger className="h-8 w-44 text-xs">
          <SelectValue placeholder="No environment" />
        </SelectTrigger>
        <SelectContent>
          {environments.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage environments">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Environments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {environments.map((e) => (
                <Button
                  key={e.id}
                  variant={e.id === activeEnvId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveEnv(e.id)}
                  className="text-xs"
                >
                  {e.name}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const name = prompt("Environment name", "Staging");
                  if (name) newEnvironment(name);
                }}
              >
                <Plus className="h-3 w-3 mr-1" /> New
              </Button>
            </div>

            {env && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={env.name}
                    onChange={(e) => updateEnvironment(env.id, { name: e.target.value })}
                    className="h-8 max-w-xs text-sm font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm("Delete environment?")) deleteEnvironment(env.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
                <div className="rounded-md border border-border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2">
                    Use <code className="mono text-primary">{`{{varName}}`}</code> in URLs, headers, params, or body.
                  </p>
                  <KVEditor
                    rows={env.variables}
                    onChange={(rows) => updateEnvironment(env.id, { variables: rows })}
                    keyPlaceholder="variable"
                    valuePlaceholder="value"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}