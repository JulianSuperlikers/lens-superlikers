/* eslint-disable camelcase */
import axios from 'axios'
import { getConfig } from './config.js'

export const getParticipantApi = async (distinctId, campaignId) => {
  const { SUPERLIKERS_URL, CAMPAIGN_ID, API_KEY } = getConfig(campaignId)

  try {
    const response = await axios.get(`${SUPERLIKERS_URL}/participants/info`, {
      params: {
        campaign: CAMPAIGN_ID,
        distinct_id: distinctId
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    })

    const { ok, object } = response.data

    return { ok, data: object }
  } catch (err) {
    const message = err.response.data.message ?? err.message
    return { ok: false, error: message }
  }
}

export const registerSaleApi = async (data, campaignId) => {
  const { SUPERLIKERS_URL, API_KEY } = getConfig(campaignId)

  try {
    const response = await axios.post(`${SUPERLIKERS_URL}/retail/buy`, data, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    })

    return response.data
  } catch (err) {
    const message = err.response.data.message ?? err.message
    return { ok: false, error: message }
  }
}
