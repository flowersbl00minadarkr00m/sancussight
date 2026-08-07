async (page) => {
  const origin = 'https://sancussight.vercel.app'
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T6-hosted'
  const requests = []
  const consoleMessages = []
  const pageErrors = []
  page.on('request', request => requests.push({ method: request.method(), url: request.url() }))
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() })
    }
  })
  page.on('pageerror', error => pageErrors.push(error.message))

  const text = async locator => (await locator.innerText()).replace(/\s+/g, ' ').trim()
  const selectAsset = async name => {
    await page.getByRole('button', { name: 'Assets', exact: true }).click()
    await page.getByRole('searchbox', { name: 'Search assets' }).fill(name)
    await page.getByRole('button', { name, exact: true }).click()
    await page.waitForTimeout(180)
  }

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(origin, { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Explore sample' }).click()
  await selectAsset('Voice & context pack')
  const noHistory = await text(page.locator('.asset-version-history'))
  const initialCount = await page.locator('.asset-version-list > li').count()

  await page.getByRole('button', { name: 'Record current version' }).click()
  await page.getByText('Current version recorded and selected.', { exact: true }).waitFor()
  const firstRecord = await text(page.locator('.asset-version-history'))
  const firstCount = await page.locator('.asset-version-list > li').count()
  await page.getByRole('button', { name: 'Record current version' }).click()
  await page.getByText('Already recorded. The equivalent current state did not change version history.', { exact: true }).waitFor()
  const dedupeCount = await page.locator('.asset-version-list > li').count()

  await page.getByLabel('Alias label').fill('Preferred')
  await page.getByRole('button', { name: 'Add or move alias' }).click()
  const aliasAdded = await text(page.locator('.asset-version-history'))
  await page.getByRole('button', { name: 'Remove alias Preferred' }).click()
  const aliasRemoved = await text(page.locator('.asset-version-history'))

  const [assetDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.asset-version-history .evidence-packet-export')
      .getByRole('button', { name: 'Export Evidence Packet' }).click(),
  ])
  const assetSuggestedFilename = assetDownload.suggestedFilename()
  await assetDownload.saveAs(`${evidenceDir}/asset-version-evidence-packet.json`)
  await page.getByText(/Evidence Packet downloaded as sancussight-evidence-packet-asset-version-/).waitFor()
  const assetStatus = await text(page.locator('.asset-version-history .evidence-packet-status'))

  await page.getByRole('button', { name: 'Exit Drills', exact: true }).click()
  const exitCopy = await text(page.locator('.exit-packet-export').locator('..'))
  const [exitDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.exit-packet-export').getByRole('button', { name: 'Export Evidence Packet' }).click(),
  ])
  const exitSuggestedFilename = exitDownload.suggestedFilename()
  await exitDownload.saveAs(`${evidenceDir}/exit-drill-evidence-packet.json`)
  await page.getByText(/Evidence Packet downloaded as sancussight-evidence-packet-exit-drill-/).waitFor()
  const exitStatus = await text(page.locator('.exit-packet-export .evidence-packet-status'))

  const httpRequests = requests.filter(item => item.url.startsWith('http'))
  return {
    noHistory: noHistory.includes('No recorded versions.')
      && noHistory.includes('Recording is explicit and creates no earlier history.'),
    initialCount,
    firstRecord: firstRecord.includes('Current version recorded and selected.')
      && firstRecord.includes('No previous version recorded.'),
    firstCount,
    deduplicated: dedupeCount === firstCount,
    aliasLabelOnly: aliasAdded.includes('Version aliases are labels only.')
      && aliasAdded.includes('Alias Preferred now labels the selected recorded version.'),
    aliasRemovedWithoutFactMutation: aliasRemoved.includes('Alias Preferred removed. Recorded version facts were not changed.'),
    downloads: {
      assetSuggestedFilename,
      assetStatus,
      exitSuggestedFilename,
      exitStatus,
      exitProjectionOnly: exitCopy.includes('It does not persist or execute an Exit Drill and makes no provider request.'),
    },
    runtime: {
      consoleMessages,
      pageErrors,
      origins: [...new Set(httpRequests.map(item => item.url.split('/').slice(0, 3).join('/')))],
      methods: [...new Set(httpRequests.map(item => item.method))],
      unexpectedExternal: httpRequests.filter(item => !item.url.startsWith(`${origin}/`)),
      nonGet: httpRequests.filter(item => item.method !== 'GET'),
    },
  }
}
