import { Router } from 'express'
import { getSession, processDocument } from '../controllers/veryfi.controller.js'

const router = Router()

router.post('/session', getSession)
router.post('/process', processDocument)

export default router
