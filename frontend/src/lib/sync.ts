import { apiFetch } from "./api";
import { useApiStore } from "./api-store";

export async function syncWorkspace() {
  try {
    const store = useApiStore.getState();

    await apiFetch("/api/studio/sync", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "main",

        collections: store.collections,
        requests: store.requests,
        environments: store.environments,
        history: store.history,
      }),
    });
  } catch (error) {
    console.error("Workspace sync failed", error);
  }
}