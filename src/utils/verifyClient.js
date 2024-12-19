import axios from 'axios'
import { createHash } from 'crypto'
import { getConfig } from './config.js'

export async function stringToUUID (string) {
  try {
    const hash = createHash('sha256').update(string).digest('hex')

    const uuid = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16),
      hash.substring(16, 20),
      hash.substring(20, 32)
    ].join('-')

    return uuid
  } catch (err) {
    console.log({ err })
  }
}

export async function getVeryfiSession (campaign) {
  const { VERYFI_CLIENT_ID, VERYFI_VALIDATE_URL } = getConfig(campaign)
  const headers = { 'CLIENT-ID': VERYFI_CLIENT_ID }

  try {
    const response = await axios.post(VERYFI_VALIDATE_URL, {}, { headers })
    return response.data.session
  } catch (err) {
    const message = err.response.data.detail ?? err.message
    return { ok: false, error: message }
  }
}
