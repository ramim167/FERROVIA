const assert = require('node:assert/strict')
const { mkdirSync } = require('node:fs')
const { resolve } = require('node:path')
const { chromium } = require('playwright-core')

const appUrl = process.env.APP_URL || 'http://localhost:5173'
const { browserOptions } = require('./browser.cjs')
const outputDir = resolve(__dirname, '../artifacts/ui-smoke')

async function waitForAvailableTrains(page) {
  await page.getByText(/\d+ trains? available/).waitFor()
  await page.locator('.journey-card').first().waitFor()
}

async function main() {
  mkdirSync(outputDir, { recursive: true })
  const errors = []
  const browser = await chromium.launch(browserOptions())

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`)
    })

    await page.goto(`${appUrl}/?intro=0`, { waitUntil: 'networkidle' })

    const departure = page.getByPlaceholder('From where?')
    await departure.fill('Dh')
    const dhakaSuggestion = page.locator('.station-suggestions').getByText('Dhaka', { exact: true })
    await dhakaSuggestion.waitFor()
    await dhakaSuggestion.click()
    await page.locator('.station-suggestions').waitFor({ state: 'hidden' })
    assert.equal(await departure.inputValue(), 'Dhaka')

    await departure.fill('Cha')
    await page.locator('.station-suggestions').getByText('Chattogram', { exact: true }).waitFor()
    await page.screenshot({
      path: resolve(outputDir, 'station-suggestions-reopen.png'),
      fullPage: true,
    })

    await page.reload({ waitUntil: 'networkidle' })
    await page.getByPlaceholder('From where?').fill('Dhaka')
    await page.locator('.station-suggestions').getByText('Dhaka', { exact: true }).click()
    await page.getByPlaceholder('To where?').fill('Chattogram')
    await page.locator('.station-suggestions').getByText('Chattogram', { exact: true }).click()
    await page.getByRole('button', { name: 'Search trains' }).click()
    await waitForAvailableTrains(page)

    const expressFilterLabel = page
      .locator('.filter-pill')
      .filter({ hasText: 'Express' })
    const expressFilter = expressFilterLabel.getByRole('checkbox')
    await expressFilterLabel.click()
    assert.equal(await expressFilter.isChecked(), true)
    await page.getByText(/\d+ trains? available/).waitFor()
    await expressFilterLabel.click()
    assert.equal(await expressFilter.isChecked(), false)
    await waitForAvailableTrains(page)
    await page.screenshot({
      path: resolve(outputDir, 'filters-restored-results.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: 'Track a train' }).first().click()
    await page.getByRole('heading', { name: 'Track a train' }).waitFor()

    const input = page.getByRole('combobox', { name: 'Train name, code or Trip ID' })
    await input.fill('suborno')
    const option = page.getByRole('option', { name: /Suborno Express.*SUBORNO/i })
    await option.waitFor()
    await page.screenshot({
      path: resolve(outputDir, 'supabase-rangpur-suggestion.png'),
      fullPage: true,
    })

    await input.press('ArrowDown')
    await input.press('Enter')
    assert.equal(await input.inputValue(), 'SUBORNO')
    await page.getByRole('button', { name: 'Track train', exact: true }).click()
    await page.getByRole('heading', { name: 'Suborno Express' }).waitFor()

    await input.fill('sub')
    const overlayOption = page.getByRole('option').first()
    await overlayOption.waitFor()
    const suggestionIsOnTop = await overlayOption.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const topElement = document.elementFromPoint(
        rect.left + Math.min(20, rect.width / 2),
        rect.top + rect.height / 2
      )
      return topElement === element || element.contains(topElement)
    })
    assert.ok(suggestionIsOnTop, 'Train suggestions must render above the previous tracking result')
    await page.screenshot({
      path: resolve(outputDir, 'supabase-suggestions-over-result.png'),
      fullPage: true,
    })
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      'Track a train suggestions overflow horizontally'
    )

    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    })
    mobilePage.on('pageerror', error => errors.push(`mobile pageerror: ${error.message}`))
    mobilePage.on('console', message => {
      if (message.type() === 'error') errors.push(`mobile console: ${message.text()}`)
    })
    await mobilePage.goto(`${appUrl}/?intro=0`, { waitUntil: 'networkidle' })
    assert.ok(
      await mobilePage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      'Polished mobile home overflows horizontally'
    )
    await mobilePage.screenshot({
      path: resolve(outputDir, 'mobile-polished-home.png'),
      fullPage: true,
    })
    await mobilePage.close()

    assert.deepEqual(errors, [], `Browser errors:\n${errors.join('\n')}`)
    console.log('Read-only train suggestion test passed (Suborno Express / SUBORNO).')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
