'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, BrainCircuit, BookOpen, Layers, Calculator, FileOutput } from "lucide-react"

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname()
  
  const tabs = [
    { name: "Overview", href: `/projects/${projectId}`, icon: LayoutDashboard },
    { name: "Data Room", href: `/projects/${projectId}/data-room`, icon: FileText },
    { name: "Intelligence", href: `/projects/${projectId}/intelligence`, icon: BrainCircuit },
    { name: "Brief", href: `/projects/${projectId}/brief`, icon: BookOpen },
    { name: "Concepts", href: `/projects/${projectId}/concepts`, icon: Layers },
    { name: "Costing", href: `/projects/${projectId}/costing`, icon: Calculator },
    { name: "Report", href: `/projects/${projectId}/report`, icon: FileOutput },
  ]

  return (
    <nav className="-mb-px flex space-x-8 overflow-x-auto custom-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.name === "Overview" 
          ? pathname === tab.href 
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
              flex items-center gap-2.5 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-all
              ${isActive 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }
            `}
          >
            <tab.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'opacity-70'}`} />
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}
