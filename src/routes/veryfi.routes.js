import { Router } from 'express'
import { getSession, processDocument, webhook } from '../controllers/veryfi.controller.js'

const router = Router()

router.post('/session', getSession)
router.post('/process', processDocument)
router.post('/webhook', webhook)

export default router
