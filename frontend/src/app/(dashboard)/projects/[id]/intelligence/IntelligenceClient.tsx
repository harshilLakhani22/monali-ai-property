'use client'

import { useState } from 'react'
import { extractIntelligence, verifyExtraction, rejectExtraction, updateExtraction } from '@/app/actions/intelligence'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Extraction = {
  id: string
  fieldKey: string
  label: string
  category: string
  value: string
  unit: string | null
  sourceText: string
  confidence: number
  verified: boolean
  rejected: boolean
  editedValue: string | null
  editedUnit: string | null
}

type AIJob = {
  id: string
  status: string
  errorLog: string | null
  createdAt: Date
  message?: string | null
}

type DocumentWithJob = {
  id: string
  fileName: string
  status: string
  intelligenceJob?: AIJob
  extractions: Extraction[]
}

export function IntelligenceClient({ 
  projectId, 
  documents 
}: { 
  projectId: string, 
  documents: DocumentWithJob[] 
}) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ value: string, unit: string }>({ value: '', unit: '' })
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

  const toggleCollapse = (id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExtract = async (documentId: string) => {
    setLoadingIds(prev => new Set(prev).add(documentId))
    await extractIntelligence(projectId, documentId)
  }

  const handleVerify = async (id: string) => {
    setActionLoading(prev => new Set(prev).add(id))
    await verifyExtraction(id, projectId)
    setActionLoading(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const handleReject = async (id: string) => {
    setActionLoading(prev => new Set(prev).add(id))
    await rejectExtraction(id, projectId, 'User rejected')
    setActionLoading(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const startEdit = (ext: Extraction) => {
    setEditingId(ext.id)
    setEditValues({
      value: ext.editedValue ?? ext.value,
      unit: ext.editedUnit ?? ext.unit ?? ''
    })
  }

  const saveEdit = async (id: string) => {
    setActionLoading(prev => new Set(prev).add(id))
    await updateExtraction(id, projectId, {
      value: editValues.value,
      unit: editValues.unit || undefined
    })
    setEditingId(null)
    setActionLoading(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-zinc-900">Extracted Intelligence</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Review AI-extracted constraints. Edit or verify them to create project constraints.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-zinc-500">No documents found in this project.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {documents.map((doc) => {
            const isExtracting = doc.intelligenceJob?.status === 'pending' || doc.intelligenceJob?.status === 'running' || loadingIds.has(doc.id)
            const hasJob = !!doc.intelligenceJob
            const jobFailed = doc.intelligenceJob?.status === 'failed'

            const isCollapsed = collapsedIds.has(doc.id)

            return (
              <div key={doc.id} className="p-1.5 rounded-3xl bg-black/5 dark:bg-white/5 border border-border">
                <div className="rounded-[calc(1.5rem-0.375rem)] border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-black/5 dark:bg-white/5 p-5 gap-4 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  onClick={() => toggleCollapse(doc.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">
                      {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{doc.fileName}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {!hasJob && <span className="capitalize">Status: {doc.status}</span>}
                        {hasJob && (
                          <span className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                            doc.intelligenceJob?.status === 'completed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                            jobFailed ? 'bg-destructive/10 text-destructive' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            Job: {doc.intelligenceJob?.status}
                          </span>
                        )}
                      </div>
                      {hasJob && doc.intelligenceJob?.message && doc.intelligenceJob?.status !== 'completed' && !jobFailed && (
                        <div className="mt-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500 animate-pulse">{doc.intelligenceJob.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    {doc.extractions.length > 0 ? (
                      <Button 
                        onClick={() => handleExtract(doc.id)} 
                        disabled={isExtracting}
                        variant="outline"
                        size="sm"
                        className="rounded-full h-9 cursor-pointer text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800/30 dark:hover:bg-blue-500/10"
                      >
                        {isExtracting ? 'Re-extracting...' : 'Re-extract'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleExtract(doc.id)} 
                        disabled={isExtracting}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full sm:w-auto cursor-pointer"
                      >
                        {isExtracting ? 'Extracting...' : 'Extract Intelligence'}
                      </Button>
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <>
                  {/* Error Log */}
                  {jobFailed && doc.intelligenceJob?.errorLog && (
                    <div className="bg-destructive/10 p-4 text-sm text-destructive border-b border-destructive/20 font-medium">
                      <span className="font-bold tracking-wide uppercase text-xs mr-2">Error:</span>{doc.intelligenceJob.errorLog}
                    </div>
                  )}

                  {/* Extractions Grid */}
                  <div className="p-5 flex-1 bg-card">
                  {doc.extractions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-black/5 dark:bg-white/5">
                      {isExtracting ? 'Analyzing document with Gemini...' : 'No data extracted yet. Click the button above to begin.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {[...doc.extractions].sort((a, b) => {
                        const getScore = (ext: Extraction) => {
                          if (ext.rejected) return 0;
                          if (!ext.verified && !ext.rejected) return 1;
                          if (ext.verified) return 2;
                          return 3;
                        };
                        return getScore(a) - getScore(b);
                      }).map(ext => {
                        const isEditing = editingId === ext.id
                        const isLoading = actionLoading.has(ext.id)
                        const finalValue = ext.editedValue ?? ext.value
                        const finalUnit = ext.editedUnit ?? ext.unit

                        return (
                          <div key={ext.id} className={`rounded-2xl border p-5 relative transition-all duration-300 ${
                            ext.rejected ? 'bg-black/5 dark:bg-white/5 border-border/50 opacity-60' :
                            ext.verified ? 'bg-green-500/5 border-green-500/20' :
                            'bg-card border-border hover:border-primary/30 hover:shadow-md'
                          }`}>
                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex gap-2">
                              {ext.rejected ? (
                                <span className="rounded-full bg-background border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Rejected</span>
                              ) : ext.verified ? (
                                <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Verified</span>
                              ) : (
                                <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Unverified</span>
                              )}
                            </div>

                            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider pr-24 leading-snug">{ext.category} &bull; {ext.label}</div>
                            
                            {/* Editing / Display */}
                            {isEditing ? (
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <input 
                                  className="w-full sm:w-24 border border-border bg-background rounded-lg px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                  value={editValues.value}
                                  onChange={e => setEditValues({...editValues, value: e.target.value})}
                                />
                                <input 
                                  className="w-full sm:w-20 border border-border bg-background rounded-lg px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                  value={editValues.unit}
                                  onChange={e => setEditValues({...editValues, unit: e.target.value})}
                                  placeholder="unit"
                                />
                                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                  <Button size="sm" variant="default" className="rounded-full h-8" onClick={() => saveEdit(ext.id)} disabled={isLoading}>Save</Button>
                                  <Button size="sm" variant="ghost" className="rounded-full h-8" onClick={() => setEditingId(null)} disabled={isLoading}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-2xl font-semibold text-foreground group flex flex-wrap items-end gap-2 mt-2">
                                {finalValue} {finalUnit && <span className="text-base font-normal text-muted-foreground mb-0.5">{finalUnit}</span>}
                                {!ext.verified && !ext.rejected && (
                                  <button onClick={() => startEdit(ext)} className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2 mb-1.5 font-medium cursor-pointer">Edit</button>
                                )}
                              </div>
                            )}

                            {/* Source */}
                            <div className="mt-5 pt-4 border-t border-border/50">
                              <div className="text-[10px] font-bold text-muted-foreground/60 mb-2 uppercase tracking-widest">Source Snippet</div>
                              <p className="text-sm text-foreground/80 italic leading-relaxed bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-border/30">
                                &quot;{ext.sourceText}&quot;
                              </p>
                            </div>
                            
                            {/* Actions Footer */}
                            <div className="mt-5 flex flex-wrap justify-between items-center text-xs text-muted-foreground gap-3">
                              <span className="font-mono">Conf: {Math.round(ext.confidence * 100)}%</span>
                              
                              <div className="flex gap-2 w-full sm:w-auto">
                                {ext.rejected ? (
                                  <Button size="sm" variant="outline" className="h-8 rounded-full flex-1 sm:flex-none cursor-pointer" onClick={() => handleVerify(ext.id)} disabled={isLoading}>Verify Instead</Button>
                                ) : ext.verified ? (
                                  <Button size="sm" variant="outline" className="h-8 rounded-full flex-1 sm:flex-none cursor-pointer" onClick={() => handleReject(ext.id)} disabled={isLoading}>Revoke</Button>
                                ) : (
                                  <>
                                    <Button size="sm" variant="outline" className="h-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 border-border flex-1 sm:flex-none cursor-pointer" onClick={() => handleReject(ext.id)} disabled={isLoading || isEditing}>Reject</Button>
                                    <Button size="sm" variant="default" className="h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none cursor-pointer" onClick={() => handleVerify(ext.id)} disabled={isLoading || isEditing}>Verify</Button>
                                  </>
                                )}
                              </div>
                            </div>

                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                  </>
                )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
