"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderKanban, Home, Settings, FileText, Building2 } from 'lucide-react'
import { signout } from '@/lib/actions/auth'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-full w-72 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-8">
        <Building2 className="h-6 w-6 text-primary mr-3" />
        <span className="text-base font-semibold tracking-tight text-foreground">Monali Platform</span>
      </div>
      <div className="flex-1 py-8">
        <nav className="space-y-2 px-4">
          <Link 
            href="/" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link 
            href="/projects" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${pathname.startsWith('/projects') && pathname !== '/projects/new' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <FolderKanban className="h-5 w-5" />
            All Projects
          </Link>
          <Link 
            href="/templates" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${pathname.startsWith('/templates') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <FileText className="h-5 w-5" />
            Templates
          </Link>
        </nav>
      </div>
      <div className="border-t border-border p-4">
        <Link 
          href="/settings" 
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <form action={signout}>
          <button 
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
