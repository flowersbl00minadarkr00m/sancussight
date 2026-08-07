import { chromium } from 'file:///C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()
await page.goto('http://127.0.0.1:4173/#demo', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Advanced' }).click()
await page.getByRole('button', { name: 'Evidence Sources' }).click()
await page.locator('.standards-interoperability input[type="file"]').first().setInputFiles(
  `${outputDirectory}\\synthetic-openlineage-safe.json`,
)
await page.waitForFunction(() => {
  const status = document.querySelector('.interoperability-status')
  return status && !status.classList.contains('interoperability-status-pending')
})
const status = await page.locator('.interoperability-status').first().innerText()
await page.screenshot({
  path: `${outputDirectory}\\initial-openlineage-store-failure.png`,
  fullPage: true,
})
console.log(JSON.stringify({ status }, null, 2))
await browser.close()
