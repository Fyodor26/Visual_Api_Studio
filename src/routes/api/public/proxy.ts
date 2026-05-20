import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface ProxyPayload {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export const Route = createFileRoute("/api/public/proxy")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let payload: ProxyPayload;
        try {
          payload = (await request.json()) as ProxyPayload;
        } catch {
          return Response.json(
            { error: "Invalid JSON payload" },
            { status: 400, headers: CORS },
          );
        }
        const { method, url, headers = {}, body } = payload;
        if (!url || typeof url !== "string") {
          return Response.json({ error: "Missing url" }, { status: 400, headers: CORS });
        }
        let target: URL;
        try {
          target = new URL(url);
        } catch {
          return Response.json({ error: "Invalid url" }, { status: 400, headers: CORS });
        }
        if (!/^https?:$/.test(target.protocol)) {
          return Response.json(
            { error: "Only http(s) allowed" },
            { status: 400, headers: CORS },
          );
        }
        const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
        if (blocked.includes(target.hostname)) {
          return Response.json(
            { error: "Blocked host" },
            { status: 400, headers: CORS },
          );
        }
        const started = performance.now();
        try {
          const upstream = await fetch(target.toString(), {
            method: method || "GET",
            headers,
            body: ["GET", "HEAD"].includes((method || "GET").toUpperCase())
              ? undefined
              : body,
            redirect: "follow",
          });
          const text = await upstream.text();
          const respHeaders: Record<string, string> = {};
          upstream.headers.forEach((v, k) => {
            respHeaders[k] = v;
          });
          return Response.json(
            {
              status: upstream.status,
              statusText: upstream.statusText,
              headers: respHeaders,
              body: text,
              durationMs: Math.round(performance.now() - started),
            },
            { headers: CORS },
          );
        } catch (e) {
          return Response.json(
            {
              error: e instanceof Error ? e.message : "Network error",
              durationMs: Math.round(performance.now() - started),
            },
            { status: 502, headers: CORS },
          );
        }
      },
    },
  },
});