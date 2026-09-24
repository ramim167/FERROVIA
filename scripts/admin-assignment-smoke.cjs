const assert = require('node:assert/strict')
const { mkdirSync } = require('node:fs')
const { resolve } = require('node:path')
const { chromium } = require('playwright-core')

const appUrl = process.env.APP_URL || 'http://localhost:5173'
const token = process.env.ADMIN_TOKEN
const adminUserId = Number(process.env.ADMIN_USER_ID)
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDir = resolve(__dirname, '../artifacts/ui-smoke')

if (!token) throw new Error('ADMIN_TOKEN is required')
if (!adminUserId) throw new Error('ADMIN_USER_ID is required')

async function main() {
  mkdirSync(outputDir, { recursive: true })
  const browser = await chromium.launch({ executablePath, headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []

  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })

  try {
    await page.addInitScript(({ adminToken, userId }) => {
      localStorage.setItem('rail-token', adminToken)
      localStorage.setItem('rail-user', JSON.stringify({
        user_id: userId,
        full_name: 'Admin Verification',
        email: 'diagnostic@local',
        role: 'ADMIN',
      }))
    }, { adminToken: token, userId: adminUserId })

    await page.goto(appUrl, { waitUntil: 'networkidle' })
    await page.getByText('Admin', { exact: true }).click()
    await page.getByText('Trip & Trainset Assignments', { exact: true }).click()
    await page.getByRole('heading', { name: 'Trip assignments' }).waitFor()
    await page.getByRole('heading', { name: 'Select a trip' }).waitFor()
    await page.getByRole('heading', { name: 'Assign a physical trainset' }).waitFor()

    assert.equal(await page.getByText('Automatic trip issuing', { exact: true }).count(), 0)
    await page.locator('.issued-trip-list > button').first().waitFor()
    assert.ok(await page.locator('.issued-trip-list > button').count() > 0)
    assert.equal(await page.getByPlaceholder('Search issued train, code or trip ID').count(), 1)
    assert.equal(await page.locator('.selected-trip-summary').count(), 1)

    await page.getByPlaceholder('Search issued train, code or trip ID').fill('Mixed (2)')
    assert.ok(await page.locator('.admin-train-results button').count() > 0)
    await page.screenshot({
      path: resolve(outputDir, 'admin-trip-trainset-assignment.png'),
      fullPage: true,
    })

    assert.deepEqual(errors, [])
    console.log('Admin issued-trip and trainset-assignment UI test passed.')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
