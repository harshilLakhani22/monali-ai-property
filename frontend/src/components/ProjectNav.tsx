'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, BrainCircuit, BookOpen, Layers, Calculator, FileOutput, MapPin } from "lucide-react"
import { motion } from "framer-motion"

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname()
  
  const tabs = [
    { name: "Overview", href: `/projects/${projectId}`, icon: LayoutDashboard },
    { name: "Data Room", href: `/projects/${projectId}/data-room`, icon: FileText },
    { name: "Intelligence", href: `/projects/${projectId}/intelligence`, icon: BrainCircuit },
    { name: "Site Details", href: `/projects/${projectId}/stand`, icon: MapPin },
    { name: "Brief", href: `/projects/${projectId}/brief`, icon: BookOpen },
    { name: "Concepts", href: `/projects/${projectId}/concepts`, icon: Layers },
    { name: "Costing", href: `/projects/${projectId}/costing`, icon: Calculator },
    { name: "Report", href: `/projects/${projectId}/report`, icon: FileOutput },
  ]

  return (
    <div className="flex w-full overflow-x-auto custom-scrollbar pb-2">
      <nav className="inline-flex items-center p-1.5 space-x-2 bg-black/5 dark:bg-white/5 rounded-2xl border border-border/50 shadow-inner">
        {tabs.map((tab) => {
          const isActive = tab.name === "Overview" 
            ? pathname === tab.href 
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors z-10 rounded-xl
                ${isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-pill"
                  className="absolute inset-0 bg-background rounded-xl -z-10 shadow-sm border border-border/50"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <tab.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'opacity-70'}`} />
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
