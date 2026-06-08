"use client"

export function Header() {
  return (
    <header data-header className="flex md:hidden h-[60px] w-full items-center justify-between bg-card/50 backdrop-blur-md px-6 sticky top-0 z-10 rounded-t-[2rem]">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-lg font-bold tracking-tight text-foreground font-sans">Monali AI</span>
        </div>
      </div>
      
      <a 
        href="/sample-zoning-docs.zip" 
        download
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        Sample Docs
      </a>
    </header>
  )
}
