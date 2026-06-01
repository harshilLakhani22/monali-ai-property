import { prisma } from '../src/lib/prisma'
import { verifyExtraction, rejectExtraction, updateExtraction } from '../src/app/actions/intelligence'
import assert from 'assert'

async function runTests() {
  console.log('--- Starting Phase 4D Tests ---')
  
  // Get an existing document and extractions
  const doc = await prisma.document.findFirst({
    where: { extractions: { some: {} } },
    include: { extractions: true }
  })
  
  if (!doc) {
    console.log('No documents with extractions found. Run 4C test first.')
    process.exit(1)
  }
  
  const projectId = doc.projectId
  const extractions = doc.extractions
  
  if (extractions.length < 3) {
    console.log('Need at least 3 extractions to run this test properly.')
    process.exit(1)
  }

  // Clear existing constraints for clean test
  await prisma.constraint.deleteMany({ where: { projectId } })
  // Reset extractions
  await prisma.extraction.updateMany({
    where: { documentId: doc.id },
    data: { verified: false, rejected: false, editedValue: null, editedUnit: null }
  })
  console.log('Reset complete.')

  // 1. Verify one extraction -> exactly one Constraint created
  const ext1 = extractions[0]
  console.log(`\nTest 1: Verifying extraction ${ext1.id}`)
  await verifyExtraction(ext1.id, projectId)
  let constraints = await prisma.constraint.findMany({ where: { projectId } })
  assert.strictEqual(constraints.length, 1, 'Exactly one constraint should be created')
  assert.strictEqual(constraints[0].extractionId, ext1.id, 'Constraint extractionId should match')
  assert.strictEqual(constraints[0].value, ext1.unit ? `${ext1.value} ${ext1.unit}`.trim() : ext1.value, 'Constraint value should match original')
  console.log('Test 1 Passed: verified -> 1 constraint created')

  // 2. Edit value/unit then verify -> Constraint uses edited value
  const ext2 = extractions[1]
  console.log(`\nTest 2: Editing then verifying extraction ${ext2.id}`)
  await updateExtraction(ext2.id, projectId, { value: '999', unit: 'custom_unit' })
  await verifyExtraction(ext2.id, projectId)
  constraints = await prisma.constraint.findMany({ where: { projectId } })
  assert.strictEqual(constraints.length, 2, 'Should now have 2 constraints')
  const c2 = constraints.find(c => c.extractionId === ext2.id)
  assert.ok(c2)
  assert.strictEqual(c2.value, '999 custom_unit', 'Constraint should use edited value')
  console.log('Test 2 Passed: edited + verified -> uses edited values')

  // 3. Reject one extraction -> no Constraint created
  const ext3 = extractions[2]
  console.log(`\nTest 3: Rejecting extraction ${ext3.id}`)
  await rejectExtraction(ext3.id, projectId, 'Test reject')
  constraints = await prisma.constraint.findMany({ where: { projectId } })
  assert.strictEqual(constraints.length, 2, 'Should STILL have 2 constraints')
  const rejectedExt = await prisma.extraction.findUnique({ where: { id: ext3.id } })
  assert.strictEqual(rejectedExt?.rejected, true)
  assert.strictEqual(rejectedExt?.verified, false)
  console.log('Test 3 Passed: rejected -> no constraint created, status updated')

  // 4. Re-verify same extraction -> existing Constraint updated, no duplicate
  console.log(`\nTest 4: Re-verifying extraction ${ext2.id}`)
  await updateExtraction(ext2.id, projectId, { value: '888', unit: 'new_unit' })
  await verifyExtraction(ext2.id, projectId)
  constraints = await prisma.constraint.findMany({ where: { projectId } })
  assert.strictEqual(constraints.length, 2, 'Should STILL have 2 constraints, no duplicates')
  const c2Updated = constraints.find(c => c.extractionId === ext2.id)
  assert.ok(c2Updated)
  assert.strictEqual(c2Updated.value, '888 new_unit', 'Constraint should be updated in place')
  console.log('Test 4 Passed: re-verify -> updated existing constraint')

  // 5. Confirm unverified/rejected rows never create Constraints
  console.log('\nTest 5: Checking database totals')
  const totalConstraints = await prisma.constraint.count({ where: { projectId } })
  const totalVerified = await prisma.extraction.count({ where: { projectId, verified: true } })
  assert.strictEqual(totalConstraints, totalVerified, 'Constraints count must exactly equal verified extractions')
  console.log('Test 5 Passed: No leaked constraints from unverified/rejected rows')

  console.log('\n--- ALL PHASE 4D TESTS PASSED ---')
}

runTests().catch(console.error)
