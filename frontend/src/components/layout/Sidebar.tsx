"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderKanban, LayoutDashboard, Settings, FileText, Hexagon, MoonStar, SunMedium, User, Bell } from 'lucide-react'
import { signout } from '@/lib/actions/auth'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  return (
    <div data-sidebar className="hidden md:flex h-full w-[260px] flex-col bg-transparent">
      <div className="flex h-24 items-center px-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mr-3">
          <Hexagon className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground font-sans">Monali AI</span>
      </div>
      <div className="flex-1 py-8">
        <nav className="space-y-2 px-4">
          <Link 
            href="/" 
            className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-200 ${pathname === '/' ? 'bg-card shadow-sm text-primary ring-1 ring-border/50' : 'text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link 
            href="/projects" 
            className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-200 ${pathname.startsWith('/projects') && pathname !== '/projects/new' ? 'bg-card shadow-sm text-primary ring-1 ring-border/50' : 'text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5'}`}
          >
            <FolderKanban className="h-5 w-5" />
            All Projects
          </Link>
          <Link 
            href="#" 
            className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-200 text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 opacity-70 cursor-not-allowed`}
          >
            <FileText className="h-5 w-5" />
            Templates
            <span className="text-[9px] ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Soon</span>
          </Link>

          <div className="pt-4 pb-2">
            <div className="h-px w-full bg-border/50 rounded-full" />
          </div>

          <a 
            href="/sample-zoning-docs.zip" 
            download
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-200 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Sample Docs
          </a>
        </nav>
      </div>
      <div className="p-4 pb-4 flex flex-col gap-4">
        
        {/* Settings & Sign Out */}
        <div className="space-y-1">
          <Link 
            href="#" 
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 transition-all duration-200 opacity-70 cursor-not-allowed"
          >
            <Settings className="h-4 w-4" />
            Settings
            <span className="text-[9px] ml-auto bg-foreground/5 text-foreground/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Soon</span>
          </Link>
          <form action={signout}>
            <button 
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </form>
        </div>

        {/* User Profile & Quick Actions */}
        <div className="flex items-center justify-between px-2 pt-4 border-t border-border/50">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-sm ring-2 ring-background cursor-pointer hover:scale-105 transition-transform duration-200">
            <User className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1 border border-border/20 shadow-inner">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground rounded-full hover:bg-background hover:text-foreground hover:shadow-sm h-8 w-8 transition-all"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="hidden w-[1px] h-4 bg-border/50 mx-1"></div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden text-muted-foreground rounded-full hover:bg-background hover:text-foreground hover:shadow-sm h-8 w-8 transition-all relative overflow-hidden"
            >
              <div className="relative flex items-center justify-center h-full w-full">
                <SunMedium className="h-4 w-4 absolute transition-all duration-500 ease-out dark:-translate-y-8 dark:opacity-0" />
                <MoonStar className="h-4 w-4 absolute transition-all duration-500 ease-out translate-y-8 opacity-0 dark:translate-y-0 dark:opacity-100" />
              </div>
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
