"use client"

import { FadeIn } from "@/components/ui/fade-in"

export default function ProjectWorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn delay={0.1}>
      {children}
    </FadeIn>
  )
}
