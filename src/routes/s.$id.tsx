import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { decodeShare } from "@/lib/share";
import { useApiStore } from "@/lib/api-store";
import { MethodBadge } from "@/components/studio/MethodBadge";
import { CodeEditor } from "@/components/studio/CodeEditor";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/s/$id")({
  head: () => ({
    meta: [
      { title: "Shared request · Visual API Studio" },
      { name: "description", content: "Open a shared API request in Visual API Studio." },
    ],
  }),
  component: SharedView,
});

function SharedView() {
  const { id } = Route.useParams();
  const decoded = useMemo(() => decodeShare(id), [id]);
  const importRequest = useApiStore((s) => s.importRequest);
  const navigate = useNavigate();

  if (!decoded) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground p-8">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-semibold">Broken share link</h1>
          <p className="text-sm text-muted-foreground">This URL doesn't decode to a valid request.</p>
          <Link to="/" className="text-primary underline text-sm">Back to studio</Link>
        </div>
      </div>
    );
  }

  const r = decoded.request;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-12 border-b border-border flex items-center px-4 gap-3 bg-card/60">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Studio
        </Link>
        <span className="ml-auto text-[10px] mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          shared
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Shared request</p>
          <h1 className="text-2xl font-semibold tracking-tight">{r.name || "Untitled"}</h1>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <MethodBadge method={r.method} className="text-sm" />
          <code className="mono text-xs break-all flex-1">{r.url}</code>
          <Button
            onClick={() => {
              importRequest(r);
              navigate({ to: "/" });
            }}
          >
            <Download className="h-4 w-4 mr-2" /> Open in studio
          </Button>
        </div>

        <Section title="Headers">
          {r.headers.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None</p>
          ) : (
            <KVTable rows={r.headers} />
          )}
        </Section>

        <Section title="Query params">
          {r.params.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None</p>
          ) : (
            <KVTable rows={r.params} />
          )}
        </Section>

        <Section title={`Body (${r.bodyType})`}>
          {r.bodyType === "none" || !r.body ? (
            <p className="text-xs text-muted-foreground italic">No body</p>
          ) : (
            <CodeEditor
              value={r.body}
              readOnly
              language={r.bodyType === "json" ? "json" : "text"}
            />
          )}
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function KVTable({ rows }: { rows: { key: string; value: string; enabled: boolean }[] }) {
  return (
    <div className="rounded-md border border-border overflow-hidden mono text-xs">
      <table className="w-full">
        <tbody>
          {rows.filter((r) => r.enabled && r.key).map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="px-3 py-1.5 w-1/3 text-muted-foreground">{r.key}</td>
              <td className="px-3 py-1.5 break-all">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}