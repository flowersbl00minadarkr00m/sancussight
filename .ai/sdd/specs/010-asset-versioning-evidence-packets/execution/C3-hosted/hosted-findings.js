async (page) => {
  const origin = 'https://sancussight.vercel.app'
  const fixtureRoot = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/C2-browser'
  const evidenceRoot = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/C3-hosted'
  const requests = []
  const consoleMessages = []
  const pageErrors = []

  page.on('request', request => {
    if (request.url().startsWith('http')) {
      requests.push({
        method: request.method(),
        url: request.url(),
        resourceType: request.resourceType(),
      })
    }
  })
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleMessages.push({ type: message.type(), text: message.text() })
    }
  })
  page.on('pageerror', error => pageErrors.push(error.message))

  const importRegistry = async (filename, confirm = true) => {
    if (confirm) page.once('dialog', dialog => dialog.accept())
    await page.locator('input[type=file][accept="application/json,.json"]')
      .setInputFiles(`${fixtureRoot}/${filename}`)
    await page.waitForTimeout(350)
  }

  const selectAsset = async name => {
    await page.getByRole('button', { name: 'Assets', exact: true }).click()
    await page.getByRole('searchbox', { name: 'Search assets' }).fill(name)
    await page.getByRole('button', { name, exact: true }).click()
    await page.waitForTimeout(180)
  }

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(origin, { waitUntil: 'domcontentloaded' })
  await page.getByRole('link', { name: 'Explore sample', exact: true }).click()
  await page.waitForTimeout(180)

  await importRegistry('changed-first.json')
  await selectAsset('C2 changed-first truncation fixture')
  const changedText = (await page.locator('.asset-version-comparison').innerText())
    .replace(/\s+/g, ' ')
    .trim()
  const changedStates = await page.locator('.asset-version-comparison li strong').allInnerTexts()
  await page.screenshot({
    path: `${evidenceRoot}/01-hosted-changed-first.png`,
    fullPage: true,
  })

  const changedExport = page.locator('.asset-version-history .evidence-packet-export')
    .getByRole('button', { name: 'Export Evidence Packet' })
  const [changedDownload] = await Promise.all([
    page.waitForEvent('download'),
    changedExport.click(),
  ])
  const changedFilename = changedDownload.suggestedFilename()
  await changedDownload.saveAs(`${evidenceRoot}/changed-first-evidence-packet.json`)
  const changedExportStatus = (await page.locator(
    '.asset-version-history .evidence-packet-status',
  ).innerText()).replace(/\s+/g, ' ').trim()

  await importRegistry('unavailable.json')
  await selectAsset('C2 unavailable comparison fixture')
  const unavailableText = (await page.locator('.asset-version-comparison').innerText())
    .replace(/\s+/g, ' ')
    .trim()
  const activeBeforeRejection = await page.getByRole('heading', {
    name: 'C2 unavailable comparison fixture',
    exact: true,
  }).count()
  await page.screenshot({
    path: `${evidenceRoot}/02-hosted-unavailable.png`,
    fullPage: true,
  })

  await importRegistry('forged-identity.json', false)
  const forgedStatus = (await page.getByRole('status').innerText()).replace(/\s+/g, ' ').trim()
  const activeAfterForged = await page.getByRole('heading', {
    name: 'C2 unavailable comparison fixture',
    exact: true,
  }).count()

  await importRegistry('impossible-date.json', false)
  const impossibleDateStatus = (await page.getByRole('status').innerText())
    .replace(/\s+/g, ' ')
    .trim()
  const activeAfterImpossibleDate = await page.getByRole('heading', {
    name: 'C2 unavailable comparison fixture',
    exact: true,
  }).count()

  await importRegistry('portable-derivative.json')
  await selectAsset('portable skill')
  const portableText = (await page.locator('.asset-version-history').innerText())
    .replace(/\s+/g, ' ')
    .trim()
  const portableExport = page.locator('.asset-version-history .evidence-packet-export')
    .getByRole('button', { name: 'Export Evidence Packet' })
  const [portableDownload] = await Promise.all([
    page.waitForEvent('download'),
    portableExport.click(),
  ])
  const portableFilename = portableDownload.suggestedFilename()
  await portableDownload.saveAs(`${evidenceRoot}/portable-derivative-evidence-packet.json`)

  await page.setViewportSize({ width: 320, height: 900 })
  await page.waitForTimeout(180)
  const narrowSelected = await page.evaluate(() => ({
    activeText: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' '),
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    catalogVisible: Boolean(document.querySelector('.assets-catalog-region')),
    passportVisible: Boolean(document.querySelector('.asset-passport-region')),
  }))
  await page.screenshot({
    path: `${evidenceRoot}/03-hosted-portable-narrow.png`,
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Back to assets' }).click()
  await page.waitForTimeout(120)
  const narrowBack = await page.evaluate(() => ({
    activeText: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' '),
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    catalogVisible: Boolean(document.querySelector('.assets-catalog-region')),
    passportVisible: Boolean(document.querySelector('.asset-passport-region')),
  }))

  const network = {
    count: requests.length,
    origins: [...new Set(requests.map(request => new URL(request.url).origin))],
    methods: [...new Set(requests.map(request => request.method))],
    nonGet: requests.filter(request => request.method !== 'GET'),
    unexpectedExternal: requests.filter(request => new URL(request.url).origin !== origin),
  }

  return {
    changedFirst: {
      text: changedText,
      states: changedStates,
      regressionFirst: changedStates[0]?.toLowerCase().startsWith('regression:') ?? false,
      meaningfulSummary: changedText.includes('All 1 meaningful changes are shown; 5 unchanged context items were omitted.'),
      filename: changedFilename,
      exportStatus: changedExportStatus,
    },
    unavailable: {
      text: unavailableText,
      explicitUnavailable: unavailableText.includes('Comparison unavailable.'),
      exactCount: unavailableText.includes('101 meaningful changes exceed the 100-item truthfulness limit.'),
      noPartial: unavailableText.includes('No partial comparison is shown.'),
    },
    rejection: {
      activeBeforeRejection,
      forgedStatus,
      activeAfterForged,
      impossibleDateStatus,
      activeAfterImpossibleDate,
    },
    portableDerivative: {
      text: portableText,
      hasPortableQualification: portableText.includes('Current portable projection'),
      hasSourcePointer: portableText.includes('Source recorded version'),
      disclaimsRecordedFacts: portableText.includes('not the original recorded facts'),
      filename: portableFilename,
    },
    narrow: {
      selected: narrowSelected,
      afterBack: narrowBack,
    },
    runtime: {
      consoleMessages,
      pageErrors,
      network,
    },
  }
}
