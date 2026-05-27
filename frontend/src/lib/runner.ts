import type {
  ApiRequest,
  Environment,
  ResponseRecord,
} from "./api-types";

import { interpolate, interpolateKV } from "./template";
import { API_URL } from "./config";
import { useAuthStore } from "./auth-store";

const uid = () => Math.random().toString(36).slice(2, 10);

export async function runRequest(
  req: ApiRequest,
  env: Environment | null
): Promise<ResponseRecord> {
  const url = interpolate(req.url, env);

  const params = interpolateKV(req.params, env);

  const headers = interpolateKV(req.headers, env);

  const body =
    req.bodyType === "none"
      ? ""
      : interpolate(req.body, env);

  let finalUrl = url;

  const qs = new URLSearchParams(params).toString();

  if (qs) {
    finalUrl +=
      (url.includes("?") ? "&" : "?") + qs;
  }

  if (
    req.bodyType === "json" &&
    body &&
    !headers["Content-Type"] &&
    !headers["content-type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const token = useAuthStore.getState().token;

  const ranAt = Date.now();

  try {
    const proxyRes = await fetch(
      `${API_URL}/api/public`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: JSON.stringify({
          method: req.method,
          url: finalUrl,
          headers,
          body,
        }),
      }
    );

    const data = await proxyRes.json();

    if (
      data.error &&
      typeof data.status !== "number"
    ) {
      return {
        id: uid(),
        requestId: req.id,

        requestSnapshot: {
          name: req.name,
          method: req.method,
          url: finalUrl,
          headers,
          body,
        },

        status: 0,
        statusText: "Error",

        durationMs: data.durationMs ?? 0,

        sizeBytes: 0,

        headers: {},

        body: "",

        contentType: "",

        ok: false,

        error: data.error,

        ranAt,
      };
    }

    const ct =
      data.headers?.["content-type"] ?? "";

    return {
      id: uid(),

      requestId: req.id,

      requestSnapshot: {
        name: req.name,
        method: req.method,
        url: finalUrl,
        headers,
        body,
      },

      status: data.status,

      statusText: data.statusText,

      durationMs: data.durationMs,

      sizeBytes: new Blob([
        data.body ?? "",
      ]).size,

      headers: data.headers ?? {},

      body: data.body ?? "",

      contentType: ct,

      ok:
        data.status >= 200 &&
        data.status < 300,

      ranAt,
    };
  } catch (e) {
    return {
      id: uid(),

      requestId: req.id,

      requestSnapshot: {
        name: req.name,
        method: req.method,
        url: finalUrl,
        headers,
        body,
      },

      status: 0,

      statusText: "Error",

      durationMs: 0,

      sizeBytes: 0,

      headers: {},

      body: "",

      contentType: "",

      ok: false,

      error:
        e instanceof Error
          ? e.message
          : "Network error",

      ranAt,
    };
  }
}

export function tryFormatJSON(
  input: string
): string {
  try {
    return JSON.stringify(
      JSON.parse(input),
      null,
      2
    );
  } catch {
    return input;
  }
}

export function formatBytes(
  b: number
): string {
  if (b < 1024) return `${b} B`;

  if (b < 1024 * 1024) {
    return `${(b / 1024).toFixed(1)} KB`;
  }

  return `${(b / 1024 / 1024).toFixed(
    2
  )} MB`;
}

export function formatDuration(
  ms: number
): string {
  if (ms < 1000) {
    return `${ms} ms`;
  }

  return `${(ms / 1000).toFixed(2)} s`;
}