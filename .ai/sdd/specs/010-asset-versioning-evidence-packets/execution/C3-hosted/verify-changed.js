async (page) => {
  const evidenceRoot = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/C3-hosted'
  await page.getByRole('button', { name: 'Assets', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Search assets' })
    .fill('C2 changed-first truncation fixture')
  await page.getByRole('button', {
    name: 'C2 changed-first truncation fixture',
    exact: true,
  }).click()
  const comparison = page.locator('.asset-version-comparison')
  const text = (await comparison.innerText()).replace(/\s+/g, ' ').trim()
  const states = await comparison.locator('li strong').allInnerTexts()
  await page.screenshot({
    path: `${evidenceRoot}/01-hosted-changed-first.png`,
    fullPage: true,
  })
  const exportButton = page.locator('.asset-version-history .evidence-packet-export')
    .getByRole('button', { name: 'Export Evidence Packet' })
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    exportButton.click(),
  ])
  const filename = download.suggestedFilename()
  await download.saveAs(`${evidenceRoot}/changed-first-evidence-packet.json`)
  return {
    regressionFirst: states[0]?.toLowerCase().startsWith('regression:') ?? false,
    meaningfulSummary: text.includes(
      'All 1 meaningful changes are shown; 5 unchanged context items were omitted.',
    ),
    states,
    filename,
    text,
  }
}
