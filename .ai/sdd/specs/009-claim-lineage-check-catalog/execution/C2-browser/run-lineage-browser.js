async (page) => {
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/C2-browser'
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.waitForSelector('#conflict-case .claim-lineage-list')

  const unrelatedText = await page.locator('#unrelated-case').innerText()
  const exactText = await page.locator('#exact-case').innerText()
  const unrelatedLower = unrelatedText.toLowerCase()
  const exactLower = exactText.toLowerCase()
  const conflictTargetEdges = page.locator(
    '#conflict-case .claim-lineage-list > li:first-child .claim-lineage-edge',
  )
  const conflictEdgeLabels = await conflictTargetEdges.locator('strong').allInnerTexts()
  const conflictEvidenceReferences = await page.locator(
    '#conflict-case .claim-lineage-list .claim-lineage-node code',
  ).allInnerTexts()

  const observations = {
    unrelatedSameAsset: {
      unrelatedEnvelopeAbsent: !unrelatedText.includes('UNRELATED_SAME_ASSET_SENTINEL')
        && !unrelatedText.includes('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'),
      evidenceBindingDidNotQualify: !unrelatedText.includes('same-asset-unrelated'),
      unrelatedDidNotCauseStaleOrConflict: !unrelatedLower.includes('stale relationship')
        && !unrelatedLower.includes('conflicting relationship'),
      deterministicInputRemainsVisible: unrelatedLower.includes('registry providerdependencies'),
    },
    exactAcceptedReference: {
      exactEnvelopeVisible: exactText.includes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
      boundedLineageVisible: exactLower.includes('shortest relevant path / bounded to 8 nodes'),
      qualifiedRelationshipVisible: exactLower.includes('stale relationship'),
      sourceQualificationVisible: exactLower.includes('agent-beacon accepted synthetic-c2-lineage-observation'),
      historyUnavailableVisible: exactLower.includes('local history unavailable'),
      currentResultUsable: exactLower.includes('current result')
        && exactLower.includes('synthetic c2 lineage asset'),
      unrelatedEnvelopeAbsent: !exactText.includes('UNRELATED_SAME_ASSET_SENTINEL')
        && !exactText.includes('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'),
    },
    twoObservationConflict: {
      outgoingEdgeCount: await conflictTargetEdges.count(),
      outgoingLabels: conflictEdgeLabels,
      stableOrder: JSON.stringify(conflictEvidenceReferences.filter(value => /^[ab]{64}$/.test(value)).slice(0, 2)) === JSON.stringify([
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      ]),
      bothLabelsVisible: conflictEdgeLabels.length === 2
        && conflictEdgeLabels.every(label => label.toLowerCase() === 'conflicting relationship'),
    },
    overflow: await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    })),
    resources: await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource').map(entry => entry.name)
      return {
        count: entries.length,
        unexpectedExternal: entries.filter(url => new URL(url).origin !== location.origin),
      }
    }),
  }

  await page.screenshot({ path: `${evidenceDir}/01-lineage-matrix.png`, fullPage: true })
  return observations
}
