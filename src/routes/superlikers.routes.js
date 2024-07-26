import { Router } from 'express'

import { getParticipantInfo, registerSale } from '../controllers/superlikers.controller.js'

const router = Router()

router.post('/participant_info', getParticipantInfo)
router.post('/register_sale', registerSale)

export default router
