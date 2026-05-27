import { useMemo } from "react";
import { useApiStore, statusColor } from "@/lib/api-store";
import { formatBytes, formatDuration, tryFormatJSON } from "@/lib/runner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeEditor } from "./CodeEditor";
import { Sparkles } from "lucide-react";

export function ResponsePanel({ requestId }: { requestId: string }) {
  const latest = useApiStore((s) =>
    s.history.find((h) => h.requestId === requestId) ?? null,
  );

  const prettyBody = useMemo(() => {
    if (!latest) return "";
    if (latest.contentType.includes("json")) return tryFormatJSON(latest.body);
    return latest.body;
  }, [latest]);

  if (!latest) {
    return (
      <div className="h-full grid place-items-center text-muted-foreground text-xs px-6">
        <div className="text-center max-w-xs">
          <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary/60" />
          <p>Hit <kbd className="mono px-1.5 py-0.5 rounded bg-muted text-foreground">Send</kbd> to fire your first request. Responses, timing, and size will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="mono font-bold"
            style={{ color: statusColor(latest.status) }}
          >
            {latest.status || "ERR"}
          </span>
          <span className="text-muted-foreground">{latest.statusText || latest.error}</span>
        </div>
        <Stat label="Time" value={formatDuration(latest.durationMs)} />
        <Stat label="Size" value={formatBytes(latest.sizeBytes)} />
        <span className="ml-auto text-muted-foreground mono text-[10px]">
          {new Date(latest.ranAt).toLocaleTimeString()}
        </span>
      </div>

      <Tabs defaultValue="body" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 self-start bg-muted/40">
          <TabsTrigger value="body" className="text-xs">Body</TabsTrigger>
          <TabsTrigger value="headers" className="text-xs">
            Headers · {Object.keys(latest.headers).length}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto px-4 py-3">
          <TabsContent value="body" className="m-0">
            {latest.error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs mono text-destructive">
                {latest.error}
              </div>
            ) : (
              <CodeEditor
                value={prettyBody || "(empty body)"}
                readOnly
                language={latest.contentType.includes("json") ? "json" : "text"}
                minHeight="220px"
                maxHeight="100%"
              />
            )}
          </TabsContent>
          <TabsContent value="headers" className="m-0">
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-xs mono">
                <tbody>
                  {Object.entries(latest.headers).map(([k, v]) => (
                    <tr key={k} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 w-1/3 text-muted-foreground align-top">{k}</td>
                      <td className="px-3 py-1.5 break-all">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="mono font-medium">{value}</span>
    </div>
  );
}