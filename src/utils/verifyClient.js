import axios from 'axios'
import Client from '@veryfi/veryfi-sdk'

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
  const encoder = new TextEncoder()
  const data = encoder.encode(string)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convert hash to hex
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const uuid = [
    hashHex.substring(0, 8),
    hashHex.substring(8, 12),
    hashHex.substring(12, 16),
    hashHex.substring(16, 20),
    hashHex.substring(20, 32)
  ].join('-')

  return uuid
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
