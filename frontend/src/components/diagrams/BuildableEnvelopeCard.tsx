'use client'

import React from 'react'
import type { Constraint } from '@prisma/client'

interface BuildableEnvelopeCardProps {
  standData: Record<string, string | number | null | undefined>;
  constraints?: Constraint[];
}

export function BuildableEnvelopeCard({ standData, constraints = [] }: BuildableEnvelopeCardProps) {
  // Extract useful info
  const roadAccess = String(standData.roadAccessSide || 'Unknown')
  const roadLower = roadAccess.toLowerCase()
  const isNorthAccess = roadLower.includes('north')
  const isSouthAccess = roadLower.includes('south')
  const isEastAccess = roadLower.includes('east')
  const isWestAccess = roadLower.includes('west')

  let roadAccessTextProps = { x: 50, y: 92, transform: "", text: `↑ Road Access: ${roadAccess}` };
  if (isNorthAccess) {
    roadAccessTextProps = { x: 50, y: 10, transform: "", text: `↓ Road Access: ${roadAccess}` };
  } else if (isEastAccess) {
    roadAccessTextProps = { x: 92, y: 50, transform: "rotate(90 92,50)", text: `↓ Road Access: ${roadAccess}` };
  } else if (isWestAccess) {
    roadAccessTextProps = { x: 8, y: 50, transform: "rotate(-90 8,50)", text: `↓ Road Access: ${roadAccess}` };
  } else if (isSouthAccess) {
    roadAccessTextProps = { x: 50, y: 92, transform: "", text: `↑ Road Access: ${roadAccess}` };
  }

  const northDirection = standData.northDirection || 'Unknown'
  const standArea = standData.standArea || 'Unknown'
  const slope = standData.slopeCondition || 'Unknown'
  const siteRisks = standData.siteRisks || ''

  const setbackConstraints = constraints.filter(c => 
    c.type.toLowerCase().includes('setback') || 
    c.type.toLowerCase().includes('boundary') || 
    c.type.toLowerCase().includes('building line') ||
    c.value.toLowerCase().includes('setback')
  )
  const coverageConstraints = constraints.filter(c => 
    c.type.toLowerCase().includes('coverage') || 
    c.type.toLowerCase().includes('far') || 
    c.type.toLowerCase().includes('bulk') ||
    c.type.toLowerCase().includes('height') ||
    c.type.toLowerCase().includes('storeys')
  )

  return (
    <div className="h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="bg-primary/5 border-b pb-4 p-6 space-y-1.5">
        <h3 className="font-semibold leading-none tracking-tight">Conceptual Buildable Envelope</h3>
        <p className="text-sm text-muted-foreground">Visual approximation based on verified site constraints.</p>
      </div>
      <div className="p-6 space-y-6">
        
        <div className="relative w-full aspect-square max-w-[300px] mx-auto bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-800">
            {/* Stand Boundary */}
            <rect x="15" y="15" width="70" height="70" fill="white" stroke="currentColor" strokeWidth="1" className="text-zinc-300" />
            
            {/* Road Access Highlights */}
            {isNorthAccess && <line x1="15" y1="15" x2="85" y2="15" stroke="currentColor" strokeWidth="3" className="text-orange-500" />}
            {isSouthAccess && <line x1="15" y1="85" x2="85" y2="85" stroke="currentColor" strokeWidth="3" className="text-orange-500" />}
            {isEastAccess && <line x1="85" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="3" className="text-orange-500" />}
            {isWestAccess && <line x1="15" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="3" className="text-orange-500" />}

            {/* Stand Label */}
            <text x="50" y={isNorthAccess ? 96 : 12} fontSize="4" textAnchor="middle" fill="currentColor" className="text-zinc-400">Stand Boundary</text>

            {/* Buildable Zone */}
            <rect x="25" y="25" width="50" height="50" fill="currentColor" className="text-primary/10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
            <text x="50" y="50" fontSize="5" textAnchor="middle" fill="currentColor" className="text-primary font-medium" dominantBaseline="middle">Buildable Zone</text>
            
            {/* Road Access indicator */}
            {roadAccess !== 'Unknown' && (
               <text 
                 x={roadAccessTextProps.x} 
                 y={roadAccessTextProps.y} 
                 transform={roadAccessTextProps.transform}
                 fontSize="4" textAnchor="middle" fill="currentColor" className="text-orange-500 font-bold"
               >
                 {roadAccessTextProps.text}
               </text>
            )}

            {/* North Arrow */}
            {northDirection !== 'Unknown' && (
               <g transform="translate(85, 15)">
                 <path d="M0 -5 L-3 3 L0 1 L3 3 Z" fill="currentColor" className="text-blue-500" />
                 <text x="0" y="8" fontSize="4" textAnchor="middle" fill="currentColor" className="text-blue-600 font-bold">N</text>
               </g>
            )}
          </svg>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-zinc-900 mb-1">Coverage & Allowances</h4>
            {coverageConstraints.length > 0 ? (
              <ul className="list-disc pl-4 text-zinc-600 space-y-1">
                {coverageConstraints.map(c => (
                  <li key={c.id}>
                    {c.value.toLowerCase().includes('coverage') || c.type.toLowerCase().includes('coverage') ? 
                      (c.value.toLowerCase().startsWith('max') ? c.value : `Max coverage: ${c.value}`) : 
                      c.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 italic">No verified coverage constraints found.</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 mb-1">Setbacks & Building Lines</h4>
            {setbackConstraints.length > 0 ? (
              <div className="text-zinc-600 space-y-1">
                <p className="text-zinc-500 mb-1">Detected setback / building line values:</p>
                <ul className="list-disc pl-4">
                  {setbackConstraints.map(c => <li key={c.id}>{c.type}: {c.value}</li>)}
                </ul>
              </div>
            ) : (
              <p className="text-zinc-500 italic">No verified setback constraints found.</p>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-zinc-600"><span className="font-medium">Area:</span> {standArea} m²</p>
            <p className="text-zinc-600"><span className="font-medium">Slope:</span> {slope}</p>
            {siteRisks && siteRisks !== 'None noted' && (
              <p className="text-orange-600"><span className="font-medium">Risks:</span> {siteRisks}</p>
            )}
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 italic text-center mt-6 leading-tight">
          *Conceptual planning diagram only. Not a survey, CAD drawing, municipal submission, or legal site plan.
        </p>
      </div>
    </div>
  )
}
