import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ApiRequest,
  Collection,
  Environment,
  HttpMethod,
  KV,
  ResponseRecord,
} from "./api-types";

const uid = () => Math.random().toString(36).slice(2, 10);

export function emptyRequest(overrides: Partial<ApiRequest> = {}): ApiRequest {
  return {
    id: uid(),
    name: "Untitled request",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/todos/1",
    params: [],
    headers: [],
    body: "",
    bodyType: "none",
    collectionId: null,
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function emptyKV(): KV {
  return { id: uid(), key: "", value: "", enabled: true };
}

interface ApiState {
  collections: Collection[];
  requests: ApiRequest[];
  environments: Environment[];
  activeEnvId: string | null;
  activeRequestId: string | null;
  openTabs: string[];
  history: ResponseRecord[];

  selectRequest: (id: string) => void;
  closeTab: (id: string) => void;
  newRequest: (collectionId?: string | null) => string;
  updateRequest: (id: string, patch: Partial<ApiRequest>) => void;
  deleteRequest: (id: string) => void;
  duplicateRequest: (id: string) => void;
  importRequest: (r: Omit<ApiRequest, "id" | "collectionId" | "updatedAt">) => string;

  newCollection: (name: string) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;

  newEnvironment: (name: string) => string;
  updateEnvironment: (id: string, patch: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnv: (id: string | null) => void;

  pushResponse: (rec: ResponseRecord) => void;
  clearHistory: () => void;
}

const seedCollection: Collection = {
  id: "col-demo",
  name: "Demo",
  createdAt: Date.now(),
};

const seedRequest: ApiRequest = emptyRequest({
  id: "req-demo",
  name: "Get todo #1",
  collectionId: "col-demo",
});

const seedEnv: Environment = {
  id: "env-demo",
  name: "Default",
  variables: [
    { id: uid(), key: "baseUrl", value: "https://jsonplaceholder.typicode.com", enabled: true },
    { id: uid(), key: "token", value: "", enabled: true },
  ],
};

export const useApiStore = create<ApiState>()(
  persist(
    (set, get) => ({
      collections: [seedCollection],
      requests: [seedRequest],
      environments: [seedEnv],
      activeEnvId: seedEnv.id,
      activeRequestId: seedRequest.id,
      openTabs: [seedRequest.id],
      history: [],

      selectRequest: (id) =>
        set((s) => ({
          activeRequestId: id,
          openTabs: s.openTabs.includes(id) ? s.openTabs : [...s.openTabs, id],
        })),

      closeTab: (id) =>
        set((s) => {
          const openTabs = s.openTabs.filter((t) => t !== id);
          const activeRequestId =
            s.activeRequestId === id ? (openTabs[openTabs.length - 1] ?? null) : s.activeRequestId;
          return { openTabs, activeRequestId };
        }),

      newRequest: (collectionId = null) => {
        const r = emptyRequest({ collectionId, name: "Untitled request" });
        set((s) => ({
          requests: [...s.requests, r],
          activeRequestId: r.id,
          openTabs: [...s.openTabs, r.id],
        }));
        return r.id;
      },

      updateRequest: (id, patch) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r,
          ),
        })),

      deleteRequest: (id) =>
        set((s) => {
          const requests = s.requests.filter((r) => r.id !== id);
          const openTabs = s.openTabs.filter((t) => t !== id);
          const activeRequestId =
            s.activeRequestId === id ? (openTabs[openTabs.length - 1] ?? null) : s.activeRequestId;
          return { requests, openTabs, activeRequestId };
        }),

      duplicateRequest: (id) => {
        const r = get().requests.find((x) => x.id === id);
        if (!r) return;
        const copy = { ...r, id: uid(), name: r.name + " copy", updatedAt: Date.now() };
        set((s) => ({ requests: [...s.requests, copy] }));
      },

      importRequest: (r) => {
        const fresh = emptyRequest({ ...r, collectionId: null });
        set((s) => ({
          requests: [...s.requests, fresh],
          activeRequestId: fresh.id,
          openTabs: [...s.openTabs, fresh.id],
        }));
        return fresh.id;
      },

      newCollection: (name) => {
        const c: Collection = { id: uid(), name, createdAt: Date.now() };
        set((s) => ({ collections: [...s.collections, c] }));
        return c.id;
      },
      renameCollection: (id, name) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? { ...c, name } : c)),
        })),
      deleteCollection: (id) =>
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
          requests: s.requests.map((r) =>
            r.collectionId === id ? { ...r, collectionId: null } : r,
          ),
        })),

      newEnvironment: (name) => {
        const e: Environment = { id: uid(), name, variables: [] };
        set((s) => ({ environments: [...s.environments, e], activeEnvId: e.id }));
        return e.id;
      },
      updateEnvironment: (id, patch) =>
        set((s) => ({
          environments: s.environments.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      deleteEnvironment: (id) =>
        set((s) => {
          const environments = s.environments.filter((e) => e.id !== id);
          const activeEnvId =
            s.activeEnvId === id ? (environments[0]?.id ?? null) : s.activeEnvId;
          return { environments, activeEnvId };
        }),
      setActiveEnv: (id) => set({ activeEnvId: id }),

      pushResponse: (rec) =>
        set((s) => ({ history: [rec, ...s.history].slice(0, 100) })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: "visual-api-studio-v1" },
  ),
);

export function methodColor(m: HttpMethod): string {
  switch (m) {
    case "GET": return "var(--method-get)";
    case "POST": return "var(--method-post)";
    case "PUT": return "var(--method-put)";
    case "PATCH": return "var(--method-patch)";
    case "DELETE": return "var(--method-delete)";
    default: return "var(--muted-foreground)";
  }
}

export function statusColor(status: number): string {
  if (status >= 500) return "var(--status-server-error)";
  if (status >= 400) return "var(--status-client-error)";
  if (status >= 300) return "var(--status-redirect)";
  if (status >= 200) return "var(--status-success)";
  return "var(--muted-foreground)";
}