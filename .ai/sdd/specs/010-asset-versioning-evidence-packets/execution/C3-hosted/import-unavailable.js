async (page) => {
  const inputs = page.locator('input[type=file]')
  const count = await inputs.count()
  if (count !== 2) throw new Error(`Expected two file inputs; found ${count}`)
  await inputs.nth(0).setInputFiles(
    'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/C2-browser/unavailable.json',
  )
}
