import { useMemo } from "react";
import type { ResponseRecord } from "@/lib/api-types";
import { tryFormatJSON } from "@/lib/runner";

function lineDiff(a: string, b: string) {
  const al = a.split("\n");
  const bl = b.split("\n");
  const n = al.length;
  const m = bl.length;
  // LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = al[i] === bl[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: { type: "same" | "del" | "add"; left?: string; right?: string }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (al[i] === bl[j]) {
      out.push({ type: "same", left: al[i], right: bl[j] });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", left: al[i] });
      i++;
    } else {
      out.push({ type: "add", right: bl[j] });
      j++;
    }
  }
  while (i < n) { out.push({ type: "del", left: al[i++] }); }
  while (j < m) { out.push({ type: "add", right: bl[j++] }); }
  return out;
}

export function DiffView({ a, b }: { a: ResponseRecord; b: ResponseRecord }) {
  const left = useMemo(
    () => (a.contentType.includes("json") ? tryFormatJSON(a.body) : a.body),
    [a],
  );
  const right = useMemo(
    () => (b.contentType.includes("json") ? tryFormatJSON(b.body) : b.body),
    [b],
  );
  const rows = useMemo(() => lineDiff(left, right), [left, right]);
  const added = rows.filter((r) => r.type === "add").length;
  const removed = rows.filter((r) => r.type === "del").length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <DiffMeta label="A" rec={a} />
        <DiffMeta label="B" rec={b} />
      </div>
      <div className="flex gap-3 text-[11px] mono">
        <span className="text-[var(--status-success)]">+{added}</span>
        <span className="text-destructive">−{removed}</span>
        <span className="text-muted-foreground">{rows.length} lines</span>
      </div>
      <div className="grid grid-cols-2 gap-0 rounded-md border border-border overflow-hidden bg-background">
        <DiffColumn rows={rows} side="left" />
        <DiffColumn rows={rows} side="right" />
      </div>
    </div>
  );
}

function DiffMeta({ label, rec }: { label: string; rec: ResponseRecord }) {
  return (
    <div className="rounded-md bg-muted/30 border border-border p-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
          {label}
        </span>
        <span className="mono text-xs">{rec.status} {rec.statusText}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {new Date(rec.ranAt).toLocaleString()}
        </span>
      </div>
      <div className="mono text-[11px] truncate text-muted-foreground">
        {rec.requestSnapshot.method} {rec.requestSnapshot.url}
      </div>
    </div>
  );
}

function DiffColumn({
  rows,
  side,
}: {
  rows: { type: "same" | "del" | "add"; left?: string; right?: string }[];
  side: "left" | "right";
}) {
  return (
    <div className="overflow-auto max-h-[55vh] mono text-[11.5px] leading-5 border-r border-border last:border-0">
      {rows.map((r, i) => {
        const isLeft = side === "left";
        const visible = isLeft ? r.type !== "add" : r.type !== "del";
        const content = isLeft ? r.left : r.right;
        const bg =
          r.type === "same"
            ? "transparent"
            : r.type === "del" && isLeft
              ? "color-mix(in oklab, var(--destructive) 20%, transparent)"
              : r.type === "add" && !isLeft
                ? "color-mix(in oklab, var(--primary) 18%, transparent)"
                : "color-mix(in oklab, var(--muted) 40%, transparent)";
        return (
          <div
            key={i}
            className="px-3 whitespace-pre"
            style={{ background: bg, minHeight: 20 }}
          >
            {visible ? content || "\u00A0" : "\u00A0"}
          </div>
        );
      })}
    </div>
  );
}