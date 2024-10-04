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
  if (!navigator.permissions) {
    console.warn('Permissions API is not supported in this browser.')
    return true
  }

  try {
    const result = await navigator.permissions.query({ name: 'camera' })

    // Handle the permission status
    if (result.state === 'granted') {
      return true // Permission already granted
    } else if (result.state === 'denied') {
      return false // Permission denied
    } else {
      // Permission status is 'prompt' or unknown
      showCameraMessage(result.state)
      result.onchange = () => showCameraMessage(result.state)
      return result.state !== 'denied'
    }
  } catch (err) {
    console.error('Error checking camera permissions:', err)
    return false
  }
}

export const createSubmitButton = () => {
  const submitButton = document.createElement('button')
  submitButton.innerText = 'Enviar'
  submitButton.type = 'submit'
  submitButton.classList.add('submit-button')

  return submitButton
}

export const createTakePhotoAgainButton = () => {
  const takeAgain = document.createElement('button')
  takeAgain.innerText = 'Tomar la foto de nuevo'
  takeAgain.classList.add('take-button')

  return takeAgain
}

export const reloadPage = () => {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)

  // Set or update the 't' parameter
  params.set('t', new Date().getTime())

  // Construct the new URL with updated parameters
  const newUrl = `${url.origin}${url.pathname}?${params.toString()}`

  // Reload the page with the new URL
  window.location.href = newUrl
}
