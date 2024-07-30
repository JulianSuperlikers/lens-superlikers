import config from './config.js'

export const MICROSITES_ID = {
  'https://www.circulotena.com.mx/': config.TENA_CAMPAIGN_ID
}

export const MICROSITES_CONSTS = {
  sz: {
    uid: 'nickname',
    campaign: config.TENA_CAMPAIGN_ID,
    api_key: config.TENA_API_KEY,
    additionalProductsFields: {
      provider: 'TENA',
      line: 'TENA'
    },
    properties: (data) => {
      return { ticket: data.is_duplicate ? data.duplicate_of : data.id }
    }
  }
}

export const validateData = (data) => {
  if (data.line_items.length === 0) throw new Error('La factura no tiene productos.')
  if (data.is_duplicate) throw new Error('La factura está duplicada. Intenta subir otra factura.')

  return data
}

export const getItems = (data, additionalFields) => {
  return data.line_items.map(item => {
    const { description, price, quantity, total } = item

    const newItem = {
      ref: description,
      quantity,
      price: !price ? total / quantity : price
    }

    if (additionalFields) {
      return { ...newItem, ...additionalFields }
    }

    return newItem
  })
}

export const processDataByMicrosite = (micrositeUrl, participant, data) => {
  try {
    const microsite = MICROSITES_ID[micrositeUrl]
    const micrositeConsts = MICROSITES_CONSTS[microsite]
    validateData(data)

    const ref = data.is_duplicate ? data.duplicate_of : data.id
    const distinctId = participant[micrositeConsts.uid]
    const items = getItems(data, micrositeConsts.additionalProductsFields)

    const processedData = {
      ref,
      distinct_id: distinctId,
      products: items
    }

    if (micrositeConsts.properties) processedData.properties = micrositeConsts.properties(data)
    if (micrositeConsts.date) processedData.date = micrositeConsts.date(data)
    if (micrositeConsts.discount) processedData.discount = micrositeConsts.discount(data)
    if (micrositeConsts.category) processedData.category = micrositeConsts.category(data)

    return processedData
  } catch (err) {
    return { error: err.message }
  }
}
