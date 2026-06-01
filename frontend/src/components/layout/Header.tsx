"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function Header() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile brand name, visible only on small screens */}
        <div className="md:hidden flex items-center">
          <span className="text-base font-semibold tracking-tight text-foreground">Monali</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-muted-foreground rounded-full hover:bg-muted"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
          MK
        </div>
      </div>
    </header>
  )
}
