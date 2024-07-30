/* eslint-disable camelcase */
import { showCameraMessage } from './messages.js'

export const getQueryParams = (param) => {
  const url = new URL(window.location.href)
  const queryParams = new URLSearchParams(url.search)

  const value = queryParams.get(param)
  return value
}

export const getParticipantInfo = async (uid) => {
  try {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify({ uid }),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const response = await fetch('/superlikers/participant_info', requestOptions)
    const body = await response.json()

    return body
  } catch (err) {
    return err
  }
}

export const getSession = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }

  return await fetch('/session', requestOptions)
    .then((response) => response.json())
    .catch((error) => error)
}

export const processDocument = async (image, deviceData, externalId) => {
  const uid = getQueryParams('uid')
  const microsite = getQueryParams('microsite')

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image,
      device_data: deviceData,
      external_id: externalId,
      uid,
      microsite
    })
  }
  return await fetch('/process', requestOptions)
}

export const saveData = async (data) => {
  data.microsite_url = getQueryParams('microsite')

  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return await fetch('/superlikers/register_sale', requestOptions)
    .then((response) => response.json())
    .catch((error) => error)
}

export const checkCameraPermissions = async () => {
  const result = await navigator.permissions.query({ name: 'camera' })

  showCameraMessage(result.state)
  result.onchange = () => showCameraMessage(result.state)

  return result.state !== 'denied'
}

export const createSubmitButton = () => {
  const submitButton = document.createElement('button')
  submitButton.innerText = 'Submit'
  submitButton.type = 'submit'
  submitButton.style.display = 'block'
  submitButton.style.marginTop = '10px'
  submitButton.style.backgroundColor = '#4CAF50'

  return submitButton
}
