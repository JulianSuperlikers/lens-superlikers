/* eslint-disable camelcase */
import axios from 'axios'
import { getConfig } from '../utils/config.js'
import Client from '@veryfi/veryfi-sdk'

import { getVeryfiSession, stringToUUID } from '../utils/verifyClient.js'
import { getParticipantApi, registerSaleApi } from '../utils/superlikers.js'
import { processDataByMicrosite, validateData } from '../utils/processData.js'

export async function getSession (request, response) {
  const { campaign } = request.body
  const { VERYFI_CLIENT_ID } = getConfig(campaign)

  try {
    const session = await getVeryfiSession(campaign)

    if (session.ok === false) throw new Error(session.error)

    response.status(200).json({ ok: true, session, client_id: VERYFI_CLIENT_ID })
  } catch (err) {
    response.status(400).json({
      ok: false,
      error: err.message
    })
  }
}

export async function processDocument (request, response) {
  const { device_data, image, campaign, uid } = request.body
  const { VERYFI_CLIENT_ID, VERYFI_USERNAME, VERYFI_API_KEY, VERYFI_BASE_URL, VERYFI_CLIENT_SECRET } = getConfig(campaign)

  try {
    const participant = await getParticipantApi(uid, campaign)
    const userUuid = await stringToUUID(uid)

    const deviceData = { ...device_data, user_uuid: userUuid }

    const veryfiClient = new Client(
      VERYFI_CLIENT_ID,
      VERYFI_CLIENT_SECRET,
      VERYFI_USERNAME,
      VERYFI_API_KEY,
      VERYFI_BASE_URL,
      'v8',
      120
    )

    const document = await veryfiClient.process_document_from_base64(
      image,
      null,
      null,
      false,
      { device_data: deviceData }
    )

    const documentDataToUpdate = {
      notes: uid
    }

    await updateDocument(document.id, documentDataToUpdate, campaign)

    const error = validateData(document)
    if (error) throw new Error(error)

    const data = processDataByMicrosite(campaign, participant.data, document)

    response.status(200).json(data)
  } catch (err) {
    console.log({ err })
    response.status(400).json({
      ok: false,
      error: err.message
    })
  }
}

export async function webhook (request, response) {
  // todo: revisar el campaign como se puede poner en el document de veryfi
  const { data, campaign } = request.body

  try {
    const documentsPromises = data.map(item => getDocumentById(item.id))
    const documents = await Promise.all(documentsPromises)

    const documentsProcessedDataPromises = documents.map(async document => {
      const error = validateData(document)
      if (error) return null

      const participant = await getParticipantApi(document.notes ?? document.external_id)
      return processDataByMicrosite(campaign, participant.data, document, false)
    })

    const documentsProcessedData = await Promise.all(documentsProcessedDataPromises)
    const filteredDocumentsProcessedData = documentsProcessedData.filter(item => !!item)

    const registerSalesPromises = filteredDocumentsProcessedData.map(async item => {
      const { distinct_id, ref, products, properties, date, discount } = item
      const data = { campaign, distinct_id, ref, products, properties, date, discount, category: 'fisica' }

      return await registerSaleApi(data, campaign)
    })

    await Promise.all(registerSalesPromises)

    response.status(200)
  } catch (err) {
    console.log(err)
  }
}

export async function getDocumentById (documentId, campaign) {
  const { VERYFI_CLIENT_ID, VERYFI_USERNAME, VERYFI_API_KEY } = getConfig(campaign)

  const params = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.veryfi.com/api/v8/partner/documents/${documentId}`,
    headers: {
      Accept: 'Application/json',
      'CLIENT-ID': VERYFI_CLIENT_ID,
      AUTHORIZATION: `apikey ${VERYFI_USERNAME}:${VERYFI_API_KEY}`
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

export async function updateDocument (id, data, campaign) {
  const { VERYFI_CLIENT_ID, VERYFI_USERNAME, VERYFI_API_KEY } = getConfig(campaign)

  const params = {
    method: 'put',
    maxBodyLength: Infinity,
    url: `https://api.veryfi.com/api/v8/partner/documents/${id}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'Application/json',
      'CLIENT-ID': VERYFI_CLIENT_ID,
      AUTHORIZATION: `apikey ${VERYFI_USERNAME}:${VERYFI_API_KEY}`
    },
    data
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

export async function addTagToDocument (id, tag, campaign) {
  const { VERYFI_CLIENT_ID, VERYFI_USERNAME, VERYFI_API_KEY } = getConfig(campaign)

  const params = {
    method: 'put',
    maxBodyLength: Infinity,
    url: `https://api.veryfi.com/api/v8/partner/documents/${id}/tags`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'Application/json',
      'CLIENT-ID': VERYFI_CLIENT_ID,
      AUTHORIZATION: `apikey ${VERYFI_USERNAME}:${VERYFI_API_KEY}`
    },
    data: JSON.stringify(tag)
  }

  try {
    const { data } = await axios(params)

    if (data.ok === false) throw new Error(data.error)
    return data
  } catch (err) {
    console.log(JSON.stringify(err.response.data))
    const message = err.response.data.error ?? err.message
    return { ok: false, error: message }
  }
}
