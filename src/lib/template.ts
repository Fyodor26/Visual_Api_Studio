import type { Environment } from "./api-types";

export function interpolate(input: string, env: Environment | null): string {
  if (!env) return input;
  const map = new Map<string, string>();
  for (const v of env.variables) {
    if (v.enabled && v.key) map.set(v.key, v.value);
  }
  return input.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_m, k) => map.get(k) ?? `{{${k}}}`);
}

export function interpolateKV(
  list: { key: string; value: string; enabled: boolean }[],
  env: Environment | null,
) {
  const out: Record<string, string> = {};
  for (const item of list) {
    if (!item.enabled || !item.key) continue;
    out[interpolate(item.key, env)] = interpolate(item.value, env);
  }
  return out;
}