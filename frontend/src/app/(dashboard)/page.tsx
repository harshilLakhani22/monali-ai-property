import Link from "next/link"
import { Plus, Building2, Map, FileText, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Safety net: ensure user exists in our database
  // (handles edge case where Supabase auth exists but DB was wiped)
  if (user) {
    const existingUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!existingUser) {
      const org = await prisma.organization.create({
        data: { name: 'My Workspace' }
      })
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          organizationId: org.id,
        }
      })
    }
  }

  const projects = user ? await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' }
  }) : [];

  return (
    <div className="space-y-8">
      {/* Header with subtle gradient background */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Portfolio Overview</h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-base">
              Manage your development portfolio, generate AI massing concepts, and extract zoning requirements instantly.
            </p>
          </div>
          <Link href="/projects/new">
            <Button size="lg" className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric Cards - Double Bezel Architecture */}
        <div className="p-1.5 rounded-3xl bg-black/5 dark:bg-white/5 border border-border transition-transform hover:scale-[1.02]">
          <div className="h-full rounded-[calc(1.5rem-0.375rem)] border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Map className="h-5 w-5" />
              <span className="text-sm font-medium">Total Sites</span>
            </div>
            <div className="text-4xl font-semibold tracking-tight">
              {projects.length}
            </div>
          </div>
        </div>
        
        <div className="p-1.5 rounded-3xl bg-black/5 dark:bg-white/5 border border-border transition-transform hover:scale-[1.02]">
          <div className="h-full rounded-[calc(1.5rem-0.375rem)] border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Building2 className="h-5 w-5" />
              <span className="text-sm font-medium">Generated Concepts</span>
            </div>
            <div className="text-4xl font-semibold tracking-tight">
              0 <span className="text-sm font-normal text-muted-foreground ml-2">(Coming Soon)</span>
            </div>
          </div>
        </div>

        <div className="p-1.5 rounded-3xl bg-black/5 dark:bg-white/5 border border-border transition-transform hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
          <div className="h-full rounded-[calc(1.5rem-0.375rem)] border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Extracted Rules</span>
            </div>
            <div className="text-4xl font-semibold tracking-tight">
              0 <span className="text-sm font-normal text-muted-foreground ml-2">(Coming Soon)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-3">
          <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary">PORTFOLIO</span>
          Recent Projects
        </h2>
        
        {projects.length === 0 ? (
          <div className="p-2 rounded-3xl bg-black/5 dark:bg-white/5 border border-border">
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[calc(1.5rem-0.5rem)] border border-dashed border-border bg-card text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 ring-8 ring-primary/5">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-foreground">No projects yet</h3>
              <p className="mt-2 text-base text-muted-foreground max-w-sm">
                Get started by creating a new project. You can upload documents and generate layout concepts immediately.
              </p>
              <Link href="/projects/new" className="mt-8 group relative">
                <Button variant="outline" size="lg" className="rounded-full pr-14 h-12 bg-background border-border">
                  Create your first project
                </Button>
                <div className="absolute right-1 top-1 w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block">
                <div className="p-1.5 rounded-3xl bg-black/5 dark:bg-white/5 border border-border/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[0.98] group-hover:bg-black/10 dark:group-hover:bg-white/10">
                  <div className="rounded-[calc(1.5rem-0.375rem)] border border-border bg-card p-6 shadow-sm h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground capitalize">
                        {project.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-6">
                      <Clock className="h-4 w-4 opacity-50" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
