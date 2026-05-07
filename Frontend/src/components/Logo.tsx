import { CheckSquare } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold text-foreground">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <CheckSquare className="h-4 w-4" />
      </div>
      <span className="tracking-tight">Tasklane</span>
    </div>
  );
}