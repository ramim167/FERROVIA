import * as adminService from '../services/admin.service.js'
import { forbidden } from '../utils/httpError.js'

export async function routes(_req, res) {
  res.json({ success: true, data: await adminService.routes() })
}

export async function trainServices(_req, res) {
  const data = await adminService.trainServices()

  res.json({
    success: true,
    data,
  })
}

export async function trainServiceDetails(req, res) {
  const data = await adminService.trainServiceDetails(
    Number(req.params.trainId)
  )

  res.json({
    success: true,
    data,
  })
}
//change
export async function updateTrainInfo(req, res) {
  const data = await adminService.updateTrainInfo(
    Number(req.params.trainId),
    req.body
  )

  res.json({
    success: true,
    data,
  })
}

export async function updateRouteInfo(req, res) {
  const data = await adminService.updateRouteInfo(
    Number(req.params.routeId),
    req.body
  )

  res.json({
    success: true,
    data,
  })
}

export async function operators(_req, res) {
  res.json({ success: true, data: await adminService.operators() })
}

export async function trips(req, res) {
  res.json({ success: true, data: await adminService.trips(req.query.date || null) })
}

export async function trainsets(req, res) {
  const trainId = req.query.trainId ? Number(req.query.trainId) : null
  res.json({ success: true, data: await adminService.trainsets(trainId) })
}

export async function rejectTripIssue(_req, _res) {
  throw forbidden('Trips are issued automatically from route running days. Assign an operator to the generated trip instead.')
}

export async function assignOperator(req, res) {
  const data = await adminService.setOperator(Number(req.params.tripId), Number(req.body.operatorUserId))
  res.json({ success: true, data })
}

export async function assignTrainset(req, res) {
  const data = await adminService.setTrainset(
    Number(req.params.tripId),
    Number(req.body.trainsetId)
  )
  res.json({ success: true, data })
}


export async function trainFormOptions(_req, res) {
  res.json({
    success: true,
    data: await adminService.trainFormOptions(),
  })
}

export async function createTrainService(req, res) {
  const data =
    await adminService.createTrainService(req.body)

  res.status(201).json({
    success: true,
    data,
  })
}
