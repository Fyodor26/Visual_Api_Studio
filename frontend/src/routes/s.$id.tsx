import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { getCloudShare } from "@/lib/share"; // Imported the new database getter
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
  // 1. Fetch from the Express backend asynchronously before mounting the view
  loader: async ({ params }) => {
    const sharedRequest = await getCloudShare(params.id);
    return { sharedRequest };
  },
  component: SharedView,
});

function SharedView() {
  // 2. Consume the loaded request object resolved from the database hook
  const { sharedRequest: r } = Route.useLoaderData();
  const importRequest = useApiStore((s) => s.importRequest);
  const navigate = useNavigate();

  if (!r) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground p-8">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-semibold">Broken share link</h1>
          <p className="text-sm text-muted-foreground">
            This URL configuration doesn't map to a valid shared request database snapshot.
          </p>
          <div className="pt-2">
            <Link to="/" className="text-xs text-primary underline underline-offset-4">
              Return to your workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleImport = () => {
    // Import the downloaded database request metadata straight into local Zustand collections
    importRequest(r);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 border-b border-border px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <MethodBadge method={r.method} />
            <span className="text-sm font-semibold tracking-tight">{r.name}</span>
          </div>
        </div>
        <Button size="sm" onClick={handleImport} className="gap-2">
          <Download className="h-3.5 w-3.5" />
          Import to Workspace
        </Button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6 overflow-auto">
        <Section title="Target Endpoint URL">
          <div className="rounded-md bg-muted/40 p-3 font-mono text-xs break-all border border-border">
            {r.url || "(empty URL string target)"}
          </div>
        </Section>

        <Section title="Headers">
          {!r.headers || r.headers.filter((h) => h.enabled && h.key).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None</p>
          ) : (
            <KVTable rows={r.headers} />
          )}
        </Section>

        <Section title="Query Parameters">
          {!r.params || r.params.filter((p) => p.enabled && p.key).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None</p>
          ) : (
            <KVTable rows={r.params} />
          )}
        </Section>

        <Section title={`Body (${r.bodyType || "none"})`}>
          {r.bodyType === "none" || !r.body ? (
            <p className="text-xs text-muted-foreground italic">No body payload provided</p>
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
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function KVTable({ rows }: { rows: { key: string; value: string; enabled: boolean }[] }) {
  return (
    <div className="rounded-md border border-border overflow-hidden mono text-xs">
      <table className="w-full text-left border-collapse">
        <tbody>
          {rows
            .filter((r) => r.enabled && r.key)
            .map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0 bg-muted/10">
                <td className="px-3 py-2 w-1/3 text-muted-foreground border-r border-border font-medium align-top">
                  {r.key}
                </td>
                <td className="px-3 py-2 break-all align-top">{r.value}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}