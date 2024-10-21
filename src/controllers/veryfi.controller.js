/* eslint-disable camelcase */
import axios from 'axios'
import config from '../utils/config.js'

import { getVeryfiSession, veryfiClient } from '../utils/verifyClient.js'
import { getParticipantApi, registerSaleApi } from '../utils/superlikers.js'
import { processDataByMicrosite, validateData } from '../utils/processData.js'

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

    const error = validateData(json_response)
    if (error) throw new Error(error)

    // const updateResponse = await updateDocument(document)
    // console.log({ updateResponse })

    const data = processDataByMicrosite(microsite, participant.data, json_response)

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
  const { data } = request.body

  const micrositeUrl = 'https://www.circulotena.com.mx/'
  const microsite = config.TENA_CAMPAIGN_ID
  const apiKey = config.TENA_API_KEY

  try {
    const documentsPromises = data.map(item => getDocumentById(item.id))
    const documents = await Promise.all(documentsPromises)

    const documentsProcessedDataPromises = documents.map(async document => {
      const error = validateData(document)
      if (error) return null

      const participant = await getParticipantApi(document.external_id)
      return processDataByMicrosite(micrositeUrl, participant.data, document, false)
    })

    const documentsProcessedData = await Promise.all(documentsProcessedDataPromises)
    const filteredDocumentsProcessedData = documentsProcessedData.filter(item => !!item)

    const registerSalesPromises = filteredDocumentsProcessedData.map(async item => {
      const { distinct_id, ref, products, properties, date, discount } = item
      const data = { campaign: microsite, distinct_id, ref, products, properties, date, discount, category: 'fisica' }

      return await registerSaleApi(data, apiKey)
    })

    await Promise.all(registerSalesPromises)

    response.status(200)
  } catch (err) {
    console.log(err)
  }
}

export async function getDocumentById (documentId) {
  const params = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.veryfi.com/api/v8/partner/documents/${documentId}`,
    headers: {
      Accept: 'Application/json',
      'CLIENT-ID': config.VERYFI_CLIENT_ID,
      AUTHORIZATION: `apikey ${config.VERYFI_USERNAME}:${config.VERYFI_API_KEY}`
    }
  }

  try {
    const { data } = await axios(params)

    if (data.ok === false) throw new Error(data.error)
    return data
  } catch (err) {
    const message = err.response.data.message ?? err.message
    return { ok: false, error: message }
  }
}

export async function updateDocument (updatedDocument) {
  const params = {
    method: 'put',
    maxBodyLength: Infinity,
    url: `https://api.veryfi.com/api/v8/partner/documents/${updatedDocument.id}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'Application/json',
      'CLIENT-ID': config.VERYFI_CLIENT_ID,
      AUTHORIZATION: `apikey ${config.VERYFI_USERNAME}:${config.VERYFI_API_KEY}`
    },
    data: JSON.stringify({
      meta: {
        device_user_uuid: updateDocument.device_user_uuid
      }
    })
  }

  try {
    const { data } = await axios(params)

    if (data.ok === false) throw new Error(data.error)
    return data
  } catch (err) {
    console.log({ err: JSON.stringify(err) })
    console.log(JSON.stringify(err.data))
    const message = err.response.data.message ?? err.message
    return { ok: false, error: message }
  }
}
