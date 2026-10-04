const assert = require('node:assert/strict')
const { mkdirSync, readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { chromium } = require('playwright-core')
const { browserOptions } = require('./browser.cjs')

const base = process.env.APP_URL || 'http://localhost:5173'
const api = process.env.API_URL || 'http://localhost:5000'
const out = resolve(__dirname, '../artifacts/ticket-pdf-smoke')

async function main() {
  const health = await (await fetch(`${api}/api/health`)).json()
  assert.equal(health.data.databaseMode, 'memory', 'Ticket test requires the memory database')
  mkdirSync(out, { recursive: true })
  const browser = await chromium.launch(browserOptions())
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Dhaka' })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${base}/?intro=0`, { waitUntil: 'networkidle' })
    await page.getByPlaceholder('From where?').fill('Chattogram')
    await page.getByRole('option', { name: 'Chattogram', exact: true }).click()
    await page.getByPlaceholder('To where?').fill('Dhaka')
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click()
    await page.getByRole('button', { name: 'Search trains', exact: true }).click()
    await page.locator('.journey-card .fare-tile:not([disabled])').first().click()
    await page.locator('.seat:not([disabled])').first().click()
    await page.getByRole('button', { name: 'Continue to passengers', exact: true }).click()
    await page.getByLabel('Full name', { exact: true }).fill('PDF Test Passenger')
    await page.getByLabel('Age', { exact: true }).fill('28')
    await page.getByRole('button', { name: 'Hold seats and continue', exact: true }).click()
    await page.getByRole('tab', { name: 'Create account' }).click()
    const id = Date.now()
    await page.getByPlaceholder('Your full name').fill('PDF Test Passenger')
    await page.getByPlaceholder('you@example.com').fill(`pdf.${id}@ferrovia.local`)
    await page.locator('input[name="password"]').fill('PdfTest123!')
    await page.locator('.auth-form button[type=submit]').click()
    await page.getByRole('heading', { name: 'Review and pay' }).waitFor()
    await page.locator('.pay-method').filter({ hasText: 'Bank Transfer' }).click()
    await page.getByPlaceholder('Transfer reference number').fill(`PDF-${id}`)
    await page.getByRole('button', { name: /^Pay / }).click()
    await page.getByRole('heading', { name: /booked/ }).waitFor()
    const pnr = await page.locator('.eticket-pnr').innerText()
    const images = []
    for (const [label, theme, width] of [
      ['desktop-light', 'light', 1440],
      ['desktop-dark', 'dark', 1440],
      ['mobile-light', 'light', 390],
      ['mobile-dark', 'dark', 390],
    ]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate((theme) => { document.documentElement.dataset.theme = theme }, theme)
      const downloadEvent = page.waitForEvent('download')
      await page.getByRole('button', { name: 'Download PDF', exact: true }).click()
      const download = await downloadEvent
      assert.equal(download.suggestedFilename(), `ticket-${pnr}.pdf`)
      const file = resolve(out, `${label}.pdf`)
      await download.saveAs(file)
      await page.getByRole('button', { name: 'Download PDF', exact: true }).waitFor()
      const bytes = readFileSync(file)
      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
      const pdf = bytes.toString('latin1')
      assert.match(pdf, /\/Count 1\b/, 'Ticket should fit on one A4 page')
      assert.match(pdf, /\/Subtype \/Image/, 'PDF must include the ticket design')
      const image = pdf.match(/\/Subtype \/Image[\s\S]*?stream\r?\n([\s\S]*?)\r?\nendstream/)
      assert.ok(image, 'Ticket image stream is missing')
      images.push(image[1])
      assert.equal(await page.locator('iframe[title="Ticket PDF export"]').count(), 0, 'Export frame should be removed')
      assert.equal(await page.getByRole('alert').count(), 0)
      console.log(`${label}: downloaded ${download.suggestedFilename()} (${bytes.length} bytes)`)
    }
    images.forEach((image) => assert.equal(image, images[0], 'Ticket image must match across themes and viewport sizes'))
    await page.setViewportSize({ width: 794, height: 1123 })
    await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' })
    await page.locator('.confirm').screenshot({ path: resolve(out, 'print-ticket.png'), animations: 'disabled' })
    await page.pdf({ path: resolve(out, 'print-ticket.pdf'), format: 'A4', printBackground: true })
    assert.equal(await page.getByRole('button', { name: 'Download PDF', exact: true }).isVisible(), false)
    assert.deepEqual(errors, [], 'Browser errors')
    console.log('PASS: valid PDF with the same ticket image on desktop/mobile and light/dark; print still works.')
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
