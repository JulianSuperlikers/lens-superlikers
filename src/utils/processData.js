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

  const TAGS_MESSAGES = {
    NO_PRODUCT_FOUND: 'No se encontraron productos tena en esta factura.',
    DUPLICATED: 'La factura está duplicada. Intenta subir otra factura.',
    NOT_VALID_DATE: 'La fecha de la factura supera los el mes.',
    NO_VENDOR: 'No se puedo detectar el nombre de la tienda.'
  }

  if (data.tags.length > 0) {
    const tag = data.tags.at(0)
    const message = TAGS_MESSAGES[tag.name]

    if (message) throw new Error(message)
  }

  return data
}

export const getItems = (data, additionalFields) => {
  const products = []

  return data.line_items.forEach(item => {
    const { description, price, quantity, total, tags } = item

    if (!tags.includes('PRODUCT_FOUND')) return

    const newItem = {
      ref: description,
      quantity,
      price: !price ? total / quantity : price
    }

    if (additionalFields) return { ...newItem, ...additionalFields }

    products.push(newItem)
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
