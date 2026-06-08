"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, Trees, Building, FileText } from "lucide-react"
import { useState } from "react"
import { createProject } from "@/lib/actions/projects"
import { cn } from "@/lib/utils"

export default function CreateProjectPage() {
  const [type, setType] = useState('single_stand')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.append('type', type) // append selected type
    const result = await createProject(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground mt-2 text-base">Initialize a new workspace for concept generation.</p>
        </div>
        <a href="/sample-zoning-docs.zip" download className="shrink-0">
          <Button variant="outline" className="gap-2 rounded-xl">
            <FileText className="h-4 w-4" />
            Download Sample Docs
          </Button>
        </a>
      </div>

      <form action={handleSubmit} className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 space-y-8">
          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium">Project Name</label>
            <input 
              name="name"
              type="text" 
              required
              placeholder="e.g. Greens Boutique Stand 12"
              className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-shadow"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Project Type</label>
            <div className="grid sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setType('single_stand')}
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-6 text-center transition-all",
                  type === 'single_stand' ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted hover:border-border"
                )}
              >
                <Building className={cn("h-8 w-8 mb-4", type === 'single_stand' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="text-base font-semibold">Single Stand</span>
                <span className="text-xs text-muted-foreground mt-2">Spec house or private</span>
              </div>
              
              <div 
                onClick={() => setType('estate')}
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-6 text-center transition-all",
                  type === 'estate' ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted hover:border-border"
                )}
              >
                <Trees className={cn("h-8 w-8 mb-4", type === 'estate' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="text-base font-semibold">Estate</span>
                <span className="text-xs text-muted-foreground mt-2">Masterplan layout</span>
              </div>

              <div 
                onClick={() => setType('commercial')}
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-6 text-center transition-all",
                  type === 'commercial' ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted hover:border-border"
                )}
              >
                <Building2 className={cn("h-8 w-8 mb-4", type === 'commercial' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="text-base font-semibold">Commercial</span>
                <span className="text-xs text-muted-foreground mt-2">Repositioning</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Location / Estate (Optional)</label>
            <input 
              name="location"
              type="text" 
              placeholder="e.g. George, Western Cape"
              className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-shadow"
            />
          </div>
        </div>

        <div className="bg-muted/30 px-8 py-6 flex items-center justify-end gap-4 border-t border-border">
          <Link href="/">
            <Button variant="ghost" size="lg" className="rounded-xl" type="button">Cancel</Button>
          </Link>
          <Button disabled={loading} size="lg" type="submit" className="rounded-xl px-8 font-medium">
            {loading ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </form>
    </div>
  )
}
