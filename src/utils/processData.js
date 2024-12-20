/* eslint-disable camelcase */
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
  let errorMessage = ''

  if (data.line_items.length === 0) errorMessage = 'No se encontraron productos TENA en esta factura.'
  if (data.is_duplicate) errorMessage = 'Parece que esta factura ya ha sido registrada. Sube una factura diferente.'

  const TAGS = ['NO_PRODUCT_FOUND', 'DUPLICATED', 'NO_DATE', 'NOT_VALID_DATE', 'NO_VENDOR', 'FRAUD', 'REJECTED']

  const TAGS_MESSAGES = {
    NO_PRODUCT_FOUND: 'No se encontraron productos TENA en esta factura.',
    DUPLICATED: 'Parece que esta factura ya ha sido registrada. Sube una factura diferente.',
    NOT_VALID_DATE: 'La fecha de la factura supera el periodo permitido. Por favor, sube una factura más reciente.',
    NO_DATE: 'No esta la fecha del ticket en la foto',
    NO_VENDOR: 'No pudimos identificar el nombre de la tienda. Intenta con una factura más legible.',
    FRAUD: 'Hemos detectado inconsistencias en la información proporcionada.',
    REJECTED: 'La factura no cumple con los criterios necesarios y ha sido rechazada.'
  }

  const foundTag = data.tags.find(item => {
    const hasTag = TAGS.includes(item.name)
    return hasTag ? item : undefined
  })

  if (foundTag) {
    const message = TAGS_MESSAGES[foundTag.name]
    if (message) errorMessage = message
  }

  if (errorMessage) {
    return `${errorMessage} Ref: ${data.id}`
  }
}

export const getItems = (data, additionalFields) => {
  const validItems = data.line_items.filter(item => item.tags.includes('PRODUCT_FOUND'))

  const products = validItems.map(item => {
    const { description, product_details, price, quantity, total } = item

    const ref = product_details.at(0) ? product_details.at(0).product_name : description

    const newItem = {
      ref,
      quantity,
      price: !price ? total / quantity : price,
      type: data.vendor.name
    }

    if (additionalFields) return { ...newItem, ...additionalFields }
    return newItem
  })

  const itemsDiscount = validItems.map(item => {
    if (!item.discount) return 0
    return item.discount < 0 ? item.discount * -1 : item.discount
  })

  const discount = itemsDiscount.reduce((ac, value) => ac + value, 0)

  return [products, discount]
}

export const processDataByMicrosite = (micrositeUrl, participant, data) => {
  try {
    const microsite = MICROSITES_ID[micrositeUrl]
    const micrositeConsts = MICROSITES_CONSTS[microsite]

    const ref = data.is_duplicate ? data.duplicate_of : data.id
    const distinctId = participant[micrositeConsts.uid]
    const [items, discount] = getItems(data, micrositeConsts.additionalProductsFields)

    const processedData = {
      ref,
      distinct_id: distinctId,
      products: items,
      discount
    }

    if (micrositeConsts.properties) processedData.properties = micrositeConsts.properties(data)
    if (micrositeConsts.date) processedData.date = micrositeConsts.date(data)
    if (micrositeConsts.category) processedData.category = micrositeConsts.category(data)

    return processedData
  } catch (err) {
    return { error: err.message }
  }
}
