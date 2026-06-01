"use client"

export function Header() {
  return (
    <header className="flex md:hidden h-[60px] w-full items-center justify-between bg-card/50 backdrop-blur-md px-6 sticky top-0 z-10 rounded-t-[2rem]">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-lg font-bold tracking-tight text-foreground font-sans">Monali AI</span>
        </div>
      </div>
    </header>
  )
}
