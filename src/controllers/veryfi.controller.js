/* eslint-disable camelcase */
import { getVeryfiSession, veryfiClient } from '../utils/verifyClient.js'
import config from '../utils/config.js'
import { getParticipantApi } from '../utils/superlikers.js'
import { processDataByMicrosite } from '../utils/processData.js'

export async function getSession (request, response) {
  try {
    const session = await getVeryfiSession(config.VERYFI_CLIENT_ID)

    if (session.ok === false) throw new Error(session.error)

    response.status(200).json({ ok: true, session, client_id: config.VERYFI_CLIENT_ID })
  } catch (err) {
    response.status(400).json({
      ok: false,
      error: err.message
    })
  }
}

export async function processDocument (request, response) {
  try {
    const { external_id, device_data, image, microsite, uid } = request.body

    const participant = await getParticipantApi(uid)
    const ip_address = request.connection.remoteAddress

    const [json_response] = await Promise.all([veryfiClient.process_document_base64string(image, null, null, false, {
      tags: [ip_address],
      external_id,
      device_data
    })])

    const data = processDataByMicrosite(microsite, participant.data, json_response)

    if (data.error) throw new Error(data.error)

    response.status(200).json(data)
  } catch (err) {
    console.log(err)
    response.status(400).json({
      ok: false,
      error: err.message
    })
  }
}

export async function webhook (request, response) {
  console.log(request.body)
  response.status(200)
}
