/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react"
import { Report } from "@prisma/client"
import {
  FileOutput, RefreshCcw, Printer, AlertTriangle,
  MapPin, Building2, ClipboardList, Lightbulb,
  DollarSign, ShieldCheck, ChevronDown, ChevronUp,
  TrendingUp, CheckCircle2, ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import { generateFinalReport } from "@/lib/actions/report"
import { ConceptSchematic } from "../concepts/ConceptSchematic"
import { BuildableEnvelopeCard } from "@/components/diagrams/BuildableEnvelopeCard"

// Inject global @media print CSS once to hide the app shell
const PRINT_CSS = `
@media print {
  @page { margin: 12mm 10mm; size: A4 portrait; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { background: white !important; }

  /* Hide sidebar, header, mobile nav, project nav, toolbar */
  [data-sidebar], [data-header], [data-mobile-nav],
  .print-hide { display: none !important; }

  /* Remove layout shell constraints so content flows freely */
  [data-dashboard-shell] {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: 0 !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  [data-dashboard-main] {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  main {
    overflow: visible !important;
    padding: 0 !important;
  }
  main > div { max-width: 100% !important; }
}
`

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatZAR(n: number) {
  return `R ${(n / 1_000_000).toFixed(1)}M`
}

function camelToLabel(s: string) {
  return s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
}

const CONSTRAINT_COLORS: Record<string, string> = {
  setback: 'bg-blue-100 text-blue-800',
  coverage: 'bg-violet-100 text-violet-800',
  zoning: 'bg-emerald-100 text-emerald-800',
  height: 'bg-orange-100 text-orange-800',
  boundary: 'bg-red-100 text-red-800',
  garage: 'bg-yellow-100 text-yellow-800',
  landscape: 'bg-green-100 text-green-800',
  stand_schedule: 'bg-zinc-100 text-zinc-700',
  site_condition: 'bg-rose-100 text-rose-800',
}

function ConstraintBadge({ category }: { category: string }) {
  const cls = CONSTRAINT_COLORS[category] ?? 'bg-zinc-100 text-zinc-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {category.replace(/_/g, ' ')}
    </span>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 10) * 100)
  const color = value >= 8 ? 'bg-emerald-500' : value >= 6 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-32 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-zinc-700 w-6 text-right">{value}</span>
    </div>
  )
}

