const assert=require('node:assert/strict')
const {chromium}=require('playwright-core')
const AxeBuilder=require('@axe-core/playwright').default
const {mkdirSync,writeFileSync}=require('node:fs')
const {resolve}=require('node:path')
const {browserOptions}=require('./browser.cjs')
const out=resolve(__dirname,'../artifacts/checkout-edge-audit')
mkdirSync(out,{recursive:true})
const report={checks:[],screens:[],errors:[]}
async function request(path,body,token,method='POST') {
 const r=await fetch('http://localhost:5000/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});const p=await r.json();assert.ok(r.ok,JSON.stringify(p));return p.data
}
async function capture(page,name) {
 for(const theme of ['light','dark']) for(const width of [1440,1024,768,390,320]) {
  await page.setViewportSize({width,height:900});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await page.waitForTimeout(750)
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))
  await page.screenshot({path:resolve(out,`${name}-${theme}-${width}.png`),fullPage:true,animations:'disabled'})
  report.screens.push({name,theme,width,overflow,violations});writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2))
 }
 await page.setViewportSize({width:1440,height:900});console.log(name,'captured')
}
async function main(){
 assert.equal((await request('/health',null,null,'GET')).databaseMode,'memory')
 const passenger=await request('/auth/register',{fullName:'Expiry Audit',email:`expiry.${Date.now()}@ferrovia.local`,password:'Expiry123!',role:'PASSENGER'})
 const b=await chromium.launch(browserOptions())
 try{
  const c=await b.newContext({viewport:{width:1440,height:900},timezoneId:'Asia/Dhaka'})
  await c.addInitScript(s=>{localStorage.setItem('rail-token',s.token);localStorage.setItem('rail-user',JSON.stringify(s.user))},passenger)
  const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.clock.install()
  await p.goto('http://localhost:5173/?intro=0',{waitUntil:'networkidle'})
  await p.getByPlaceholder('From where?').fill('Chattogram');await p.getByRole('option',{name:'Chattogram',exact:true}).click()
  await p.getByPlaceholder('To where?').fill('Dhaka');await p.getByRole('option',{name:'Dhaka',exact:true}).click()
  await p.getByRole('button',{name:'Search trains',exact:true}).click()
  await p.locator('.journey-card .fare-tile:not([disabled])').first().click();await p.locator('.seat:not([disabled])').last().click()
  await p.getByRole('button',{name:'Continue to passengers'}).click()
  await p.getByLabel('Full name',{exact:true}).fill('Expiry Audit');await p.getByLabel('Age',{exact:true}).fill('30')
  const pending=p.waitForResponse(r=>r.url().endsWith('/api/bookings')&&r.request().method()==='POST')
  await p.getByRole('button',{name:'Hold seats and continue'}).click()
  const booking=(await (await pending).json()).data
  await p.getByRole('heading',{name:'Review and pay'}).waitFor()
  const expiry=new Date(booking.passengers.find(x=>x.hold_expires_at).hold_expires_at).getTime()
  await p.clock.setFixedTime(expiry-90000);await p.clock.runFor(1100)
  await p.locator('.hold-timer.is-urgent').waitFor();assert.equal(await p.getByRole('button',{name:/^Pay /}).isEnabled(),true)
  await capture(p,'hold-under-two-minutes')
  await p.clock.setFixedTime(expiry+1000);await p.clock.runFor(1100)
  await p.getByRole('button',{name:'Choose seats again'}).waitFor()
  assert.equal(await p.getByRole('button',{name:/^Pay /}).isDisabled(),true)
  await capture(p,'hold-expired')
  await p.getByRole('button',{name:'Choose seats again'}).click();await p.locator('.results-hero').waitFor()
  report.checks.push('Real server hold expiry drives warning, payment disabling and search recovery')
  await c.close()
  const admin=await request('/auth/login',{email:'admin@ferrovia.local',password:'Admin123!'})
  const requests=await request('/admin/cancellation-requests',null,admin.token,'GET')
  if(requests.length){
   const ac=await b.newContext({viewport:{width:1440,height:900}})
   await ac.addInitScript(s=>{localStorage.setItem('rail-token',s.token);localStorage.setItem('rail-user',JSON.stringify(s.user))},admin)
   const a=await ac.newPage();await a.goto('http://localhost:5173/?intro=0#/admin/cancellations',{waitUntil:'networkidle'})
   await a.locator('.review-card').filter({hasText:requests[0].pnr_number}).getByRole('button',{name:'Reject',exact:true}).click()
   await capture(a,'cancellation-rejection')
   const rejected=a.waitForResponse(r=>r.url().includes('/api/admin/cancellation-requests/')&&r.request().method()==='PATCH')
   await a.getByRole('dialog').getByRole('button',{name:'Reject request',exact:true}).click()
   assert.equal((await (await rejected).json()).data.status,'REJECTED')
   await a.getByText('Cancellation rejected. The booking remains confirmed.').waitFor()
   report.checks.push('Admin rejects a cancellation and receives confirmed-booking feedback')
   await ac.close()
  }
  writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2))
  assert.deepEqual(report.errors,[])
  assert.equal(report.screens.filter(s=>s.overflow>1||s.violations.some(v=>['serious','critical'].includes(v.impact))).length,0)
  console.log(report.checks)
 }finally{await b.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
