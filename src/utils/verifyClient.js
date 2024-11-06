import axios from 'axios'
import Client from '@veryfi/veryfi-sdk'

import { createHash } from 'crypto'

import config from './config.js'

export const veryfiClient = new Client(
  config.VERYFI_CLIENT_ID,
  config.VERYFI_CLIENT_SECRET,
  config.VERYFI_USERNAME,
  config.VERYFI_API_KEY,
  config.VERYFI_BASE_URL,
  'v8',
  120
)

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

export async function getVeryfiSession (clientId) {
  const headers = { 'CLIENT-ID': clientId }

  try {
    const response = await axios.post(config.VERYFI_VALIDATE_URL, {}, { headers })
    return response.data.session
  } catch (err) {
    const message = err.response.data.detail ?? err.message
    return { ok: false, error: message }
  }
}
