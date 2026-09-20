import { Router } from 'express'
import {
  assignOperator,
  createTrip,
  operators,
  routes,
  trainsets,
  trips,
  trainServices,
  trainServiceDetails,
  updateTrainInfo,
  updateRouteInfo,
  trainFormOptions,
  createTrainService,
} from '../controllers/admin.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth, requireRole('ADMIN'))
router.get('/routes', asyncHandler(routes))
router.get('/operators', asyncHandler(operators))
router.get('/trips', asyncHandler(trips))
router.get('/trainsets', asyncHandler(trainsets))
router.patch('/routes/:routeId', asyncHandler(updateRouteInfo))
router.get('/train-services', asyncHandler(trainServices))
router.get('/train-services/:trainId', asyncHandler(trainServiceDetails))
router.patch('/train-services/:trainId', asyncHandler(updateTrainInfo))
router.get(
  '/train-form-options',
  asyncHandler(trainFormOptions)
)

router.post(
  '/train-services',
  asyncHandler(createTrainService)
)
router.post('/trips', asyncHandler(createTrip))
router.patch('/trips/:tripId/operator', asyncHandler(assignOperator))
export default router
