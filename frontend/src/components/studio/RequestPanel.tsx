import { useMemo, useState } from "react";
import { Send, Loader2, Share2, Check } from "lucide-react";
import type { ApiRequest, HttpMethod } from "@/lib/api-types";
import { useApiStore, methodColor } from "@/lib/api-store";
import { runRequest } from "@/lib/runner";
import { createCloudShare } from "@/lib/share"; // Import database handler
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KVEditor } from "./KVEditor";
import { CodeEditor } from "./CodeEditor";
import { toast } from "sonner";
import { useAuthStore } from "C:/Users/nakul/OneDrive/Desktop/visual api studio/project-genesis/src/lib/auth-store.ts";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export function RequestPanel({ request }: { request: ApiRequest }) {
  const updateRequest = useApiStore((s) => s.updateRequest);
  const pushResponse = useApiStore((s) => s.pushResponse);
  const env = useApiStore((s) =>
    s.environments.find((e) => e.id === s.activeEnvId) ?? null,
  );
  const [running, setRunning] = useState(false);
  const [sharing, setSharing] = useState(false); // New state variable tracking async backend roundtrips
  const [copied, setCopied] = useState(false);

  const tabCounts = useMemo(
    () => ({
      params: request.params.filter((p) => p.enabled && p.key).length,
      headers: request.headers.filter((h) => h.enabled && h.key).length,
      body: request.bodyType !== "none" && request.body ? 1 : 0,
    }),
    [request],
  );

  const run = async () => {
    setRunning(true);
    try {
      const rec = await runRequest(request, env);
      pushResponse(rec);
      if (rec.error) toast.error("Request failed", { description: rec.error });
      else toast.success(`${rec.status} ${rec.statusText}`, { description: `${rec.durationMs} ms` });
    } finally {
      setRunning(false);
    }
  };

  const share = async () => {
    setSharing(true);
    try {
      // Create shortened document token reference on MongoDB instead of massive Base64 token strings
      const shareId = await createCloudShare(request);
      const url = `${window.location.origin}/s/${shareId}`;
      
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Share link copied", { description: url });
    } catch (error) {
      toast.error("Failed to generate share link", { 
        description: "Verify your standalone backend application server status is live." 
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <Input
          value={request.name}
          onChange={(e) => updateRequest(request.id, { name: e.target.value })}
          className="h-7 bg-transparent border-0 px-0 text-sm font-semibold focus-visible:ring-0"
          placeholder="Untitled request"
        />
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <Select
          value={request.method}
          onValueChange={(v) => updateRequest(request.id, { method: v as HttpMethod })}
        >
          <SelectTrigger
            className="h-10 w-28 mono font-bold text-xs"
            style={{ color: methodColor(request.method) }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHODS.map((m) => (
              <SelectItem key={m} value={m} className="mono font-bold text-xs" style={{ color: methodColor(m) }}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={request.url}
          onChange={(e) => updateRequest(request.id, { url: e.target.value })}
          placeholder="https://api.example.com/v1/users  •  use {{var}}"
          className="h-10 mono text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
          }}
        />
        <Button
          onClick={run}
          disabled={running || !request.url}
          className="h-10 px-5 font-semibold"
        >
          {running ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send
        </Button>
        <Button 
          variant="outline" 
          onClick={share} 
          className="h-10 w-10 p-0 flex items-center justify-center" 
          disabled={sharing}
          title="Copy shareable link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : sharing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 self-start bg-muted/40">
          <TabsTrigger value="params" className="text-xs">
            Params{tabCounts.params ? ` · ${tabCounts.params}` : ""}
          </TabsTrigger>
          <TabsTrigger value="headers" className="text-xs">
            Headers{tabCounts.headers ? ` · ${tabCounts.headers}` : ""}
          </TabsTrigger>
          <TabsTrigger value="body" className="text-xs">
            Body{tabCounts.body ? " ●" : ""}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto px-4 py-3">
          <TabsContent value="params" className="m-0">
            <KVEditor
              rows={request.params}
              onChange={(rows) => updateRequest(request.id, { params: rows })}
              keyPlaceholder="param"
              valuePlaceholder="value"
            />
          </TabsContent>
          <TabsContent value="headers" className="m-0">
            <KVEditor
              rows={request.headers}
              onChange={(rows) => updateRequest(request.id, { headers: rows })}
              keyPlaceholder="Header-Name"
              valuePlaceholder="value"
            />
          </TabsContent>
          <TabsContent value="body" className="m-0 space-y-2">
            <div className="flex items-center gap-2">
              {(["none", "json", "text"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={request.bodyType === t ? "default" : "ghost"}
                  className="h-7 text-xs"
                  onClick={() => updateRequest(request.id, { bodyType: t })}
                >
                  {t}
                </Button>
              ))}
              {request.bodyType === "json" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    try {
                      const pretty = JSON.stringify(JSON.parse(request.body || "{}"), null, 2);
                      updateRequest(request.id, { body: pretty });
                    } catch {
                      toast.error("Invalid JSON");
                    }
                  }}
                >
                  Beautify
                </Button>
              )}
            </div>
            {request.bodyType !== "none" ? (
              <CodeEditor
                value={request.body}
                onChange={(v) => updateRequest(request.id, { body: v })}
                language={request.bodyType === "json" ? "json" : "text"}
              />
            ) : (
              <p className="text-xs text-muted-foreground italic">This request has no body.</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}