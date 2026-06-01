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
        {/* Metric Cards */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Map className="h-5 w-5" />
            <span className="text-sm font-medium">Total Sites</span>
          </div>
          <div className="text-4xl font-semibold tracking-tight">
            {projects.length}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-medium">Generated Concepts</span>
          </div>
          <div className="text-4xl font-semibold tracking-tight">
            0 <span className="text-sm font-normal text-muted-foreground ml-2">(Coming Soon)</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">Extracted Rules</span>
          </div>
          <div className="text-4xl font-semibold tracking-tight">
            0 <span className="text-sm font-normal text-muted-foreground ml-2">(Coming Soon)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
        
        {projects.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 text-center shadow-sm relative overflow-hidden transition-all hover:bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 ring-8 ring-primary/5">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-foreground">No projects yet</h3>
            <p className="mt-2 text-base text-muted-foreground max-w-sm">
              Get started by creating a new project. You can upload documents and generate layout concepts immediately.
            </p>
            <Link href="/projects/new" className="mt-8">
              <Button variant="outline" size="lg" className="gap-2 bg-background rounded-xl">
                Create your first project <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                      {project.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(project.createdAt).toLocaleDateString()}
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
