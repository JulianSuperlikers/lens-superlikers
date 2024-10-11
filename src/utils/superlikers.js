/* eslint-disable camelcase */
import axios from 'axios'
import config from './config.js'

export const getParticipantApi = async (distinctId) => {
  try {
    const response = await axios.get(`${config.SUPERLIKERS_URL}/participants/info`, {
      params: {
        campaign: config.TENA_CAMPAIGN_ID,
        distinct_id: distinctId
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

export const registerSaleApi = async (data, apiKey) => {
  try {
    const response = await axios.post(`${config.SUPERLIKERS_URL}/retail/buy`, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })

    return response.data
  } catch (err) {
    const message = err.response.data.message ?? err.message
    return { ok: false, error: message }
  }
}
