import { ConceptV1 } from '@/lib/validations/concept'
import { Concept, ConceptVersion } from '@prisma/client'
import { ConceptSchematic } from './ConceptSchematic'

export function ConceptCard({ concept }: { concept: Concept & { versions: ConceptVersion[] } }) {
  // concept is the Prisma Concept model which includes versions
  const version = concept.versions?.[0]
  if (!version || !version.data) return null

  const data = version.data as ConceptV1

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm mb-6 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900">{concept.name}</h3>
          <p className="mt-1 text-sm text-zinc-600 max-w-2xl">{version.rationale}</p>
        </div>
        <div className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium border border-zinc-200">
          Version {version.versionNum}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MVP Block Diagram */}
        <ConceptSchematic data={data} />

        {/* Scores */}
        <div className="flex flex-col justify-center space-y-4">
          <h4 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Concept Scores</h4>
          {Object.entries((version.scores as Record<string, number>) || {}).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="w-1/3 text-xs text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 rounded-full"
                  style={{ width: `${(value / 10) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-zinc-900">{value}/10</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 mb-2">Room Arrangement</h4>
          <p className="text-sm text-zinc-600">{data.roomArrangement}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 mb-2">Footprint Logic</h4>
          <p className="text-sm text-zinc-600">{data.footprintLogic}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 mb-2">Rule Compliance</h4>
          <ul className="text-sm text-zinc-600 space-y-1">
            <li><span className="font-medium">Setbacks:</span> {data.complianceCheck.setbacks}</li>
            <li><span className="font-medium">Coverage:</span> {data.complianceCheck.coverage}</li>
            <li><span className="font-medium">Height:</span> {data.complianceCheck.height}</li>
            <li><span className="font-medium">Parking:</span> {data.complianceCheck.parking}</li>
          </ul>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-100">
        <h4 className="text-sm font-semibold text-zinc-900 mb-2">Site Response</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <span className="block text-xs text-zinc-500 mb-1">Access</span>
            <span className="block text-sm text-zinc-900">{data.siteResponse.access}</span>
          </div>
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <span className="block text-xs text-zinc-500 mb-1">Orientation</span>
            <span className="block text-sm text-zinc-900">{data.siteResponse.orientation}</span>
          </div>
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <span className="block text-xs text-zinc-500 mb-1">Views</span>
            <span className="block text-sm text-zinc-900">{data.siteResponse.views}</span>
          </div>
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <span className="block text-xs text-zinc-500 mb-1">Slope</span>
            <span className="block text-sm text-zinc-900">{data.siteResponse.slope}</span>
          </div>
        </div>
      </div>

      {data.riskNotes.length > 0 && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">Risk Notes & Warnings</h4>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            {data.riskNotes.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