function SectionHeader({ num, icon, title }: { num: string; icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white shrink-0">
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{num}</span>
        <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-1 text-left group print:hidden"
      >
        <span className="text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-xs text-zinc-400 font-normal">({count})</span>
          )}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
      </button>
      {open && children}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ReportClientView({
  projectId,
  initialReport,
  projectName,
  stand,
  constraints
}: {
  projectId: string
  initialReport: Report | null
  projectName: string
  stand?: any
  constraints?: any[]
}) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      const res = await generateFinalReport(projectId)
      if (res.success) {
        toast.success("Report generated successfully")
        window.location.reload()
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!initialReport || !initialReport.data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border-2 border-dashed border-zinc-200 print:hidden">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-5">
          <FileOutput className="w-7 h-7 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Report Generated Yet</h3>
        <p className="text-sm text-zinc-500 text-center max-w-xs mb-7">
          Compile all verified constraints, concept options, and feasibility costs into a single printable summary.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {isGenerating
            ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Generating…</>
            : <><Lightbulb className="w-4 h-4" /> Generate Final Report</>}
        </button>
      </div>
    )
  }

  const data = initialReport.data as any

  // Group constraints by category
  const constraintsByCategory: Record<string, any[]> = {}
  for (const c of (data.constraints ?? [])) {
    const key = c.category ?? 'other'
    if (!constraintsByCategory[key]) constraintsByCategory[key] = []
    constraintsByCategory[key].push(c)
  }

  return (
    <div id="report-print-root" className="space-y-4">
      {/* Inject global print CSS that hides sidebar/nav */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      {/* Toolbar */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <p className="text-xs text-zinc-400">
            Last updated: {new Date((initialReport as any).updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-4 items-start">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors h-8 mt-0.5"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <div className="flex flex-col items-end">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors h-8"
            >
              <Printer className="w-3.5 h-3.5" />
              Print (PDF)
            </button>
            <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">For clean PDF, disable browser headers and footers in print settings.</span>
          </div>
        </div>
      </div>

      {/* ── PRINT DOCUMENT ── */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">

        {/* Cover */}
        <div className="bg-zinc-900 px-10 py-10 print:py-14">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Monali AI · Conceptual Feasibility</p>
          <h1 className="text-3xl font-bold text-white mb-1">{projectName}</h1>
          <p className="text-zinc-300 text-base mb-5">Final Feasibility Report</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {data.constraints?.length ?? 0} verified constraints
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              {data.concepts?.length ?? 0} concept options
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Preliminary cost estimates
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-4">Generated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-10 py-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Important:</strong> This is a <strong>conceptual feasibility report</strong> for preliminary review only. It does not contain final architecture, CAD, BIM, or a detailed Bill of Quantities. Cost estimates are high-level ranges and are not suitable for municipal submission.
          </p>
        </div>

        <div className="px-10 py-10 space-y-10 print:space-y-8">

          {/* 1. Executive Summary */}
          <section>
            <SectionHeader num="01" icon={<ClipboardList className="w-4 h-4" />} title="Executive Summary" />
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {data.executiveSummary?.narrative}
              </p>
            </div>
          </section>

          {/* 2. Site Summary */}
          <section className="print:break-inside-avoid">
            <SectionHeader num="02" icon={<MapPin className="w-4 h-4" />} title="Site Summary" />
            
            {stand && constraints && (
              <div className="mb-6">
                <BuildableEnvelopeCard standData={stand} constraints={constraints} />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Erf Number', value: data.siteSummary?.erfNumber },
                { label: 'Stand Area', value: data.siteSummary?.standArea },
                { label: 'Coordinates', value: data.siteSummary?.coordinates },
                { label: 'Road Access', value: data.siteSummary?.roadAccess },
                { label: 'Orientation', value: data.siteSummary?.northOrientation },
                { label: 'Slope Condition', value: data.siteSummary?.slope },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-zinc-900">{value || '—'}</p>
                </div>
              ))}
            </div>
            {data.siteSummary?.siteRisks?.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-rose-700 mb-1.5">⚠ Site Risks Identified</p>
                <ul className="space-y-1">
                  {data.siteSummary.siteRisks.map((r: string, i: number) => (
                    <li key={i} className="text-xs text-rose-700 flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* 3. Verified Constraints */}
          <section>
            <SectionHeader num="03" icon={<ShieldCheck className="w-4 h-4" />} title="Verified Planning & Design Constraints" />
            {Object.keys(constraintsByCategory).length > 0 ? (
              <div className="overflow-hidden border border-zinc-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-2.5 w-36">Category</th>
                      <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-2.5">Rules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {Object.entries(constraintsByCategory).map(([category, items]) => (
                      <tr key={category} className="align-top">
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <ConstraintBadge category={category} />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {items.map((c: any, i: number) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                {c.description}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No verified constraints found.</p>
            )}
          </section>

          {/* 4. Client Brief */}
          <section className="print:break-inside-avoid">
            <SectionHeader num="04" icon={<Building2 className="w-4 h-4" />} title="Client Brief Summary" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Building Type', value: data.briefSummary?.buildingType === 'Unknown' ? null : data.briefSummary?.buildingType },
                { label: 'Storeys', value: data.briefSummary?.storeys === 0 ? null : data.briefSummary?.storeys },
                { label: 'Target Floor Area', value: data.briefSummary?.targetFloorArea ? `${data.briefSummary.targetFloorArea} m²` : null },
                { label: 'Style Preferences', value: data.briefSummary?.stylePreferences === 'None specified' ? null : (typeof data.briefSummary?.stylePreferences === 'object' ? JSON.stringify(data.briefSummary.stylePreferences) : data.briefSummary?.stylePreferences) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
                  {value ? (
                    <p className="text-sm font-semibold text-zinc-900">{value}</p>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Missing Input</span>
                  )}
                </div>
              ))}
            </div>
            {data.briefSummary?.specialRequirements && (
              <div className="border border-zinc-100 rounded-xl overflow-hidden">
                <CollapsibleSection title="Special Requirements">
                  <div className="px-4 py-3 space-y-1.5">
                    {typeof data.briefSummary.specialRequirements === 'object'
                      ? Object.entries(data.briefSummary.specialRequirements).map(([k, v]: [string, any]) =>
                        v && v !== false
                          ? (
                            <div key={k} className="text-xs text-zinc-700 flex items-start gap-2">
                              <span className="text-zinc-400 font-medium shrink-0 min-w-[120px]">{camelToLabel(k)}:</span>
                              <span>{typeof v === 'boolean' ? 'Yes' : String(v)}</span>
                            </div>
                          ) : null
                      )
                      : <p className="text-xs text-zinc-700">{String(data.briefSummary.specialRequirements)}</p>
                    }
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </section>

          {/* 5 & 6. Concepts + Costs */}
          <section>
            <SectionHeader num="05–06" icon={<Lightbulb className="w-4 h-4" />} title="Concept Options & Cost Comparison" />
            {data.concepts?.length > 0 ? (
              <div className="space-y-6">
                {data.concepts.map((concept: any, i: number) => (
                  <div key={i} className="border border-zinc-200 rounded-2xl overflow-hidden print:break-inside-avoid">
                    {/* Concept Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-white border-b border-zinc-100 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Option {i + 1}</span>
                        </div>
                        <h4 className="text-base font-bold text-zinc-900">{concept.name}</h4>
                        <p className="text-xs text-zinc-500 mt-1 max-w-lg leading-relaxed">{concept.rationale}</p>
                      </div>
                      {concept.costEstimate && (
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-zinc-400 mb-0.5">Est. Cost Range</p>
                          <p className="text-base font-bold text-zinc-900">
                            {formatZAR(concept.costEstimate.rangeMin)} – {formatZAR(concept.costEstimate.rangeMax)}
                          </p>
                          <p className="text-xs text-zinc-400">{concept.costEstimate.currency}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                      {/* Design Details */}
                      <div className="px-5 py-4 md:col-span-1">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Design Details</p>
                        {concept.roomArrangement && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-zinc-400 mb-0.5">Room Arrangement</p>
                            <p className="text-xs text-zinc-700 leading-relaxed">{concept.roomArrangement}</p>
                          </div>
                        )}
                        {concept.siteResponse && typeof concept.siteResponse === 'object' && (
                          <div>
                            <p className="text-xs font-medium text-zinc-400 mb-1">Site Response</p>
                            <ul className="space-y-0.5">
                              {Object.entries(concept.siteResponse).map(([k, v]: [string, any]) => (
                                <li key={k} className="text-xs text-zinc-700">
                                  <span className="capitalize font-medium text-zinc-500">{k}: </span>{String(v)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Scores */}
                      {concept.scores && (
                        <div className="px-5 py-4 md:col-span-1">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Design Scores</p>
                          <div className="space-y-2.5">
                            {Object.entries(concept.scores).map(([k, v]: [string, any]) => (
                              <ScoreBar key={k} label={camelToLabel(k)} value={v} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cost Breakdown */}
                      {concept.costEstimate && (
                        <div className="px-5 py-4 md:col-span-1">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Cost Breakdown</p>
                          <div className="space-y-1.5">
                            {Object.entries(concept.costEstimate.breakdown ?? {}).map(([k, v]: [string, any]) =>
                              v > 0 ? (
                                <div key={k} className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className="font-medium text-zinc-800">R {Number(v).toLocaleString()}</span>
                                </div>
                              ) : null
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Confidence</span>
                            <span className={`font-bold ${concept.costEstimate.confidenceScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {concept.costEstimate.confidenceScore}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-zinc-500">Base Area</span>
                            <span className="font-medium text-zinc-800">{concept.costEstimate.baseArea} m²</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-zinc-500">Rate / m²</span>
                            <span className="font-medium text-zinc-800">R {concept.costEstimate.ratePerM2?.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {concept.rawConceptData?.exteriorDirection && (
                      <div className="px-5 py-5 border-t border-zinc-100 bg-white print:break-inside-avoid">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Exterior Visual Direction</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                            <span className="block text-xs text-zinc-500 mb-1">Style</span>
                            <span className="block text-sm text-zinc-900">{concept.rawConceptData.exteriorDirection.styleSummary}</span>
                          </div>
                          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                            <span className="block text-xs text-zinc-500 mb-1">Materials</span>
                            <span className="block text-sm text-zinc-900">{concept.rawConceptData.exteriorDirection.materialPalette}</span>
                          </div>
                          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                            <span className="block text-xs text-zinc-500 mb-1">Roof Language</span>
                            <span className="block text-sm text-zinc-900">{concept.rawConceptData.exteriorDirection.roofLanguage}</span>
                          </div>
                          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                            <span className="block text-xs text-zinc-500 mb-1">Landscape</span>
                            <span className="block text-sm text-zinc-900">{concept.rawConceptData.exteriorDirection.landscapeNotes}</span>
                          </div>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                          <span className="block text-xs text-primary font-medium mb-1">AI Render Prompt (Phase 11/12)</span>
                          <span className="block text-sm text-zinc-700 italic">&quot;{concept.rawConceptData.exteriorDirection.aiRenderPrompt}&quot;</span>
                        </div>
                      </div>
                    )}
                    {concept.rawConceptData && (
                      <div className="px-5 py-5 border-t border-zinc-100 bg-white print:break-inside-avoid">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Conceptual Schematic Block Layout</p>
                        <ConceptSchematic data={concept.rawConceptData} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No concepts generated yet.</p>
            )}
          </section>

          {/* 7. Risks & Assumptions */}
          <section className="print:break-inside-avoid">
            <SectionHeader num="07" icon={<AlertTriangle className="w-4 h-4" />} title="Risks, Assumptions & Missing Inputs" />
            {data.missingInputs?.length > 0 ? (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-4 mb-4">
                <p className="text-xs font-semibold text-red-700 mb-2">Missing Inputs</p>
                <ul className="space-y-1">
                  {data.missingInputs.map((input: string, i: number) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />{input}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">No critical missing inputs flagged.</p>
              </div>
            )}
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-zinc-600 mb-2">General Assumptions</p>
              <ul className="space-y-1">
                {[
                  "CAD/measured areas have not been finalized.",
                  "Contractor rates and professional fees are not included in these estimates.",
                  "A formal land survey and geotechnical report may still be required.",
                  "Cost estimates are preliminary feasibility ranges only."
                ].map((a, i) => (
                  <li key={i} className="text-xs text-zinc-600 flex items-start gap-1.5">
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-zinc-400" />{a}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 8. Next Steps */}
          <section className="print:break-inside-avoid">
            <SectionHeader num="08" icon={<DollarSign className="w-4 h-4" />} title="Recommended Next Steps" />
            <div className="space-y-2">
              {data.nextSteps?.map((step: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-zinc-700">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-400">
              This report was automatically generated by Monali AI and is for internal feasibility review purposes only. All data is sourced from verified project inputs. Not for public distribution or municipal submission.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
