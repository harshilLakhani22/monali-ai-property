'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BriefData } from '@/lib/validations/brief'
import { upsertBrief } from '@/lib/actions/brief'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function BriefBuilderForm({ projectId, initialData }: { projectId: string, initialData?: BriefData }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [data, setData] = useState<BriefData>(initialData || {})

  const handleChange = (section: keyof BriefData, field: string, value: string | number | boolean | undefined) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof BriefData] || {}),
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setShowSuccess(false)

    try {
      await upsertBrief(projectId, data)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      alert("Failed to save: " + msg)
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  const textareaClass = "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  
  // Helper to easily get a value safely
  const getValue = (section: keyof BriefData, field: string): string | number => {
    const sec = data[section] as Record<string, string | number | boolean | undefined>
    const val = sec ? sec[field] : undefined
    return (val as string | number) ?? ''
  }

  const getBool = (section: keyof BriefData, field: string): boolean => {
    const sec = data[section] as Record<string, string | number | boolean | undefined>
    const val = sec ? sec[field] : false
    return !!val
  }

  const renderSelect = (section: keyof BriefData, field: string, options: string[]) => {
    const val = String(getValue(section, field))
    return (
      <Select 
        value={val || undefined} 
        onValueChange={v => handleChange(section, field, v || '')}
      >
        <SelectTrigger className={inputClass}>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Project Intent */}
      <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
        <h3 className="font-semibold text-lg">Project Intent</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Project Type</label>
            {renderSelect("projectIntent", "projectType", ["New build", "Renovation", "Extension", "Estate concept", "Feasibility study", "Unknown"])}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Target Building Type</label>
            {renderSelect("projectIntent", "targetBuildingType", ["Single-family house", "Townhouse", "Duplex", "Small estate unit", "Mixed-use", "Unknown"])}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Storeys</label>
            {renderSelect("projectIntent", "storeys", ["Single-storey", "Double-storey", "Split-level", "Flexible / AI to recommend", "Unknown"])}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Budget Range</label>
            {renderSelect("projectIntent", "budgetRange", ["Cost-conscious", "Mid-range", "Premium", "Luxury", "Not sure yet"])}
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label className={labelClass}>Target Floor Area (m²)</label>
            <input 
              type="number" step="any"
              value={getValue('projectIntent', 'targetFloorArea')} 
              onChange={e => handleChange('projectIntent', 'targetFloorArea', e.target.value)} 
              className={inputClass} placeholder="e.g. 250" 
            />
          </div>
        </div>
      </div>

      {/* Rooms & Spaces */}
      <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
        <h3 className="font-semibold text-lg">Rooms & Spaces</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className={labelClass}>Bedrooms</label>
            <input type="number" step="1" value={getValue('roomsAndSpaces', 'bedrooms')} onChange={e => handleChange('roomsAndSpaces', 'bedrooms', e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Bathrooms</label>
            <input type="number" step="1" value={getValue('roomsAndSpaces', 'bathrooms')} onChange={e => handleChange('roomsAndSpaces', 'bathrooms', e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Garage Bays</label>
            <input type="number" step="1" value={getValue('roomsAndSpaces', 'garageBays')} onChange={e => handleChange('roomsAndSpaces', 'garageBays', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { id: 'kitchenScullery', label: 'Kitchen & Scullery' },
            { id: 'livingDining', label: 'Living & Dining' },
            { id: 'studyOffice', label: 'Study / Office' },
            { id: 'guestRoom', label: 'Guest Room' },
            { id: 'staffRoom', label: 'Staff Quarters' },
            { id: 'storage', label: 'Storage Room' },
            { id: 'outdoorPatio', label: 'Outdoor Patio' },
            { id: 'braaiArea', label: 'Braai Area' },
            { id: 'pool', label: 'Swimming Pool' },
          ].map(item => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={getBool('roomsAndSpaces', item.id)} 
                onChange={e => handleChange('roomsAndSpaces', item.id, e.target.checked)}
                className="w-4 h-4 text-primary rounded border-zinc-300 focus:ring-primary"
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
          <label className={labelClass}>Garden & Landscaping Requirements</label>
          <textarea 
            value={getValue('roomsAndSpaces', 'gardenRequirements')} 
            onChange={e => handleChange('roomsAndSpaces', 'gardenRequirements', e.target.value)} 
            className={textareaClass} placeholder="e.g. Large lawn for dogs, indigenous plants..." 
          />
        </div>
      </div>

      {/* Design Preferences */}
      <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
        <h3 className="font-semibold text-lg">Design Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Architectural Style</label>
            {renderSelect("designPreferences", "architecturalStyle", ["Modern", "Contemporary", "Farmhouse", "Minimal", "Estate guideline compliant", "Natural / stone / timber", "AI to recommend", "Unknown"])}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Roof Preference</label>
            {renderSelect("designPreferences", "roofPreference", ["Pitched roof", "Flat roof", "Mixed roof", "Estate guideline compliant", "AI to recommend", "Unknown"])}
          </div>
          <div className="space-y-2 col-span-2">
            <label className={labelClass}>Preferred Materials / Finishes</label>
            <input 
              value={getValue('designPreferences', 'preferredMaterials')} 
              onChange={e => handleChange('designPreferences', 'preferredMaterials', e.target.value)} 
              className={inputClass} placeholder="e.g. Off-shutter concrete, timber cladding, black aluminum" 
            />
          </div>
        </div>
      </div>

      {/* Priorities */}
      <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
        <h3 className="font-semibold text-lg">Priorities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-2 col-span-2 sm:col-span-3 pb-4 border-b border-border/50">
            <label className={labelClass}>Primary Design Driver</label>
            {renderSelect("priorities", "designPriority", ["Maximum floor area", "Best views", "Best privacy", "Best natural light", "Cost efficiency", "Fast approval", "Balanced"])}
          </div>
          
          {[
            { id: 'privacyPriority', label: 'Privacy' },
            { id: 'viewPriority', label: 'Views' },
            { id: 'naturalLightPriority', label: 'Natural Light' },
            { id: 'sustainabilityPriority', label: 'Sustainability' },
            { id: 'costControlPriority', label: 'Cost Control' },
          ].map(item => (
            <div key={item.id} className="space-y-2">
              <label className={labelClass}>{item.label}</label>
              {renderSelect("priorities", item.id, ["Low", "Medium", "High"])}
            </div>
          ))}
        </div>
      </div>

      {/* Special Requirements */}
      <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
        <h3 className="font-semibold text-lg">Special Requirements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer col-span-1 sm:col-span-2 mb-2">
            <input 
              type="checkbox" 
              checked={getBool('specialRequirements', 'rentalInvestmentUse')} 
              onChange={e => handleChange('specialRequirements', 'rentalInvestmentUse', e.target.checked)}
              className="w-4 h-4 text-primary rounded border-zinc-300 focus:ring-primary"
            />
            <span className="text-sm font-medium">Rental / Investment Property Focus</span>
          </label>

          <div className="space-y-2">
            <label className={labelClass}>Family & Lifestyle Notes</label>
            <textarea value={getValue('specialRequirements', 'familyLifestyleNotes')} onChange={e => handleChange('specialRequirements', 'familyLifestyleNotes', e.target.value)} className={textareaClass} placeholder="e.g. Needs open plan for entertaining, elderly parents..." />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Accessibility Needs</label>
            <textarea value={getValue('specialRequirements', 'accessibilityNeeds')} onChange={e => handleChange('specialRequirements', 'accessibilityNeeds', e.target.value)} className={textareaClass} placeholder="e.g. Wheelchair access, single level only..." />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Must Have Items</label>
            <textarea value={getValue('specialRequirements', 'mustHaveItems')} onChange={e => handleChange('specialRequirements', 'mustHaveItems', e.target.value)} className={textareaClass} placeholder="e.g. Fireplace, solar panels, wine cellar..." />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Avoid Items (Dealbreakers)</label>
            <textarea value={getValue('specialRequirements', 'avoidItems')} onChange={e => handleChange('specialRequirements', 'avoidItems', e.target.value)} className={textareaClass} placeholder="e.g. No facebrick, no small windows..." />
          </div>
          <div className="space-y-2 col-span-1 sm:col-span-2">
            <label className={labelClass}>Future Extensions</label>
            <input value={getValue('specialRequirements', 'futureExtension')} onChange={e => handleChange('specialRequirements', 'futureExtension', e.target.value)} className={inputClass} placeholder="e.g. Plan for future flatlet on top of garage" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Brief"}
        </Button>
        {showSuccess && <span className="text-sm font-medium text-green-600 dark:text-green-400">Successfully saved!</span>}
      </div>

    </form>
  )
}
