/* eslint-disable @typescript-eslint/no-unused-vars */
export async function mockExtractRules(_documentId: string) {
  // Simulate AI extraction delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    zoning: "Residential 1",
    maxHeight: 8.5,
    coverage: 0.5,
    setbacks: {
      street: 4.5,
      side: 2,
      rear: 2
    }
  }
}

export async function mockGenerateLayout(_briefId: string) {
  // Simulate heavy AI processing
  await new Promise(resolve => setTimeout(resolve, 3000))

  return {
    conceptId: "concept-123",
    status: "ready",
    metrics: {
      footprint: 250,
      totalArea: 400
    }
  }
}
