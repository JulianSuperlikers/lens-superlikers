/* eslint-disable camelcase */
import VeryfiLens from '../veryfi-lens-wasm/veryfi-lens.js'
import { isNotDocumentMessage, showFinalMessage, showParticipantError, showProcessError } from './messages.js'
import { checkCameraPermissions, createSubmitButton, createTakePhotoAgainButton, getParticipantInfo, getQueryParams, getSession, processDocument, reloadPage, saveData } from './utils.js'

const croppedImage = document.createElement('img')

let deviceData
let participant

const init = async () => {
  // Check camera permissions
  const cameraStatus = await checkCameraPermissions()
  if (!cameraStatus) return

  // capture image on click
  const button = document.querySelector('button')
  button.addEventListener('click', captureWasm)

  // set veryfi data
  const session = await getSession()
  if (!session.ok) return showParticipantError(session.error)

  // Validate participant
  const { ok } = await checkParticipant()
  if (!ok) return

  VeryfiLens.setLensSessionKey(session.session)
  deviceData = VeryfiLens.getDeviceData()

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

  submitButton.addEventListener('click', processImage)
  takePhotoButton.addEventListener('click', () => reloadPage())
}

const processImage = async () => {
  document.getElementById('preview').style.display = 'none'

  const statusMessage = document.createElement('h1')
  statusMessage.innerText = 'Cargando...'
  document.getElementById('status').appendChild(statusMessage)

  const response = await processDocument(croppedImage.src, deviceData, participant.uid)
  const body = await response.json()

  statusMessage.remove()

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
  if (!uid) return showParticipantError('No se encontró un participante.')

  const response = await getParticipantInfo(uid)

  if (!response.ok) showParticipantError(response.error)

  participant = response.data
  return response
}

init()
