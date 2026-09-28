import { Router } from 'express'
import { create } from '../controllers/chat.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/', asyncHandler(create))

export default router
