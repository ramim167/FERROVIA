const assert = require('node:assert/strict')
const { mkdirSync } = require('node:fs')
const { resolve } = require('node:path')
const { chromium } = require('playwright-core')

const appUrl = process.env.APP_URL || 'http://localhost:5173'
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDir = resolve(__dirname, '../artifacts/ui-smoke')

async function main() {
  mkdirSync(outputDir, { recursive: true })
  const errors = []
  const browser = await chromium.launch({ executablePath, headless: true })

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`)
    })

    await page.goto(appUrl, { waitUntil: 'networkidle' })

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
    await page.getByPlaceholder('From where?').fill('Rangpur')
    await page.locator('.station-suggestions').getByText('Rangpur', { exact: true }).click()
    await page.getByPlaceholder('To where?').fill('Dhaka')
    await page.locator('.station-suggestions').getByText('Dhaka', { exact: true }).click()
    await page.getByRole('button', { name: 'Search trains' }).click()
    await page.getByText('1 trains available').waitFor()
    await page.locator('.train-card.visible').first().waitFor()

    const expressFilterLabel = page
      .locator('.filters .check')
      .filter({ hasText: 'EXPRESS' })
    const expressFilter = expressFilterLabel.getByRole('checkbox')
    await expressFilterLabel.click()
    assert.equal(await expressFilter.isChecked(), true)
    await page.getByText('0 trains available').waitFor()
    await expressFilterLabel.click()
    assert.equal(await expressFilter.isChecked(), false)
    await page.getByText('1 trains available').waitFor()
    await page.locator('.train-card.visible').first().waitFor()
    await page.screenshot({
      path: resolve(outputDir, 'filters-restored-results.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: 'Track Train' }).first().click()
    await page.getByRole('heading', { name: 'Track train operation' }).waitFor()

    const input = page.getByRole('combobox', { name: 'Train name, code or Trip ID' })
    await input.fill('rangpur express')
    const option = page.getByRole('option', { name: /Rangpur Express.*W-771/i })
    await option.waitFor()
    await page.screenshot({
      path: resolve(outputDir, 'supabase-rangpur-suggestion.png'),
      fullPage: true,
    })

    await input.press('ArrowDown')
    await input.press('Enter')
    assert.equal(await input.inputValue(), 'W-771')
    await page.getByRole('button', { name: 'Track train', exact: true }).click()
    await page.getByRole('heading', { name: 'Rangpur Express' }).waitFor()

    await input.fill('commuter')
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
      'Track Train suggestions overflow horizontally'
    )

    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    })
    mobilePage.on('pageerror', error => errors.push(`mobile pageerror: ${error.message}`))
    mobilePage.on('console', message => {
      if (message.type() === 'error') errors.push(`mobile console: ${message.text()}`)
    })
    await mobilePage.goto(appUrl, { waitUntil: 'networkidle' })
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
    console.log('Read-only Supabase train suggestion test passed (Rangpur Express / W-771).')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
