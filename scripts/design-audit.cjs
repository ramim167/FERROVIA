const assert = require('node:assert/strict')
const { mkdirSync, writeFileSync, existsSync, readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { chromium } = require('playwright-core')
const AxeBuilder = require('@axe-core/playwright').default
const { browserOptions } = require('./browser.cjs')
const base = process.env.APP_URL || 'http://localhost:5173'
const out = resolve(__dirname, '../artifacts/design-audit')
mkdirSync(out, { recursive: true })
const report = process.env.AUDIT_RESUME && existsSync(resolve(out,'report.json')) ? JSON.parse(readFileSync(resolve(out,'report.json'))) : { screens: [], errors: [], motion: {} }
async function login(role) {
  const response = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `${role}@ferrovia.local`, password: role === 'admin' ? 'Admin123!' : 'Operator123!' }) })
  return (await response.json()).data
}
async function capture(page, name, theme, width, audit = true) {
  const index = report.screens.findIndex(s=>s.name===name && s.theme===theme && s.width===width)
  if(process.env.AUDIT_RESUME && index>=0 && !report.screens[index].violations.length && report.screens[index].overflow<=0 && !['home','search','support'].includes(name)) return
  if(index>=0) report.screens.splice(index,1)
  await page.waitForTimeout(350)
  await page.evaluate(async () => {
    for (const section of document.querySelectorAll('.reveal')) { section.scrollIntoView({block:'center'}); await new Promise(r => setTimeout(r, 150)) }
    scrollTo(0, 0)
  })
  await page.waitForTimeout(750)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  const violations = audit ? (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) : []
  const file = `${name}-${theme}-${width}.png`
  await page.screenshot({ path: resolve(out, file), fullPage: true, animations: 'disabled', timeout: 60000 })
  report.screens.push({ name, theme, width, overflow, violations, file })
  writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`${name} ${theme} ${width}: overflow=${overflow}, axe=${violations.length}`)
}
async function main() {
  const browser = await chromium.launch(browserOptions())
  try {
    const admin = await login('admin'), operator = await login('operator')
    for (const theme of ['light', 'dark']) {
      for (const width of [1440, 1024, 768, 390, 320]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme })
        await context.addInitScript(theme => { localStorage.setItem('ferrovia-theme', theme); sessionStorage.setItem('ferrovia-intro-seen', '1') }, theme)
        const page = await context.newPage()
        page.on('pageerror', e => report.errors.push(e.message))
        for (const route of ['home', 'search', 'tickets', 'dashboard', 'notifications', 'track', 'support', 'does-not-exist']) {
          await page.goto(`${base}/?intro=0#/${route}`, { waitUntil: 'networkidle' })
          await capture(page, route, theme, width)
        }
        await page.goto(`${base}/?intro=0`, { waitUntil: 'networkidle' })
        await page.getByRole('button', { name: 'Sign in', exact: true }).first().click()
        await capture(page, 'signin', theme, width)
        await page.getByRole('tab', { name: 'Create account', exact: true }).click()
        await page.getByLabel('Account type').selectOption('OPERATOR')
        await capture(page, 'register-operator', theme, width)
        await page.keyboard.press('Escape')
        for (const [session, routes] of [[admin, ['admin', 'admin/assign-trip', 'admin/add-train', 'admin/edit-train', 'admin/cancellations', 'admin/operator-approvals']], [operator, ['operator']]]) {
          await page.evaluate(session => { localStorage.setItem('rail-token', session.token); localStorage.setItem('rail-user', JSON.stringify(session.user)) }, session)
          await page.reload({ waitUntil: 'networkidle' })
          for (const route of routes) {
            await page.goto(`${base}/?intro=0#/${route}`, { waitUntil: 'networkidle' })
            await page.locator('main:not([aria-busy]):visible').first().waitFor()
            await capture(page, route.replace('/', '-'), theme, width)
          }
        }
        await context.close()
      }
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(`${base}/?intro=0`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3200)
    const client = await page.context().newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    report.motion.profile = await page.evaluate(() => new Promise(resolve => {
      const times = [], start = performance.now(); let last = start, cls = 0
      const observer = new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) cls += e.value }))
      observer.observe({ type: 'layout-shift', buffered: true })
      function frame(now) { times.push(now - last); last = now; if (now - start < 6000) requestAnimationFrame(frame); else { observer.disconnect(); resolve({ frames: times.length, averageMs: times.reduce((a,b)=>a+b,0)/times.length, over50ms: times.filter(t=>t>50).length, cls }) } }
      requestAnimationFrame(frame)
    }))
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    report.motion.pausedOffscreen = await page.locator('.hero-scene').evaluate(el => el.classList.contains('is-paused') && [...el.querySelectorAll('*')].filter(e => getComputedStyle(e).animationName !== 'none').every(e => getComputedStyle(e).animationPlayState === 'paused'))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.evaluate(() => scrollTo(0, 0))
    await page.waitForTimeout(100)
    report.motion.reduced = await page.locator('.hero-scene').evaluate(el => el.classList.contains('is-idle') && el.getAnimations({ subtree: true }).every(a => a.playState !== 'running'))
    await page.screenshot({ path: resolve(out, 'reduced-motion.png') })
    writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2))
    assert.equal(report.errors.length, 0)
    assert.equal(report.screens.filter(s => s.overflow > 1).length, 0, 'Horizontal overflow; see report.json')
    assert.equal(report.screens.filter(s => s.violations.some(v => ['serious','critical'].includes(v.impact))).length, 0, 'Accessibility failures; see report.json')
    assert.ok(report.motion.pausedOffscreen && report.motion.reduced)
    console.log('Design audit passed.', report.motion)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
