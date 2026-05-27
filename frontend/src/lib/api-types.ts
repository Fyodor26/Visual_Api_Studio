export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface KV {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KV[];
  headers: KV[];
  body: string;
  bodyType: "none" | "json" | "text";
  collectionId: string | null;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: KV[];
}

export interface ResponseRecord {
  id: string;
  requestId: string;
  requestSnapshot: {
    name: string;
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body: string;
  };
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  ok: boolean;
  error?: string;
  ranAt: number;
}

export interface SharedRequest {
  v: 1;
  request: Omit<ApiRequest, "collectionId" | "updatedAt">;
}