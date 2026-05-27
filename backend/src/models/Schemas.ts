import { Schema, model, Document } from 'mongoose';

const KVRecordSchema = new Schema({
  id: { type: String, required: true },
  key: { type: String, default: "" },
  value: { type: String, default: "" },
  enabled: { type: Boolean, required: true, default: true }
}, { _id: false });

export interface IWorkspace extends Document {
  workspaceId: string;

  collections: any[];
  requests: any[];
  environments: any[];
  history: any[];

  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>({
  workspaceId: { type: String, required: true, unique: true, index: true },
  collections: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Number, required: true }
  }],
  requests: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    method: { type: String, required: true },
    url: { type: String, default: "" },
    params: [KVRecordSchema],
    headers: [KVRecordSchema],
    body: { type: String, default: "" },
    bodyType: { type: String, required: true, default: "none" },
    collectionId: { type: String, default: null },
    updatedAt: { type: Number, required: true }
  }],
  environments: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    variables: [KVRecordSchema]
  }],
  history: [{
    id: { type: String, required: true },
    requestId: { type: String, required: true },
    requestSnapshot: {
      name: { type: String, required: true },
      method: { type: String, required: true },
      url: { type: String, required: true },
      headers: { type: Map, of: String },
      body: { type: String, default: "" }
    },
    status: { type: Number, required: true },
    statusText: { type: String, required: true },
    durationMs: { type: Number, required: true },
    sizeBytes: { type: Number, required: true },
    headers: { type: Map, of: String },
    body: { type: String, default: "" },
    contentType: { type: String, default: "" },
    ok: { type: Boolean, required: true },
    error: { type: String },
    ranAt: { type: Number, required: true }
  }]
}, { timestamps: true });

export interface IShare extends Document {
  shareId: string;
  request: any;
}

const ShareSchema = new Schema<IShare>({
  shareId: { type: String, required: true, unique: true, index: true },
  request: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    method: { type: String, required: true },
    url: { type: String, default: "" },
    params: [KVRecordSchema],
    headers: [KVRecordSchema],
    body: { type: String, default: "" },
    bodyType: { type: String, required: true }
  }
}, { timestamps: true });

export const Workspace = model<IWorkspace>('Workspace', WorkspaceSchema);
export const Share = model<IShare>('Share', ShareSchema);