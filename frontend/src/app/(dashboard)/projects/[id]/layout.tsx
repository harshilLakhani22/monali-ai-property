import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ProjectNav } from "@/components/ProjectNav"

export default async function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const project = await prisma.project.findUnique({
    where: { id }
  })

  if (!project) {
    notFound()
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.organizationId !== project.organizationId) {
    notFound()
  }

  // Navigation logic is handled inside ProjectNav component.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{project.name}</h1>
          <p className="text-sm text-zinc-500 capitalize">{project.type.replace('_', ' ')} Workspace</p>
        </div>
      </div>

      <div className="border-b border-border/50">
        <ProjectNav projectId={id} />
      </div>

      <div className="py-4">
        {children}
      </div>
    </div>
  )
}
