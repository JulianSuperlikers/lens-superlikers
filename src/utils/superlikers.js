/* eslint-disable camelcase */
import axios from 'axios'
import config from './config.js'

export const getParticipantApi = async (distinctId) => {
  try {
    const response = await axios.get(`${config.SUPERLIKERS_URL}/participants/info`, {
      params: {
        campaign: config.TENA_CAMPAIGN_ID,
        distinct_id: distinctId,
        api_key: config.TENA_API_KEY
      },
      headers: {
        Authorization: `Bearer ${config.TENA_API_KEY}`
      }
    })

    const { ok, object } = response.data

    return { ok, data: object }
  } catch (err) {
    const message = err.response.data.message ?? err.message
    return { ok: false, error: message }
  }
}

export const registerSaleApi = async (distinct_id, ref, products, properties, date, discount, category) => {
  const data = {
    campaign: config.TENA_CAMPAIGN_ID,
    api_key: config.TENA_API_KEY,
    distinct_id,
    ref,
    products
  }

  if (properties !== undefined) data.properties = properties
  if (date !== undefined) data.date = date
  if (discount !== undefined) data.discount = discount
  if (category !== undefined) data.category = category

  try {
    const response = await axios.post(`${config.SUPERLIKERS_URL}/retail/buy`, data, {
      headers: {
        Authorization: `Bearer ${config.TENA_API_KEY}`
      }
    })

    return response.data
  } catch (err) {
    const message = err.response.data.message ?? err.message
    return { ok: false, error: message }
  }
}
