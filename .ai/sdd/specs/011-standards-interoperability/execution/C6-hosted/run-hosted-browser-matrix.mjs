import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const sourcePath = resolve(
  outputDirectory,
  '..',
  'C3-hosted',
  'hosted-browser-matrix.mjs',
)

let source = await readFile(sourcePath, 'utf8')
source = source
  .replace(
    "const outputDirectory = dirname(fileURLToPath(import.meta.url))",
    `const outputDirectory = ${JSON.stringify(outputDirectory)}`,
  )
  .replaceAll('C3', 'C6')
  .replaceAll('c3', 'c6')

const startMarker = '  await holdFeatureStore(page)\n'
const endMarker = '\n\n  const unrelatedBeforeCorruption'
const start = source.indexOf(startMarker)
const end = source.indexOf(endMarker, start)
assert.notEqual(start, -1, 'C3 concurrency start marker must exist')
assert.notEqual(end, -1, 'C3 concurrency end marker must exist')

const twoPageCriterion = `  const secondPage = await context.newPage()
  await openStandardsWorkspace(secondPage)
  const secondOpenLineageInput = secondPage.locator(
    '.standards-interoperability input[type="file"]',
  ).first()

  await holdFeatureStore(page)
  const firstAddsBefore = await page.evaluate(() => window.__c6FeatureAdds)
  const secondAddsBefore = await secondPage.evaluate(
    () => window.__c6FeatureAdds,
  )
  const firstImport = openLineageInput.setInputFiles(facetFile)
  await page.locator('.interoperability-status-pending').first().waitFor()
  const secondImport = secondOpenLineageInput.setInputFiles(facetFile)
  await secondPage.locator(
    '.interoperability-status-pending',
  ).first().waitFor()
  await Promise.all([firstImport, secondImport])
  await page.waitForTimeout(100)
  assert.equal(
    await page.evaluate(() => window.__c6FeatureAdds),
    firstAddsBefore,
  )
  assert.equal(
    await secondPage.evaluate(() => window.__c6FeatureAdds),
    secondAddsBefore,
  )
  await releaseFeatureStore(page)
  await Promise.all([
    waitForOperation(page, 0),
    waitForOperation(secondPage, 0),
  ])

  const [
    firstContextRecords,
    secondContextRecords,
    firstStatus,
    secondStatus,
    firstHistoryCount,
    secondHistoryCount,
  ] = await Promise.all([
    readFeatureRecords(page),
    readFeatureRecords(secondPage),
    page.locator('.interoperability-status').first().innerText(),
    secondPage.locator('.interoperability-status').first().innerText(),
    page.locator('.interoperability-history li').count(),
    secondPage.locator('.interoperability-history li').count(),
  ])
  const firstAdds = (
    await page.evaluate(() => window.__c6FeatureAdds)
  ) - firstAddsBefore
  const secondAdds = (
    await secondPage.evaluate(() => window.__c6FeatureAdds)
  ) - secondAddsBefore
  assert.match(firstStatus, /bounded preview is stored locally/i)
  assert.match(secondStatus, /bounded preview is stored locally/i)
  assert.equal(firstContextRecords.length, 1)
  assert.equal(secondContextRecords.length, 1)
  assert.deepEqual(firstContextRecords, secondContextRecords)
  assert.equal(firstHistoryCount, 1)
  assert.equal(secondHistoryCount, 1)
  assert.deepEqual([firstAdds, secondAdds], [1, 0])
  const serializedAtomic = JSON.stringify({
    firstContextRecords,
    secondContextRecords,
    firstStatus,
    secondStatus,
  })
  assert.doesNotMatch(
    serializedAtomic,
    /private|credential|prompt|response|reasoning|toolPayload|unavailable/iu,
  )
  record('two independently loaded page/store contexts deterministically record then deduplicate one shared IndexedDB snapshot', {
    pages: 2,
    origin,
    database: featureDatabase,
    store: featureStore,
    outcomes: ['recorded', 'deduplicated'],
    availability: ['available', 'available'],
    indexedDbAddCalls: firstAdds + secondAdds,
    persistedSnapshots: firstContextRecords.length,
    firstContextSnapshots: firstContextRecords.length,
    secondContextSnapshots: secondContextRecords.length,
    identicalAvailableViews: true,
    privacySearch:
      'no raw/private value or unavailable state in returned or retained atomic evidence',
  })
  await secondPage.close()`

source = `${source.slice(0, start)}${twoPageCriterion}${source.slice(end)}`
source = source.replace(
  "'All C6 inputs are explicitly synthetic fixtures; they are not production evidence.'",
  "'All C6 inputs are explicitly synthetic fixtures; they are not production evidence.'",
)
source = source.replace(
  "'All four R1 findings, C1/C2 corrections, and fix-caused regressions only.'",
  "'R1-SPEC-002, C4/C5, and regressions caused by the atomic-dedupe correction only.'",
)

const encoded = Buffer.from(source, 'utf8').toString('base64')
await import(`data:text/javascript;base64,${encoded}`)
