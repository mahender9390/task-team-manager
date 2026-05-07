import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { Server } from "lucide-react";

export function ApiBaseBanner() {
  const [base, setBase] = useState(API_BASE_URL);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ttm_api_base");
    if (stored) {
      (window as any).__API_BASE_URL__ = stored;
      setBase(stored);
    }
  }, []);

  const save = (v: string) => {
    localStorage.setItem("ttm_api_base", v);
    (window as any).__API_BASE_URL__ = v;
    setBase(v);
    setEditing(false);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <Server className="h-3.5 w-3.5" />
      <span className="font-medium">API:</span>
      {editing ? (
        <input
          autoFocus
          defaultValue={base}
          onBlur={(e) => save(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save((e.target as HTMLInputElement).value)}
          className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs"
        />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 truncate text-left font-mono hover:text-foreground">
          {base}
        </button>
      )}
    </div>
  );
}