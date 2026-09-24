import 'dotenv/config'
import { createApp } from './app.js'
import { closeDatabase, initializeDatabase } from './config/database.js'
import { runScheduleMaintenance, startScheduleMaintenance } from './services/schedule.service.js'

const port = Number(process.env.PORT || 5000)

async function start() {
  await initializeDatabase()
  const app = createApp()
  const server = app.listen(port, () => {
    console.log(`FERROVIA API running on http://localhost:${port}`)
  })

  if (process.env.SCHEDULE_AUTO_GENERATE !== 'false') {
    runScheduleMaintenance()
      .then(({ cancellations, generation }) => {
        if (cancellations.cancelledTrips) {
          console.log(
            `Cancelled ${cancellations.cancelledTrips} unassigned departed trip(s); ` +
            `${cancellations.refundRequests} refund request(s) created`
          )
        }
        if (!generation.skipped) {
          console.log(
            `Upcoming trips ready: ${generation.upcomingTrips} in the next ${generation.days} operating days ` +
            `from ${generation.operatingDayStartHour}:00 (${generation.tripsAdded} trips added)`
          )
        }
      })
      .catch(error => {
        console.error('Initial schedule maintenance failed; the API will retry in the background:', error)
      })
    startScheduleMaintenance()
  }

  async function shutdown(signal) {
    console.log(`\n${signal} received. Closing FERROVIA API...`)
    server.close(async () => {
      try {
        await closeDatabase()
        process.exit(0)
      } catch (error) {
        console.error(error)
        process.exit(1)
      }
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch((error) => {
  console.error('Failed to start FERROVIA API:', error)
  process.exit(1)
})
