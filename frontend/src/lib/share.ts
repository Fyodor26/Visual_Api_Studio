import type { ApiRequest } from "./api-types";
import { apiFetch } from "./api";

export async function createCloudShare(
  req: ApiRequest
): Promise<string> {
  const data = await apiFetch("/api/share", {
    method: "POST",
    body: JSON.stringify({
      id: req.id,
      name: req.name,
      method: req.method,
      url: req.url,
      params: req.params,
      headers: req.headers,
      body: req.body,
      bodyType: req.bodyType,
    }),
  });

  return data.shareId;
}

export async function getCloudShare(
  shareId: string
): Promise<ApiRequest | null> {
  try {
    const data = await apiFetch(`/api/share/${shareId}`);

    if (data.success) {
      return data.request as ApiRequest;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}