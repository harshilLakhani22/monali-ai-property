"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, ArrowRight } from "lucide-react"
import { useState } from "react"
import { login } from "@/lib/actions/auth"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center">
      {/* Left Image / Branding Card - Z-Axis overlapping */}
      <div className="hidden lg:block lg:col-span-7 relative z-0">
        <div className="rounded-[2.5rem] bg-white/5 p-2 ring-1 ring-white/10 shadow-2xl backdrop-blur-3xl transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01]">
          <div className="relative rounded-[calc(2.5rem-0.5rem)] overflow-hidden bg-zinc-950 aspect-[4/3] flex flex-col justify-between p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/assets/login-bg.jpg" 
                alt="Luxury Modern Architecture" 
                className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <Building2 className="h-4 w-4" />
                Monali AI
              </div>
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter text-white leading-[1.1] mb-6">
                Redefining Property <br /> Development.
              </h1>
              <p className="text-zinc-400 text-lg max-w-md font-light">
                Secure access to your intelligent workspace for layout generation and automated feasibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card - slightly overlapping the left card on desktop */}
      <div className="col-span-12 lg:col-span-5 lg:-ml-16 relative z-10">
        <div className="rounded-[2.5rem] bg-background/80 p-2 ring-1 ring-border shadow-2xl backdrop-blur-3xl transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-[calc(2.5rem-0.5rem)] bg-card p-8 sm:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="space-y-2 mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-medium tracking-tight text-foreground">Sign In</h2>
              <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
            </div>

            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="relative rounded-2xl bg-muted/50 p-1 ring-1 ring-border">
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="name@company.com"
                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative rounded-2xl bg-muted/50 p-1 ring-1 ring-border">
                  <input 
                    name="password"
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button disabled={loading} type="submit" className="w-full rounded-2xl py-6 text-sm font-medium group transition-all duration-300 active:scale-[0.98]">
                  {loading ? "Signing In..." : "Sign In to Workspace"}
                  {!loading && (
                    <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              New to Monali?{" "}
              <Link href="/signup" className="font-medium text-foreground hover:text-primary transition-colors">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
