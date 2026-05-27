import { createFileRoute } from "@tanstack/react-router";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Toaster } from "@/components/ui/sonner";
import { useApiStore } from "@/lib/api-store";
import { Sidebar } from "@/components/studio/Sidebar";
import { TabBar } from "@/components/studio/TabBar";
import { RequestPanel } from "@/components/studio/RequestPanel";
import { ResponsePanel } from "@/components/studio/ResponsePanel";
import { HistoryPanel } from "@/components/studio/HistoryPanel";
import { EnvironmentBar } from "@/components/studio/EnvironmentBar";
import { Button } from "@/components/ui/button";
import { Plus, Code2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visual API Studio — REST testing, reimagined" },
      {
        name: "description",
        content:
          "Browser-based REST API studio. Build, run, diff and share requests with environments and collections.",
      },
    ],
  }),
  component: Studio,
});

function Studio() {
  const activeId = useApiStore((s) => s.activeRequestId);
  const request = useApiStore((s) => s.requests.find((r) => r.id === activeId) ?? null);
  const newRequest = useApiStore((s) => s.newRequest);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground">
      <Toaster theme="dark" position="bottom-right" richColors />

      <header className="h-14 border-b border-border/60 flex items-center pl-4 pr-3 gap-3 bg-card/40 backdrop-blur-xl relative z-10">
        <div className="absolute inset-0 pointer-events-none opacity-60 mesh-bg" />
        <div className="relative flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg grid place-items-center text-primary-foreground font-bold shadow-[0_0_24px_-6px_oklch(0.66_0.22_275/0.7)]"
               style={{ backgroundImage: "var(--gradient-primary)" }}>
            <span className="text-sm">⌘</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight display">
              Visual <span className="gradient-text">API</span> Studio
            </span>
            <span className="text-[10px] mono text-muted-foreground mt-0.5 tracking-wider uppercase">
              REST · diff · share
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <EnvironmentBar />
          <div className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground">
            <Code2 className="h-4 w-4" />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <PanelGroup orientation="horizontal" className="h-full flex">
          <Panel defaultSize="20%" minSize="14%" maxSize="32%">
            <Sidebar />
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-primary/60 transition-colors" />
          <Panel defaultSize="58%" minSize="30%">
            <div className="h-full flex flex-col bg-background">
              <TabBar />
              {request ? (
                <PanelGroup orientation="vertical" className="flex-1 flex flex-col min-h-0">
                  <Panel defaultSize="48%" minSize="24%">
                    <RequestPanel request={request} />
                  </Panel>
                  <PanelResizeHandle className="h-px bg-border hover:bg-primary/60 transition-colors" />
                  <Panel defaultSize="52%" minSize="20%">
                    <ResponsePanel requestId={request.id} />
                  </Panel>
                </PanelGroup>
              ) : (
                <EmptyState onNew={() => newRequest(null)} />
              )}
            </div>
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-primary/60 transition-colors" />
          <Panel defaultSize="22%" minSize="16%" maxSize="36%">
            <HistoryPanel />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex-1 grid place-items-center relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute inset-0 mesh-bg opacity-70" />
      <div className="relative text-center max-w-md space-y-5 px-6">
        <div className="mx-auto h-14 w-14 rounded-2xl grid place-items-center shadow-[0_0_60px_-10px_oklch(0.66_0.22_275/0.8)]"
             style={{ backgroundImage: "var(--gradient-primary)" }}>
          <Code2 className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight display">
            Ship requests <span className="gradient-text">at the speed of thought.</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Build, run, diff and share REST calls — collections persist locally, share links travel via URL, environments inject {"{{variables}}"} live.
          </p>
        </div>
        <Button onClick={onNew} size="lg" className="h-11 px-6 font-semibold shadow-[0_10px_40px_-10px_oklch(0.66_0.22_275/0.6)]"
                style={{ backgroundImage: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4 mr-2" /> New request
        </Button>
        <div className="pt-2 flex items-center justify-center gap-4 text-[11px] mono text-muted-foreground/70 uppercase tracking-wider">
          <span>⌘ + Enter to send</span>
          <span className="opacity-40">·</span>
          <span>Multi-tab</span>
          <span className="opacity-40">·</span>
          <span>Response diff</span>
        </div>
      </div>
    </div>
  );
}
