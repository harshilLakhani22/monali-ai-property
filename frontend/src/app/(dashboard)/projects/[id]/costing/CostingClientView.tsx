'use client'

import { useState } from 'react'
import { generateCostEstimate } from '@/lib/actions/costing'
import { CostEstimateCard } from './CostEstimateCard'
import { Loader2, Calculator } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ConceptVersion, Concept, CostEstimate } from '@prisma/client'

export function CostingClientView({ projectId, conceptVersions }: { projectId: string, conceptVersions: Array<ConceptVersion & { concept: Concept; costEstimate?: CostEstimate | null }> }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const promises = conceptVersions.map(v => generateCostEstimate(projectId, v.id))
      await Promise.all(promises)
      toast.success("Cost estimates generated successfully!")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate cost estimates. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const allHaveEstimates = conceptVersions.every(v => !!v.costEstimate)

  return (
    <div className="space-y-8">
      {!allHaveEstimates && (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <Calculator className="w-12 h-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">Estimates Pending</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            Click below to calculate feasibility-level cost estimates for all generated concepts based on your brief, site data, and current market rates.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || conceptVersions.length === 0}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              'Calculate Cost Estimates'
            )}
          </button>
        </div>
      )}

      {conceptVersions.some(v => !!v.costEstimate) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {conceptVersions.filter(v => !!v.costEstimate).map(version => (
            <CostEstimateCard
              key={version.id}
              conceptVersion={version}
              estimate={version.costEstimate!}
            />
          ))}
        </div>
      )}
      
      {allHaveEstimates && conceptVersions.length > 0 && (
         <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-9 px-4 py-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recalculating...
                </>
              ) : (
                'Recalculate Estimates'
              )}
            </button>
         </div>
      )}
    </div>
  )
}
