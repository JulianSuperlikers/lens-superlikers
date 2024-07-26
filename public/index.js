/* eslint-disable camelcase */
import VeryfiLens from '../veryfi-lens-wasm/veryfi-lens.js'
import { isNotDocumentMessage, showDataMessage, showParticipantError } from './messages.js'
import { checkCameraPermissions, createSubmitButton, getParticipantInfo, getQueryParams, getSession, processDocument, processImageResponse } from './utils.js'

const croppedImage = document.createElement('img')

let deviceData
let participant

const init = async () => {
  // Validate participant
  const { ok } = await checkParticipant()
  if (!ok) return

  // Check camera permissions
  const cameraStatus = await checkCameraPermissions()
  if (!cameraStatus) return

  // capture image on click
  const button = document.querySelector('button')
  button.addEventListener('click', captureWasm)

  // set veryfi data
  const session = await getSession()
  if (!session.ok) return showParticipantError(session.error)

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

  const veryfiContainer = document.getElementById('veryfi-container')
  veryfiContainer.style.display = 'none'

  container.appendChild(submitButton)
  submitButton.addEventListener('click', processImage)
}

const processImage = async () => {
  document.getElementById('preview').style.display = 'none'

  const statusMessage = document.createElement('h1')
  statusMessage.innerText = 'Loading...'
  document.getElementById('status').appendChild(statusMessage)

  const response = await processDocument(croppedImage.src, deviceData, participant.uid)
  const body = await response.json()

  if (!response.ok) {
    statusMessage.innerText = 'Document processing failed'
    return
  }

  const data = processImageResponse(body)

  if (data.status) {
    showDataMessage(data)
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
