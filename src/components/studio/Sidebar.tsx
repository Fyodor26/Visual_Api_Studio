import { useState } from "react";
import { ChevronDown, ChevronRight, FolderPlus, MoreHorizontal, Plus, Trash2, Copy, Folder } from "lucide-react";
import { useApiStore } from "@/lib/api-store";
import type { ApiRequest, Collection } from "@/lib/api-types";
import { MethodBadge } from "./MethodBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const collections = useApiStore((s) => s.collections);
  const requests = useApiStore((s) => s.requests);
  const newCollection = useApiStore((s) => s.newCollection);
  const newRequest = useApiStore((s) => s.newRequest);
  const [query, setQuery] = useState("");

  const looseRequests = requests.filter((r) => !r.collectionId);
  const filter = (r: ApiRequest) =>
    !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.url.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 grid place-items-center">
            <span className="text-primary text-xs font-bold">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Visual API Studio</div>
            <div className="text-[10px] text-muted-foreground tracking-wide uppercase">v0.1 · preview</div>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-sidebar-border flex items-center gap-2">
        <Input
          placeholder="Search requests…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 text-xs bg-background/40"
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => {
            const name = prompt("Collection name", "New collection");
            if (name) newCollection(name);
          }}
          title="New collection"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => newRequest(null)}
          title="New request"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {collections.map((c) => (
          <CollectionNode
            key={c.id}
            collection={c}
            requests={requests.filter((r) => r.collectionId === c.id && filter(r))}
          />
        ))}

        {looseRequests.filter(filter).length > 0 && (
          <div className="px-2 mt-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">Loose</div>
            {looseRequests.filter(filter).map((r) => (
              <RequestRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionNode({ collection, requests }: { collection: Collection; requests: ApiRequest[] }) {
  const [open, setOpen] = useState(true);
  const newRequest = useApiStore((s) => s.newRequest);
  const renameCollection = useApiStore((s) => s.renameCollection);
  const deleteCollection = useApiStore((s) => s.deleteCollection);

  return (
    <div className="px-2">
      <div className="group flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-sidebar-accent">
        <button onClick={() => setOpen((v) => !v)} className="text-muted-foreground">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <Folder className="h-3.5 w-3.5 text-primary/80" />
        <span className="text-xs font-medium flex-1 truncate">{collection.name}</span>
        <span className="text-[10px] text-muted-foreground">{requests.length}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => newRequest(collection.id)}>
              <Plus className="h-3.5 w-3.5 mr-2" /> Add request
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const n = prompt("Rename collection", collection.name);
                if (n) renameCollection(collection.id, n);
              }}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => {
                if (confirm("Delete collection? Requests move to Loose.")) deleteCollection(collection.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {open && (
        <div className="ml-3 border-l border-sidebar-border pl-1">
          {requests.map((r) => (
            <RequestRow key={r.id} request={r} />
          ))}
          {requests.length === 0 && (
            <div className="text-[11px] text-muted-foreground italic px-3 py-1">Empty</div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestRow({ request }: { request: ApiRequest }) {
  const activeId = useApiStore((s) => s.activeRequestId);
  const selectRequest = useApiStore((s) => s.selectRequest);
  const duplicateRequest = useApiStore((s) => s.duplicateRequest);
  const deleteRequest = useApiStore((s) => s.deleteRequest);
  const active = activeId === request.id;

  return (
    <div
      onClick={() => selectRequest(request.id)}
      className={
        "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs " +
        (active ? "bg-sidebar-accent text-foreground" : "hover:bg-sidebar-accent/50")
      }
    >
      <MethodBadge method={request.method} className="w-12 shrink-0" />
      <span className="truncate flex-1">{request.name || "Untitled"}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => duplicateRequest(request.id)}>
            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => deleteRequest(request.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}