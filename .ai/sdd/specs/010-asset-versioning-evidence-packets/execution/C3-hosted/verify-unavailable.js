async (page) => {
  const evidenceRoot = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/C3-hosted'
  await page.getByRole('button', { name: 'Assets', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Search assets' })
    .fill('C2 unavailable comparison fixture')
  await page.getByRole('button', {
    name: 'C2 unavailable comparison fixture',
    exact: true,
  }).click()
  const text = (await page.locator('.asset-version-comparison').innerText())
    .replace(/\s+/g, ' ')
    .trim()
  await page.screenshot({
    path: `${evidenceRoot}/02-hosted-unavailable.png`,
    fullPage: true,
  })
  return {
    explicitUnavailable: text.includes('Comparison unavailable.'),
    exactCount: text.includes(
      '101 meaningful changes exceed the 100-item truthfulness limit.',
    ),
    noPartial: text.includes('No partial comparison is shown.'),
    text,
  }
}
