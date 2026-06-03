import { z } from 'zod'

// Helper for numeric form fields that might arrive as empty strings
export const optionalNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined
    return value
  },
  z.coerce.number().min(0).optional()
)

export const BriefSchema = z.object({
  projectIntent: z.object({
    projectType: z.enum(["New build", "Renovation", "Extension", "Estate concept", "Feasibility study", "Unknown"]).optional(),
    targetBuildingType: z.enum(["Single-family house", "Townhouse", "Duplex", "Small estate unit", "Mixed-use", "Unknown"]).optional(),
    storeys: z.enum(["Single-storey", "Double-storey", "Split-level", "Flexible / AI to recommend", "Unknown"]).optional(),
    targetFloorArea: optionalNumber,
    budgetRange: z.enum(["Cost-conscious", "Mid-range", "Premium", "Luxury", "Not sure yet"]).optional(),
  }).optional(),

  roomsAndSpaces: z.object({
    bedrooms: optionalNumber,
    bathrooms: optionalNumber,
    garageBays: optionalNumber,
    kitchenScullery: z.boolean().optional(),
    livingDining: z.boolean().optional(),
    studyOffice: z.boolean().optional(),
    guestRoom: z.boolean().optional(),
    staffRoom: z.boolean().optional(),
    storage: z.boolean().optional(),
    outdoorPatio: z.boolean().optional(),
    braaiArea: z.boolean().optional(),
    pool: z.boolean().optional(),
    gardenRequirements: z.string().optional(),
  }).optional(),

  designPreferences: z.object({
    architecturalStyle: z.enum(["Modern", "Contemporary", "Farmhouse", "Minimal", "Estate guideline compliant", "Natural / stone / timber", "AI to recommend", "Unknown"]).optional(),
    preferredMaterials: z.string().optional(),
    roofPreference: z.enum(["Pitched roof", "Flat roof", "Mixed roof", "Estate guideline compliant", "AI to recommend", "Unknown"]).optional(),
  }).optional(),

  priorities: z.object({
    designPriority: z.enum(["Maximum floor area", "Best views", "Best privacy", "Best natural light", "Cost efficiency", "Fast approval", "Balanced"]).optional(),
    privacyPriority: z.enum(["Low", "Medium", "High"]).optional(),
    viewPriority: z.enum(["Low", "Medium", "High"]).optional(),
    naturalLightPriority: z.enum(["Low", "Medium", "High"]).optional(),
    sustainabilityPriority: z.enum(["Low", "Medium", "High"]).optional(),
    costControlPriority: z.enum(["Low", "Medium", "High"]).optional(),
  }).optional(),

  specialRequirements: z.object({
    accessibilityNeeds: z.string().optional(),
    futureExtension: z.string().optional(),
    rentalInvestmentUse: z.boolean().optional(),
    familyLifestyleNotes: z.string().optional(),
    mustHaveItems: z.string().optional(),
    avoidItems: z.string().optional(),
  }).optional(),
})

export type BriefData = z.infer<typeof BriefSchema>
