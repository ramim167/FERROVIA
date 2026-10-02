const { existsSync } = require('node:fs')
const { chromium } = require('playwright-core')

exports.browserOptions = () => {
  const candidates = [process.env.CHROME_PATH, chromium.executablePath(),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
  const executablePath = candidates.find(path => path && existsSync(path))
  if (!executablePath) throw new Error('Install a Playwright Chromium browser or set CHROME_PATH.')
  return { executablePath, headless: true }
}
