import Link from "next/link"
import { LayoutDashboard, FileText, BrainCircuit, BookOpen, Layers, Calculator, FileOutput } from "lucide-react"
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

  const tabs = [
    { name: "Overview", href: `/projects/${id}`, icon: LayoutDashboard },
    { name: "Data Room", href: `/projects/${id}/data-room`, icon: FileText },
    { name: "Intelligence", href: `/projects/${id}/intelligence`, icon: BrainCircuit },
    { name: "Brief", href: `/projects/${id}/brief`, icon: BookOpen },
    { name: "Concepts", href: `/projects/${id}/concepts`, icon: Layers },
    { name: "Costing", href: `/projects/${id}/costing`, icon: Calculator },
    { name: "Report", href: `/projects/${id}/report`, icon: FileOutput },
  ]

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
