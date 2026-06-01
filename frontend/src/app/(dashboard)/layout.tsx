import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden p-3 md:p-5 gap-5">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative bg-card rounded-[2rem] shadow-sm border border-border/50">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}
