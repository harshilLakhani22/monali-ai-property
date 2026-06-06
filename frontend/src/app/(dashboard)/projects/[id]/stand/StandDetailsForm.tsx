'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertStandDetails } from '@/lib/actions/stand'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function StandDetailsForm({ projectId, initialData }: { projectId: string, initialData: Partial<import('@prisma/client').Stand> }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [initialState] = useState({
    erfNumber: initialData?.erfNumber || '',
    standArea: initialData?.standArea || '',
    standType: initialData?.standType || '',
    googlePinUrl: initialData?.googlePinUrl || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    roadAccessSide: initialData?.roadAccessSide || '',
    northDirection: initialData?.northDirection || '',
    northAngleDeg: initialData?.northAngleDeg || '',
    slopeCondition: initialData?.slopeCondition || '',
    contourNotes: initialData?.contourNotes || '',
    viewDirection: initialData?.viewDirection || '',
    privacyNotes: initialData?.privacyNotes || '',
    siteRisks: initialData?.siteRisks || ''
  })

  const [formData, setFormData] = useState(initialState)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialState)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setShowSuccess(false)

    // Convert strings to floats where needed
    const payload = {
      ...formData,
      standArea: formData.standArea ? Number(formData.standArea) : null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      northAngleDeg: formData.northAngleDeg ? Number(formData.northAngleDeg) : null,
    }

    const result = await upsertStandDetails(projectId, payload)
    
    setIsSaving(false)
    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      router.refresh()
    } else {
      alert("Failed to save: " + result.error)
    }
  }

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  const textareaClass = "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const renderSelect = (name: keyof typeof formData, placeholder: string, options: string[]) => {
    const val = formData[name] as string
    return (
      <Select 
        value={val || undefined} 
        onValueChange={v => setFormData({ ...formData, [name]: v || '' })}
      >
        <SelectTrigger className={inputClass}>
          <SelectValue placeholder={placeholder} />
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
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Stand Identity */}
          <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
            <h3 className="font-semibold text-lg">Basic Stand Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Erf / Stand Number</label>
                <input name="erfNumber" value={formData.erfNumber} onChange={handleChange} className={inputClass} placeholder="e.g. Erf 1234" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Stand Area (m²)</label>
                <input name="standArea" type="number" step="any" value={formData.standArea} onChange={handleChange} className={inputClass} placeholder="e.g. 500" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className={labelClass}>Stand Type</label>
                {renderSelect("standType", "Select Type...", ["Standard", "Premium", "Corner", "Narrow", "Sloped", "Irregular", "Unknown"])}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
            <h3 className="font-semibold text-lg">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className={labelClass}>Google Maps Pin URL</label>
                <input name="googlePinUrl" value={formData.googlePinUrl} onChange={handleChange} className={inputClass} placeholder="https://maps.google.com/..." />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Latitude</label>
                <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} className={inputClass} placeholder="-33.9249" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Longitude</label>
                <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} className={inputClass} placeholder="18.4241" />
              </div>
            </div>
          </div>

          {/* Access & Orientation */}
          <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
            <h3 className="font-semibold text-lg">Access & Orientation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Road Access Side</label>
                {renderSelect("roadAccessSide", "Select Access...", ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West", "Multiple", "Unknown"])}
              </div>
              <div className="space-y-2">
                <label className={labelClass}>North Direction</label>
                {renderSelect("northDirection", "Select North...", ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West", "Unknown"])}
              </div>
              <div className="space-y-2 col-span-2">
                <label className={labelClass}>North Angle (Degrees) - Optional</label>
                <input name="northAngleDeg" type="number" step="any" value={formData.northAngleDeg} onChange={handleChange} className={inputClass} placeholder="e.g. 15.5" />
              </div>
            </div>
          </div>

          {/* Slope & Terrain */}
          <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
            <h3 className="font-semibold text-lg">Slope & Terrain</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Slope Condition</label>
                {renderSelect("slopeCondition", "Select Slope...", ["Flat", "Gentle", "Moderate", "Steep", "Terraced", "Unknown"])}
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Contour Notes</label>
                <textarea name="contourNotes" value={formData.contourNotes} onChange={handleChange} className={textareaClass} placeholder="Describe any major dips, retaining walls, or platforms..." />
              </div>
            </div>
          </div>

          {/* Views & Context */}
          <div className="space-y-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
            <h3 className="font-semibold text-lg">Views, Privacy & Risks</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>View Direction & Notes</label>
                <textarea name="viewDirection" value={formData.viewDirection} onChange={handleChange} className={textareaClass} placeholder="Where are the best views located?" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Privacy Notes</label>
                <textarea name="privacyNotes" value={formData.privacyNotes} onChange={handleChange} className={textareaClass} placeholder="Neighbouring double-storeys? Overlooking issues?" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Site Risks</label>
                <textarea name="siteRisks" value={formData.siteRisks} onChange={handleChange} className={textareaClass} placeholder="Large trees, servitudes, flood lines, bad soil..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSaving || !isDirty}>
              {isSaving ? "Saving..." : "Save Site Details"}
            </Button>
            {showSuccess && <span className="text-sm font-medium text-green-600 dark:text-green-400">Successfully saved!</span>}
          </div>
        </form>
      </div>

      <div className="md:col-span-1">
        <div className="sticky top-6 p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <h3 className="font-semibold text-lg mb-4 text-primary">Site Intelligence Summary</h3>
          {formData.erfNumber ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Stand</p>
                <p className="font-medium">{formData.erfNumber} {formData.standType ? `(${formData.standType})` : ''}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{formData.standArea ? `${formData.standArea} m²` : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Topography</p>
                <p className="font-medium">{formData.slopeCondition || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Orientation</p>
                <p className="font-medium">
                  {formData.northDirection ? `North faces ${formData.northDirection}` : 'Unknown'}
                  {formData.northAngleDeg ? ` (${formData.northAngleDeg}°)` : ''}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Access</p>
                <p className="font-medium">{formData.roadAccessSide || 'Unknown'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Save your site details to generate the intelligence summary.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
