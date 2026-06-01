import Link from "next/link"
import { Plus, Building2, Map, FileText, ArrowRight, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { FadeIn } from "@/components/ui/fade-in"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
    <div className="space-y-10 pt-4">

      {/* Premium Hero Section */}
      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-gradient-to-r from-card to-card/30 p-6 sm:p-8 shadow-sm group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-transform duration-1000 group-hover:scale-110" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
              Welcome back, Architect.
            </h1>

            <Link href="/projects/new" className="shrink-0">
              <Button className="h-12 px-6 gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 text-sm font-medium transition-all hover:scale-105 shadow-md shadow-foreground/5 dark:shadow-primary/20">
                <Plus className="h-4 w-4" />
                Analyze New Property
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Bento Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FadeIn delay={0.2} className="h-full">
          <div className="p-1 rounded-[2rem] bg-gradient-to-b from-border/50 to-transparent transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="h-full rounded-[calc(2rem-4px)] border border-border/20 bg-card p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Map className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                  <Map className="h-6 w-6 text-foreground" />
                </div>
                <span className="text-base font-medium">Total Sites</span>
              </div>
              <div className="text-5xl font-bold tracking-tight text-foreground">
                {projects.length}
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3} className="h-full">
          <div className="p-1 rounded-[2rem] bg-gradient-to-b from-border/50 to-transparent transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="h-full rounded-[calc(2rem-4px)] border border-border/20 bg-card p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Building2 className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="p-3 rounded-2xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <span className="text-base font-medium">Generated Concepts</span>
              </div>
              <div className="text-5xl font-bold tracking-tight text-foreground flex items-baseline gap-3">
                0 <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Coming Soon</span>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} className="h-full sm:col-span-2 lg:col-span-1">
          <div className="p-1 rounded-[2rem] bg-gradient-to-b from-border/50 to-transparent transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="h-full rounded-[calc(2rem-4px)] border border-border/20 bg-card p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                  <FileText className="h-6 w-6 text-foreground" />
                </div>
                <span className="text-base font-medium">Extracted Rules</span>
              </div>
              <div className="text-5xl font-bold tracking-tight text-foreground flex items-baseline gap-3">
                0 <span className="text-sm font-medium text-muted-foreground bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">Pending</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Recent Projects Section */}
      <FadeIn delay={0.5}>
        <div className="space-y-6 pt-10 border-t border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Recent Projects
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-border/50 to-transparent">
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[calc(2.5rem-4px)] border border-dashed border-border/50 bg-card/50 text-center relative overflow-hidden">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-8 ring-8 ring-primary/5">
                  <Building2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground font-sans">No projects yet</h3>
                <p className="mt-3 text-lg text-muted-foreground max-w-md">
                  Get started by creating a new project. Upload your zoning documents and let our AI extract the constraints immediately.
                </p>
                <Link href="/projects/new" className="mt-10 group relative">
                  <Button size="lg" className="h-14 rounded-2xl pr-16 bg-background border-border text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium border shadow-sm transition-all hover:shadow-md">
                    Create your first project
                  </Button>
                  <div className="absolute right-1.5 top-1.5 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, idx) => (
                <FadeIn key={project.id} delay={0.1 * (idx + 1)}>
                  <Link href={`/projects/${project.id}`} className="group block h-full">
                    <div className="p-1 rounded-[2rem] bg-gradient-to-b from-border/50 to-transparent transition-all duration-400 ease-out group-hover:scale-[0.98] group-hover:from-primary/30 h-full">
                      <div className="rounded-[calc(2rem-4px)] border border-border/20 bg-card p-8 shadow-sm h-full flex flex-col group-hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-8">
                          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <span className="text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-full bg-muted text-muted-foreground uppercase">
                            {project.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2 font-sans">{project.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-8 pt-6 border-t border-border/50">
                          <Clock className="h-4 w-4" />
                          {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
