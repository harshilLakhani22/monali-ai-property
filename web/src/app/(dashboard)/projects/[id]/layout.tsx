import Link from "next/link"
import { LayoutDashboard, FileText, BrainCircuit, BookOpen, Layers, Calculator, FileOutput } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

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

      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="py-4">
        {children}
      </div>
    </div>
  )
}
