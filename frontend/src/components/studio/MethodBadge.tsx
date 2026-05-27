import type { HttpMethod } from "@/lib/api-types";
import { methodColor } from "@/lib/api-store";

export function MethodBadge({ method, className = "" }: { method: HttpMethod; className?: string }) {
  return (
    <span
      className={"mono text-[10px] font-bold tracking-wider " + className}
      style={{ color: methodColor(method) }}
    >
      {method}
    </span>
  );
}