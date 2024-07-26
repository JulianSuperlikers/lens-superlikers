/* eslint-disable camelcase */
import { getVeryfiSession, veryfiClient } from '../utils/verifyClient.js'
import config from '../utils/config.js'

export async function getSession (request, response) {
  const session = await getVeryfiSession(config.VERYFI_CLIENT_ID)

  response.status(200).json({ ok: true, session, client_id: config.VERYFI_CLIENT_ID })
}

export async function processDocument (request, response) {
  const { external_id, device_data, image } = request.body
  const ipAddress = request.connection.remoteAddress

  const [jsonResponse] = await Promise.all([veryfiClient.process_document_base64string(image, null, null, false, {
    tags: [ipAddress],
    external_id,
    device_data
  })])

  response.status(200).json(jsonResponse)
}
