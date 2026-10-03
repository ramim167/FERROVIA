const { chromium } = require('playwright-core')
const { mkdirSync, writeFileSync } = require('node:fs')
const { resolve } = require('node:path')
const assert = require('node:assert/strict')
const { browserOptions } = require('./browser.cjs')
const out = resolve(__dirname, '../artifacts/motion-audit')
mkdirSync(out, { recursive: true })
async function main() {
  const browser = await chromium.launch(browserOptions())
  const reports = []
  try {
    // Each browser context has its own visible page, observer and animation clock.
    for (const theme of ['light','dark']) {
      await Promise.all([1440,1024,768,390,320].map(async width => {
        const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme })
        const page = await context.newPage()
        await page.goto('http://localhost:5173/?intro=0', { waitUntil: 'domcontentloaded' })
        const start = Date.now(), frames = []
        for (const seconds of [0,3,10,40]) {
          await page.waitForTimeout(Math.max(0, seconds * 1000 - (Date.now()-start)))
          const state = await page.locator('.hero-scene').evaluate(el => ({ mode: el.className, far: getComputedStyle(el.querySelector('.scene-far .scene-strip')).transform, trainHeight: el.querySelector('.train-art').getBoundingClientRect().height, overflow: document.documentElement.scrollWidth - innerWidth, visibility: document.visibilityState }))
          frames.push({ seconds, ...state })
          await page.screenshot({ path: resolve(out, `${theme}-${width}-${seconds}s.png`), fullPage: true })
        }
        // Wait for the next actual event, with no synthetic train injection.
        if (!await page.locator('.scene-distant').count()) await page.locator('.scene-distant').waitFor({ timeout: 42000 })
        await page.screenshot({ path: resolve(out, `${theme}-${width}-distant-train.png`), fullPage: true })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.locator('.hero-scene.is-idle').waitFor({timeout:10000})
        await page.screenshot({ path: resolve(out, `${theme}-${width}-reduced.png`) })
        reports.push({ theme, width, frames, distantTrainObserved: true })
        writeFileSync(resolve(out, 'report.json'), JSON.stringify(reports, null, 2))
        await context.close()
        console.log(`Motion sequence ${theme} ${width} passed`)
      }))
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto('http://localhost:5173/?intro=0', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3500)
    await page.mouse.move(1300, 600)
    await page.waitForTimeout(800)
    const pointer = await page.locator('.hero-scene').evaluate(el => Number(el.style.getPropertyValue('--pointer-x')))
    assert.ok(pointer > 0)
    await page.getByRole('button', { name: 'Switch to dark appearance' }).click()
    await page.waitForTimeout(500)
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
    await page.getByRole('button', { name: 'Switch to light appearance' }).click()
    await page.waitForTimeout(500)
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
    await page.goto('http://localhost:5173/?intro=1', { waitUntil: 'domcontentloaded' })
    for (let i = 0; i < 3; i++) { await page.waitForTimeout(700); await page.screenshot({ path: resolve(out, `intro-${i}.png`) }) }
    await page.waitForTimeout(2000)
    assert.equal(await page.locator('.intro').count(), 0)
    console.log('Pointer, live theme toggle and intro checks passed')
  } finally { await browser.close() }
}
main().catch(e => { console.error(e); process.exitCode = 1 })
