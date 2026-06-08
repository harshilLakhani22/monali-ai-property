import { Loader2 } from "lucide-react"

export default function ProjectWorkspaceLoading() {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-black/5 dark:bg-white/5">
      <div className="flex flex-col items-center gap-4 text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  )
}
