const { spawn } = require('node:child_process')

const databaseMode = process.argv.includes('--postgres')
  ? 'postgres'
  : process.argv.includes('--memory') ? 'memory' : null

const processes = [
  {
    name: 'server',
    command: 'npm --prefix server run dev',
  },
  {
    name: 'client',
    command: 'npm --prefix client run dev',
  },
]

const children = []
let shuttingDown = false

function prefixOutput(name, stream, data) {
  const lines = data.toString().split(/\r?\n/)
  for (const line of lines) {
    if (line.trim()) stream.write(`[${name}] ${line}\n`)
  }
}

function stopAll(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (!child.killed) child.kill()
  }

  process.exit(exitCode)
}

for (const config of processes) {
  const child = spawn(config.command, {
    cwd: __dirname + '/..',
    env: {
      ...process.env,
      ...(config.name === 'server' && databaseMode ? { DATABASE_MODE: databaseMode } : {}),
    },
    shell: true,
  })

  children.push(child)

  child.stdout.on('data', data => {
    prefixOutput(config.name, process.stdout, data)
  })

  child.stderr.on('data', data => {
    prefixOutput(config.name, process.stderr, data)
  })

  child.on('exit', code => {
    if (!shuttingDown) {
      console.log(`[${config.name}] exited with code ${code}`)
      stopAll(code || 0)
    }
  })
}

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))
