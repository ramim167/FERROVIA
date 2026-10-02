const assert = require('node:assert/strict')
const { mkdirSync } = require('node:fs')
const { resolve } = require('node:path')
const { chromium } = require('playwright-core')

const appUrl = process.env.APP_URL || 'http://localhost:5173'
const apiUrl = process.env.API_URL || 'http://localhost:5000'
const { browserOptions } = require('./browser.cjs')
const outputDir = resolve(__dirname, '../artifacts/ui-smoke')
const transitionDelay = 650

mkdirSync(outputDir, { recursive: true })

async function assertFitsViewport(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }))
  assert.ok(
    dimensions.content <= dimensions.viewport + 1,
    `${label} overflows horizontally (${dimensions.content}px > ${dimensions.viewport}px)`
  )
}

function captureErrors(page, errors) {
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
}

async function runPassengerFlow(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const unique = Date.now().toString().slice(-9)
  const phone = `01${unique}`
  captureErrors(page, errors)

  await page.goto(`${appUrl}/?intro=0`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bangladesh by rail, booked in minutes.' }).waitFor()
  await page.waitForTimeout(transitionDelay)
  await assertFitsViewport(page, 'desktop home')
  await page.screenshot({ path: resolve(outputDir, 'desktop-home.png'), fullPage: true })

  await page.getByPlaceholder('From where?').fill('Dh')
  await page.getByRole('option', { name: 'Dhaka', exact: true }).click()
  await page.getByPlaceholder('To where?').fill('Cha')
  await page.getByRole('option', { name: 'Chattogram', exact: true }).click()
  await page.getByRole('button', { name: 'Search trains' }).click()
  await page.getByText('1 train available').waitFor()
  await page.waitForTimeout(transitionDelay)
  await assertFitsViewport(page, 'desktop results')
  await page.screenshot({ path: resolve(outputDir, 'desktop-results.png'), fullPage: true })

  await page.locator('.journey-card .fare-tile:not([disabled])').first().click()
  await page.locator('button[aria-label^="Seat "]:not([disabled])').first().click()
  await page.getByRole('button', { name: 'Continue to passengers' }).click()
  await page.getByLabel('Full name', {exact:true}).fill('Browser Passenger')
  await page.getByLabel('Age', {exact:true}).fill('28')
  await page.getByRole('button', { name: 'Hold seats and continue' }).click()

  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.getByPlaceholder('Your full name').fill('Browser Passenger')
  await page.getByPlaceholder('01XXXXXXXXX').fill(phone)
  await page.getByPlaceholder('you@example.com').fill(`browser.${unique}@ferrovia.local`)
  await page.locator('input[name="password"]').fill('Browser123!')
  await page.locator('.auth-form button[type=submit]').click()

  await page.getByRole('heading', { name: 'Review and pay' }).waitFor()
  await page.getByPlaceholder('01XXXXXXXXX').fill(phone)
  await page.getByPlaceholder('Transaction ID').fill(`BROWSER-${unique}`)
  await page.getByRole('button', { name: /^Pay /  }).click()
  await page.getByRole('heading', { name: /booked/ }).waitFor()
  await page.waitForTimeout(transitionDelay)
  await assertFitsViewport(page, 'desktop ticket')
  await page.screenshot({ path: resolve(outputDir, 'desktop-ticket.png'), fullPage: true })

  await context.close()
}

async function runAdminFlow(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  captureErrors(page, errors)

  await page.goto(`${appUrl}/?intro=0`, { waitUntil: 'networkidle' })
  await page.getByText('Sign in', { exact: true }).first().click()
  await page.getByPlaceholder('you@example.com').fill('admin@ferrovia.local')
  await page.locator('input[name="password"]').fill('Admin123!')
  await page.locator('.auth-form button[type=submit]').click()
  await page.getByText('Admin', { exact: true }).click()
  await page.getByRole('heading', { name: 'Operations overview' }).waitFor()
  await page.waitForTimeout(transitionDelay)
  await assertFitsViewport(page, 'desktop admin')
  await page.screenshot({ path: resolve(outputDir, 'desktop-admin.png'), fullPage: true })

  await context.close()
}

async function runTrackingFlow(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  captureErrors(page, errors)

  await page.goto(`${appUrl}/?intro=0`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Track a train' }).first().click()
  await page.getByRole('heading', { name: 'Track a train' }).waitFor()
  await page.waitForTimeout(transitionDelay)
  const input = page.getByRole('combobox', { name: 'Train name, code or Trip ID' })
  await input.fill('sub')
  const suggestion = page.getByRole('option', { name: /Suborno Express.*SUBORNO/i })
  await suggestion.waitFor()
  await page.screenshot({ path: resolve(outputDir, 'desktop-train-suggestions.png'), fullPage: true })
  await suggestion.click()
  assert.equal(await input.inputValue(), 'SUBORNO')
  await page.getByRole('button', { name: 'Track train', exact: true }).click()
  await page.getByRole('heading', { name: 'Suborno Express' }).waitFor()
  await page.waitForTimeout(transitionDelay)
  await assertFitsViewport(page, 'desktop train tracking')
  await page.screenshot({ path: resolve(outputDir, 'desktop-tracking.png'), fullPage: true })

  await context.close()
}

async function runMobileFlow(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const page = await context.newPage()
  captureErrors(page, errors)

  await page.goto(`${appUrl}/?intro=0`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bangladesh by rail, booked in minutes.' }).waitFor()
  await assertFitsViewport(page, 'mobile home')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Book tickets' }).waitFor()
  await page.waitForTimeout(transitionDelay)
  await assertFitsViewport(page, 'mobile menu')
  await page.screenshot({ path: resolve(outputDir, 'mobile-menu.png'), fullPage: true })

  await page.getByRole('dialog').getByRole('button', { name: 'Track a train' }).click()
  await page.getByRole('heading', { name: 'Track a train' }).waitFor()
  await page.waitForTimeout(transitionDelay)
  await page.getByRole('combobox', { name: 'Train name, code or Trip ID' }).fill('sub')
  await page.getByRole('option', { name: /Suborno Express.*SUBORNO/i }).waitFor()
  await assertFitsViewport(page, 'mobile train suggestions')
  await page.screenshot({ path: resolve(outputDir, 'mobile-train-suggestions.png'), fullPage: true })

  await context.close()
}

async function runTabletFlow(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 820, height: 1180 } })
  const page = await context.newPage()
  captureErrors(page, errors)

  await page.goto(`${appUrl}/?intro=0`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open menu' }).waitFor()
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Book tickets' }).waitFor()
  await page.waitForTimeout(transitionDelay)
  await assertFitsViewport(page, 'tablet menu')
  await page.screenshot({ path: resolve(outputDir, 'tablet-menu.png'), fullPage: true })

  await context.close()
}

async function main() {
  const healthResponse = await fetch(`${apiUrl}/api/health`)
  const health = await healthResponse.json()
  const databaseMode = health?.data?.databaseMode
  if (databaseMode === 'postgres' && process.env.ALLOW_LIVE_UI_WRITES !== 'true') {
    throw new Error(
      'Full UI smoke tests create records and are blocked for PostgreSQL mode. Use DATABASE_MODE=memory or run npm run test:ui:track for the read-only tracking check.'
    )
  }

  const errors = []
  const browser = await chromium.launch(browserOptions())

  try {
    await runPassengerFlow(browser, errors)
    await runTrackingFlow(browser, errors)
    await runAdminFlow(browser, errors)
    await runMobileFlow(browser, errors)
    await runTabletFlow(browser, errors)
    assert.deepEqual(errors, [], `Browser errors:\n${errors.join('\n')}`)
    console.log(`UI smoke tests passed. Screenshots: ${outputDir}`)
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
