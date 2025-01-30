/* eslint-disable camelcase */
import VeryfiLens from '../veryfi-lens-wasm/veryfi-lens.js'
import { isNotDocumentMessage, showFinalMessage, showParticipantError, showProcessError } from './messages.js'
import { createSubmitButton, createTakePhotoAgainButton, getParticipantInfo, getQueryParams, getSession, processDocument, reloadPage, saveData } from './utils.js'

/**
 * Global variables
 */

let deviceData
let session

const croppedImage = document.createElement('img')

const INITIAL_INDEX = {
  ua: { showActionsButtons: true },
  sz: { showActionsButtons: false }
}

/**
 * Inicializar la aplicación
 */

const init = async () => {
  const campaign = getQueryParams('microsite')
  if (!campaign) return

  await initSesionAndDeviceData()
  configureInitialDisplay(campaign)
  setupDocumentUpload()
}

/**
 * Configura la visualización inicial según la campaña.
 */
const configureInitialDisplay = (campaign) => {
  const initial = INITIAL_INDEX[campaign]
  if (!initial) return

  const actionsElement = document.querySelector('#actions')
  const contentElement = document.querySelector('#content')

  if (initial.showActionsButtons) {
    actionsElement.style.display = 'flex'
    contentElement.style.display = 'none'
  } else {
    actionsElement.style.display = 'none'
    contentElement.style.display = 'flex'
    initVerifyWithCamera()
  }

  const takePhotoButton = document.querySelector('#take_photo')
  takePhotoButton?.addEventListener('click', () => {
    actionsElement.style.display = 'none'
    contentElement.style.display = 'flex'
    initVerifyWithCamera()
  })
}

/**
 * Configura el botón para subir documentos.
 */
const setupDocumentUpload = async () => {
  const uploadFileButton = document.querySelector('#upload_file')
  const fileUploadInput = document.querySelector('#file_input')
  uploadFileButton?.addEventListener('click', () => {
    fileUploadInput?.click()
  })

  fileUploadInput.addEventListener('change', async (event) => {
    const files = event.target.files
    if (files.length === 0) return

    const file = files[0]

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) return

    const fileNameElement = document.querySelector('#file_name')
    fileNameElement.textContent = file.name

    const sendButton = document.querySelector('#send_document')
    sendButton.classList.toggle('hidden')

    sendButton.addEventListener('click', async () => {
      sendButton.disabled = true
      sendButton.innerText = 'Cargando ...'

      try {
        const base64String = await fileToBase64(file)
        await processImage(base64String)
      } catch (error) {
        console.error('Error al convertir el archivo:', error)
      }
    })
  })
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

const initSesionAndDeviceData = async () => {
  session = await getSession()
  if (!session.ok) return showParticipantError(session.error)

  VeryfiLens.setLensSessionKey(session.session)
  deviceData = await VeryfiLens.getDeviceData()
}

const initVerifyWithCamera = async () => {
// capture image on click
  const button = document.querySelector('button')
  button.addEventListener('click', captureWasm)

  await VeryfiLens.initWasm(session.session, session.client_id)
}

const captureWasm = async () => {
  const image = await VeryfiLens.captureWasm()

  const isDocument = await VeryfiLens.getIsDocument()
  if (!isDocument) return isNotDocumentMessage()

  croppedImage.src = `data:image/jpeg;base64,${image}`

  const container = document.getElementById('preview')
  container.appendChild(croppedImage)

  const submitButton = createSubmitButton()
  const takePhotoButton = createTakePhotoAgainButton()

  const veryfiContainer = document.getElementById('veryfi-container')
  veryfiContainer.style.display = 'none'

  container.appendChild(submitButton)
  container.appendChild(takePhotoButton)

  submitButton.addEventListener('click', async () => {
    document.getElementById('preview').style.display = 'none'

    await processImage(croppedImage.src)
  })

  takePhotoButton.addEventListener('click', () => reloadPage())
}

const processImage = async (file) => {
  // Validate participant
  const { ok } = await checkParticipant()
  if (!ok) return

  const response = await processDocument(file, deviceData)
  const body = await response.json()

  if (!response.ok) {
    showProcessError(body.error ?? 'Document processing failed')
    return
  }

  const res = await saveData(body)

  if (!res.ok) {
    showProcessError(response.error)
  } else {
    showFinalMessage()
  }
}

const checkParticipant = async () => {
  const uid = getQueryParams('uid')
  const campaign = getQueryParams('microsite')
  if (!uid) return showParticipantError('No se encontró un participante.')

  const response = await getParticipantInfo(uid, campaign)

  if (!response.ok) showParticipantError(response.error)
  return response
}

init()
