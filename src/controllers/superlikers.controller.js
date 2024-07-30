/* eslint-disable camelcase */
import { MICROSITES_CONSTS, MICROSITES_ID } from '../utils/processData.js'
import { getParticipantApi, registerSaleApi } from '../utils/superlikers.js'

export const getParticipantInfo = async (request, response) => {
  try {
    const data = await getParticipantApi(request.body.uid)

    response.status(200).json(data)
  } catch (err) {
    response.status(400).json({
      ok: false,
      error: err
    })
  }
}

export const registerSale = async (request, response) => {
  const { microsite_url, distinct_id, ref, products, properties, date, discount, category } = request.body

  const microsite = MICROSITES_ID[microsite_url]

  const apiKey = MICROSITES_CONSTS[microsite].api_key

  if (!microsite || !apiKey) {
    throw new Error('micrositio no válido.')
  }

  const data = { campaign: microsite, distinct_id, ref, products, properties, date, discount, category }

  try {
    const res = await registerSaleApi(data, apiKey)
    response.status(200).json(res)
  } catch (err) {
    response.status(400).json({
      ok: false,
      error: err ?? err.message
    })
  }
}
