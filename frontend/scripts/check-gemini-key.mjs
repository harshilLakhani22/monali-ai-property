#!/usr/bin/env node
/**
 * Gemini API Key Validator
 * 
 * Usage:
 *   node scripts/check-gemini-key.mjs
 *   node scripts/check-gemini-key.mjs YOUR_API_KEY_HERE
 * 
 * If no key is passed as argument, it reads from .env (GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY).
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// --- 1. Resolve the API key ---
let apiKey = process.argv[2]

if (!apiKey) {
  // Try reading from .env
  try {
    const envPath = resolve(__dirname, '..', '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    const lines = envContent.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('GOOGLE_GENERATIVE_AI_API_KEY=')) {
        apiKey = trimmed.split('=').slice(1).join('=').replace(/^["']|["']$/g, '')
      } else if (trimmed.startsWith('GEMINI_API_KEY=') && !apiKey) {
        apiKey = trimmed.split('=').slice(1).join('=').replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    // .env not found
  }
}

if (!apiKey) {
  console.error('❌ No API key found.')
  console.error('   Pass it as an argument:  node scripts/check-gemini-key.mjs YOUR_KEY')
  console.error('   Or set GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY in frontend/.env')
  process.exit(1)
}

console.log(`🔑 API Key: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`)
console.log('')

// --- 2. List available models ---
console.log('📋 Checking available models...')
try {
  const listRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  )

  if (!listRes.ok) {
    const errBody = await listRes.json()
    if (listRes.status === 400 || listRes.status === 403) {
      console.error(`❌ API Key is INVALID or has no permissions.`)
      console.error(`   Status: ${listRes.status}`)
      console.error(`   Message: ${errBody?.error?.message || JSON.stringify(errBody)}`)
      process.exit(1)
    }
    console.error(`❌ Unexpected error: ${listRes.status}`)
    console.error(JSON.stringify(errBody, null, 2))
    process.exit(1)
  }

  const data = await listRes.json()
  const models = data.models || []

  // Filter to generateContent-capable models
  const contentModels = models.filter(m =>
    m.supportedGenerationMethods?.includes('generateContent')
  )

  console.log(`✅ API Key is VALID! Found ${models.length} total models, ${contentModels.length} support generateContent.\n`)

  // Show relevant models
  const interestingPrefixes = ['gemini-2', 'gemini-1.5', 'gemini-pro', 'gemini-flash']
  const relevantModels = contentModels.filter(m => {
    const name = m.name.replace('models/', '')
    return interestingPrefixes.some(p => name.startsWith(p))
  })

  console.log('🏷️  Recommended models for generateContent:')
  console.log('─'.repeat(60))
  for (const m of relevantModels) {
    const id = m.name.replace('models/', '')
    console.log(`  • ${id}`)
    if (m.displayName) console.log(`    Display: ${m.displayName}`)
  }

  if (relevantModels.length === 0) {
    console.log('  (No gemini-2.x or gemini-1.5 models found — showing all:)')
    for (const m of contentModels.slice(0, 15)) {
      console.log(`  • ${m.name.replace('models/', '')}`)
    }
  }

  console.log('')

  // --- 3. Quick generation test ---
  const testModel = relevantModels[0]?.name?.replace('models/', '') || contentModels[0]?.name?.replace('models/', '')
  if (testModel) {
    console.log(`🧪 Testing generateContent with model: ${testModel}...`)
    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "hello" in one word.' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      }
    )

    if (genRes.ok) {
      const genData = await genRes.json()
      const text = genData?.candidates?.[0]?.content?.parts?.[0]?.text || '(no text)'
      console.log(`✅ Generation works! Response: "${text.trim()}"`)
      console.log('')
      console.log(`💡 Use this model in your .env:`)
      console.log(`   GOOGLE_GENERATIVE_AI_MODEL=${testModel}`)
    } else {
      const errBody = await genRes.json()
      console.error(`❌ Generation failed: ${genRes.status}`)
      console.error(`   ${errBody?.error?.message || JSON.stringify(errBody)}`)
    }
  }

} catch (err) {
  console.error(`❌ Network error: ${err.message}`)
  process.exit(1)
}

console.log('')
console.log('Done.')
