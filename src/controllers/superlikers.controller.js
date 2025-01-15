/* eslint-disable camelcase */
import { MICROSITES_CONSTS } from '../utils/processData.js'
import { getParticipantApi, registerSaleApi } from '../utils/superlikers.js'
import { addTagToDocument, updateDocument } from './veryfi.controller.js'

export const getParticipantInfo = async (request, response) => {
  const { campaign, uid } = request.body

  try {
    const data = await getParticipantApi(uid, campaign)

    response.status(200).json(data)
  } catch (err) {
    response.status(400).json({
      ok: false,
      error: err
    })
  }
}

export const registerSale = async (request, response) => {
  const { campaign, distinct_id, ref, products, properties, discount } = request.body

  const data = { campaign, distinct_id, ref, products, properties, discount, category: 'fisica' }

  try {
    const res = await registerSaleApi(data, campaign)

    const documentDataToUpdate = {
      external_id: res.invoice._id
    }

    await updateDocument(ref, documentDataToUpdate, campaign)

    const tag = { name: `points:${res.invoice.points}` }
    await addTagToDocument(ref, tag, campaign)

    response.status(200).json(res)
  } catch (err) {
    response.status(400).json({
      ok: false,
      error: err ?? err.message
    })
  }
}
