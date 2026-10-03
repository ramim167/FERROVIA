const assert = require('node:assert/strict')
const { chromium } = require('playwright-core')
const AxeBuilder = require('@axe-core/playwright').default
const { mkdirSync, writeFileSync, existsSync, readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { browserOptions } = require('./browser.cjs')
const out = resolve(__dirname, '../artifacts/admin-workflow')
mkdirSync(out, { recursive: true })
const previous = process.env.AUDIT_RESUME && existsSync(resolve(out,'report.json')) ? JSON.parse(readFileSync(resolve(out,'report.json'))) : {screens:[],checks:[],errors:[]}
const {checks,screens,errors} = previous
async function api(path, body, token, method = 'POST') {
  const response = await fetch(`http://localhost:5000/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const result = await response.json(); assert.ok(response.ok, result.error); return result.data
}
async function matrix(page, name) {
  for (const theme of ['light','dark']) for (const width of [1440,1024,768,390,320]) {
    const index = screens.findIndex(s=>s.name===name && s.theme===theme && s.width===width)
    if(process.env.AUDIT_RESUME && index>=0 && !screens[index].violations.length && screens[index].overflow<=0) continue
    if(index>=0) screens.splice(index,1)
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme }, theme)
    await page.waitForTimeout(750)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    const violations = (await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))
    await page.screenshot({path:resolve(out,`${name}-${theme}-${width}.png`),fullPage:true,animations:'disabled'})
    screens.push({name,theme,width,overflow,violations})
    writeFileSync(resolve(out,'report.json'),JSON.stringify({checks,screens,errors},null,2))
    console.log(`${name} ${theme} ${width}: overflow=${overflow}, axe=${violations.length}`)
  }
  await page.setViewportSize({width:1440,height:900})
}
async function main() {
  assert.equal((await api('/health',null,null,'GET')).databaseMode,'memory')
  const admin = await api('/auth/login',{email:'admin@ferrovia.local',password:'Admin123!'})
  const browser = await chromium.launch(browserOptions())
  try {
    const context = await browser.newContext({viewport:{width:1440,height:900}})
    const page = await context.newPage()
    page.on('pageerror',e=>errors.push(e.message))
    await page.addInitScript(session=>{localStorage.setItem('rail-token',session.token);localStorage.setItem('rail-user',JSON.stringify(session.user))},admin)
    await page.goto('http://localhost:5173/?intro=0#/admin/add-train',{waitUntil:'networkidle'})
    const unique=Date.now().toString().slice(-7), code=`QA${unique}`
    await page.getByLabel('Train name',{exact:true}).fill(`Audit Express ${unique}`)
    await page.getByLabel('Service code',{exact:true}).fill(code)
    for(const [direction,from,to,start,end,num] of [['up','Dhaka','Chattogram','08:00','13:00','901'],['down','Chattogram','Dhaka','16:00','21:00','902']]) {
      const section=page.locator(`#service-${direction}`)
      await section.getByLabel('Train number',{exact:true}).fill(num)
      await section.getByLabel('Route code',{exact:true}).fill(`${code}-${direction}`)
      const source=await section.getByLabel('Source station').locator('option').allTextContents()
      await section.getByLabel('Source station').selectOption({label:source.find(x=>x.includes(from))})
      const dest=await section.getByLabel('Destination station').locator('option').allTextContents()
      await section.getByLabel('Destination station').selectOption({label:dest.find(x=>x.includes(to))})
      await section.locator('.admin-train-grid input[type=time]').fill(start)
      for(const check of await section.getByRole('checkbox').all()) await check.check()
      await section.getByLabel('Distance km').nth(0).fill('0')
      await section.getByLabel('Distance km').nth(1).fill('300')
      await section.getByLabel('Arrival',{exact:true}).nth(1).fill(end)
    }
    for(let i=0;i<3;i++) {
      const row=page.locator('#service-trainsets .admin-repeat-row').nth(i)
      await row.locator('input').fill(`${code}-SET${i+1}`)
      await row.getByLabel('Trainset current station').selectOption({index:i===1?2:1})
    }
    await page.getByLabel('Fare class').selectOption({index:1})
    await page.getByPlaceholder('Base fare').fill('0')
    await page.getByPlaceholder('Rate / km').fill('2')
    await page.getByPlaceholder('Coach code e.g. A').fill('A')
    await page.getByLabel('Coach class').selectOption({index:1})
    await page.getByPlaceholder('Seat count').fill('20')
    await matrix(page,'add-train-complete')
    const create=page.waitForResponse(r=>r.url().endsWith('/api/admin/train-services')&&r.request().method()==='POST')
    await page.getByRole('button',{name:'Create complete train service'}).click()
    const response=await create; const payload=await response.json();assert.ok(response.ok(),JSON.stringify(payload))
    checks.push('Complete train service created through the extracted form sections')
    const trainId=payload.data.trainId
    assert.ok(trainId, JSON.stringify(payload))
    await page.goto('http://localhost:5173/?intro=0#/admin/edit-train',{waitUntil:'networkidle'})
    await page.locator('.admin-train-selector select').selectOption(String(trainId))
    await page.getByRole('tab',{name:'Basic info',exact:true}).waitFor()
    for(const tab of ['Basic info','Routes & schedule','Trainsets','Fares','Coaches & seats']) {
      await page.getByRole('tab',{name:new RegExp(`^${tab.replace('&','&')}`)}).click()
      await matrix(page,`edit-${tab.replaceAll(' ','-').replaceAll('&','and')}`)
    }
    await page.getByRole('tab',{name:'Basic info',exact:true}).click()
    await page.getByLabel('Train Name',{exact:true}).fill(`Audit Express ${unique} revised`)
    const saveBasic=page.waitForResponse(r=>r.url().includes(`/admin/train-services/${trainId}`)&&r.request().method()==='PATCH')
    await page.locator('form.admin-edit-section button[type=submit], form.admin-edit-section button.primary').click()
    assert.ok((await saveBasic).ok())
    await page.getByRole('tab',{name:/Routes & schedule/}).click()
    const route=page.locator('.admin-route-editor').first()
    await route.getByLabel('Route code').fill(`${code}-revised`)
    const saveRoute=page.waitForResponse(r=>r.url().includes('/api/admin/routes/')&&r.request().method()==='PATCH')
    await route.getByRole('button',{name:'Save route'}).click();assert.ok((await saveRoute).ok())
    checks.push('Basic train information and route saved through UI')
    const operatorEmail=`operator.audit.${unique}@ferrovia.local`
    await api('/auth/register',{fullName:`Audit Operator ${unique}`,email:operatorEmail,password:'Audit123!',role:'OPERATOR'})
    await page.goto('http://localhost:5173/?intro=0#/admin/operator-approvals',{waitUntil:'networkidle'})
    await page.locator('.approval-card').filter({hasText:operatorEmail}).getByRole('button',{name:'Approve operator'}).click()
    await page.getByRole('dialog').getByRole('button',{name:'Approve operator'}).click()
    await page.getByText(/can now sign in/).waitFor()
    await api('/auth/login',{email:operatorEmail,password:'Audit123!'})
    checks.push('Operator approved in UI and successfully signs in')
    await page.goto('http://localhost:5173/?intro=0#/admin/assign-trip',{waitUntil:'networkidle'})
    const available=page.locator('.issued-trip-list > button:not([disabled])')
    await available.first().click()
    const assignTrain=page.getByRole('button',{name:'Assign trainset',exact:true})
    if(await assignTrain.count()){await assignTrain.first().click();await page.getByText(/assigned/i).first().waitFor()}
    const operatorSelect=page.locator('.inline-assign select:not([disabled])').first()
    if(await operatorSelect.count()) {await operatorSelect.selectOption({index:1});await operatorSelect.locator('..').getByRole('button',{name:'Assign',exact:true}).click()}
    await matrix(page,'assignments-updated')
    checks.push('Future trip trainset/operator assignment controls exercised')
    writeFileSync(resolve(out,'report.json'),JSON.stringify({checks,screens,errors},null,2))
    assert.deepEqual(errors,[])
    assert.equal(screens.filter(s=>s.overflow>1||s.violations.some(v=>['serious','critical'].includes(v.impact))).length,0,'See admin workflow report')
  } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
