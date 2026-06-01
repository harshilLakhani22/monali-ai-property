// Service utility to communicate with the FastAPI backend

let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
if (!API_URL.endsWith('/api')) {
  API_URL = `${API_URL}/api`;
}

export async function fetchHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch health status from FastAPI:", error);
    return null;
  }
}

export async function generateConcept(projectId: string, projectType: string, parameters: Record<string, unknown> = {}) {
  try {
    const response = await fetch(`${API_URL}/concepts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        project_type: projectType,
        parameters,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to generate concept via FastAPI:", error);
    return null;
  }
}
