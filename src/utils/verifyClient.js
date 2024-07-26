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
