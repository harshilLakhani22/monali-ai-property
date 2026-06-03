'use client'

import { useState } from 'react'
import { generateConceptsForProject } from '@/lib/actions/concepts'

export function ConceptGenerator({ projectId, hasConcepts = false }: { projectId: string, hasConcepts?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await generateConceptsForProject(projectId)
      if (!res.success) {
        setError('Failed to generate concepts.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during generation.')
    } finally {
      setLoading(false)
    }
  }

  if (hasConcepts) {
    return (
      <div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Synthesizing...' : 'Generate New Concepts'}
        </button>
        {error && <p className="mt-2 text-sm text-red-500 text-right">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-200 bg-zinc-50 border-dashed">
      <div className="mb-4 text-zinc-400">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-zinc-900">No Concepts Yet</h3>
      <p className="mt-1 text-sm text-zinc-500 mb-6 max-w-md">
        Get started by synthesizing your verified constraints, brief, and site details into early architectural concepts.
      </p>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${hasConcepts ? '' : 'mt-2'}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Synthesizing Context...
          </>
        ) : hasConcepts ? 'Re-generate Concepts' : 'Generate Concepts v1'}
      </button>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  )
}
