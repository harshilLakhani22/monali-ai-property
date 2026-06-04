'use client'

import { ConceptVersion, CostEstimate, Concept } from '@prisma/client'
import { CostEstimateData } from '@/lib/validations/costing'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'

export function CostEstimateCard({
  estimate,
  conceptVersion
}: {
  estimate: CostEstimate
  conceptVersion: ConceptVersion & { concept: Concept }
}) {
  const data = estimate.data as unknown as CostEstimateData
  if (!data) return null

  const { breakdown, narrative, budgetAlignment, missingInputs } = data

  const formatMoney = (val: number) => {
    return 'R ' + val.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const rangeMin = (estimate.totalRange as { min?: number })?.min || 0
  const rangeMax = (estimate.totalRange as { max?: number })?.max || 0

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-6 bg-zinc-50 border-b border-zinc-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900">{conceptVersion.concept.name}</h3>
            <p className="text-sm text-zinc-500 mt-1">Cost Estimate v{conceptVersion.versionNum}</p>
          </div>
          {budgetAlignment === 'under_budget' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Under Budget
            </span>
          )}
          {budgetAlignment === 'within_budget' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Within Budget
            </span>
          )}
          {budgetAlignment === 'above_budget' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              <TrendingUp className="w-3.5 h-3.5" /> Above Budget
            </span>
          )}
          {budgetAlignment === 'unknown' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
              <AlertCircle className="w-3.5 h-3.5" /> Budget Unknown
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-zinc-500 mb-1">Estimated Build Range</p>
          <div className="text-3xl font-bold tracking-tight text-zinc-900">
            {formatMoney(rangeMin)} <span className="text-zinc-400 font-medium text-2xl mx-1">-</span> {formatMoney(rangeMax)}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Base Area: <span className="font-medium text-zinc-700">{estimate.area}m²</span> @ <span className="font-medium text-zinc-700">{formatMoney(estimate.ratePerM2 || 0)}/m²</span>
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        
        {/* Missing Inputs Warning */}
        {missingInputs && missingInputs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Missing Inputs / Assumptions</p>
                <ul className="mt-2 list-disc pl-4 space-y-1 text-xs text-amber-700">
                  {missingInputs.map((input, idx) => (
                    <li key={idx}>{input}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown Table */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 mb-3">Cost Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <span className="text-zinc-500">Base Construction</span>
              <span className="font-medium text-zinc-900">{formatMoney(breakdown.baseConstruction)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <span className="text-zinc-500">Garage / Parking</span>
              <span className="font-medium text-zinc-900">{formatMoney(breakdown.garage)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <span className="text-zinc-500">External Works (Allowance)</span>
              <span className="font-medium text-zinc-900">{formatMoney(breakdown.externalWorks)}</span>
            </div>
            {breakdown.slopeRisk > 0 && (
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 text-amber-700">
                <span>Slope / Retaining Premium</span>
                <span className="font-medium">+{formatMoney(breakdown.slopeRisk)}</span>
              </div>
            )}
            {breakdown.complexityRisk > 0 && (
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 text-amber-700">
                <span>Design Complexity Premium</span>
                <span className="font-medium">+{formatMoney(breakdown.complexityRisk)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <span className="text-zinc-500">Contingency (10%)</span>
              <span className="font-medium text-zinc-900">{formatMoney(breakdown.contingency)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-medium text-zinc-900">Total Base Estimate</span>
              <span className="font-bold text-zinc-900">{formatMoney(breakdown.total)}</span>
            </div>
          </div>
        </div>

        {/* AI Narrative */}
        <div className="bg-zinc-50 rounded-xl p-4 mt-auto">
          <h4 className="text-sm font-semibold text-zinc-900 mb-2">Cost Drivers</h4>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">{narrative.costDrivers}</p>
          
          <h4 className="text-sm font-semibold text-zinc-900 mb-2">Risk Factors</h4>
          <p className="text-sm text-zinc-600 leading-relaxed">{narrative.riskFactors}</p>
        </div>

      </div>
    </div>
  )
}
