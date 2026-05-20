import { createFileRoute } from "@tanstack/react-router";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Toaster } from "@/components/ui/sonner";
import { useApiStore } from "@/lib/api-store";
import { Sidebar } from "@/components/studio/Sidebar";
import { TabBar } from "@/components/studio/TabBar";
import { RequestPanel } from "@/components/studio/RequestPanel";
import { ResponsePanel } from "@/components/studio/ResponsePanel";
import { HistoryPanel } from "@/components/studio/HistoryPanel";
import { EnvironmentBar } from "@/components/studio/EnvironmentBar";
import { Button } from "@/components/ui/button";
import { Plus, Github } from "lucide-react";

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

      <header className="h-12 border-b border-border flex items-center pl-4 pr-3 gap-3 bg-card/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center">
            <span className="text-[10px] font-bold text-primary-foreground">⌘</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Visual API Studio</span>
          <span className="text-[10px] mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            preview
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <EnvironmentBar />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={14} maxSize={32}>
            <Sidebar />
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-primary/60 transition-colors" />
          <Panel defaultSize={58} minSize={30}>
            <div className="h-full flex flex-col bg-background">
              <TabBar />
              {request ? (
                <PanelGroup direction="vertical">
                  <Panel defaultSize={48} minSize={24}>
                    <RequestPanel request={request} />
                  </Panel>
                  <PanelResizeHandle className="h-px bg-border hover:bg-primary/60 transition-colors" />
                  <Panel defaultSize={52} minSize={20}>
                    <ResponsePanel requestId={request.id} />
                  </Panel>
                </PanelGroup>
              ) : (
                <EmptyState onNew={() => newRequest(null)} />
              )}
            </div>
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-primary/60 transition-colors" />
          <Panel defaultSize={22} minSize={16} maxSize={36}>
            <HistoryPanel />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex-1 grid place-items-center">
      <div className="text-center max-w-sm space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Start <span className="text-primary">building</span> requests.
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a new request, save it into collections, and share runs with a single link.
        </p>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4 mr-2" /> New request
        </Button>
      </div>
    </div>
  );
}
