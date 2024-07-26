/* eslint-disable camelcase */
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
  const participant = await getParticipantApi(request.body.uid)
  const { ref, products, properties, date, discount, category } = request.body

  try {
    const data = await registerSaleApi(participant.data.nickname, ref, products, properties, date, discount, category)
    response.status(200).json(data)
  } catch (err) {
    response.status(400).json({
      ok: false,
      error: err
    })
  }
}
