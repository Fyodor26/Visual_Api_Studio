import type { ApiRequest, SharedRequest } from "./api-types";

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(b64: string): string {
  const pad = b64.length % 4 === 2 ? "==" : b64.length % 4 === 3 ? "=" : "";
  const norm = b64.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(norm);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeShare(req: ApiRequest): string {
  const payload: SharedRequest = {
    v: 1,
    request: {
      id: req.id,
      name: req.name,
      method: req.method,
      url: req.url,
      params: req.params,
      headers: req.headers,
      body: req.body,
      bodyType: req.bodyType,
    },
  };
  return utf8ToBase64Url(JSON.stringify(payload));
}

export function decodeShare(token: string): SharedRequest | null {
  try {
    const obj = JSON.parse(base64UrlToUtf8(token)) as SharedRequest;
    if (obj.v !== 1 || !obj.request) return null;
    return obj;
  } catch {
    return null;
  }
}