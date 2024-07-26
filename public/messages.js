/* eslint-disable no-undef */

import { getQueryParams, saveData } from './utils.js'

export const showCameraMessage = (state) => {
  if (state !== 'denied') return

  Swal.fire({
    title: 'Ups... Ha ocurrido un error!',
    text: 'Es necesario habilitar manualmente los permisos de uso de la cámara para tomar la foto de la factura.',
    icon: 'error',
    confirmButtonText: 'Regresar'
  }).then(() => {
    const microsite = getQueryParams('microsite')
    if (microsite) window.location.href = microsite
  })
}

export const isBlurryMessage = () => {
  Swal.fire({
    title: 'Ups... Ha ocurrido un error!',
    text: 'La imagen está borrosa, intentalo de nuevo.',
    icon: 'error',
    confirmButtonText: 'Tomar la foto de nuevo'
  }).then(() => {
    window.location.reload()
  })
}

export const isNotDocumentMessage = () => {
  Swal.fire({
    title: 'Ups... Ha ocurrido un error!',
    text: 'La imagen no es un documento válido',
    icon: 'error',
    confirmButtonText: 'Tomar la foto de nuevo'
  }).then(() => {
    window.location.reload()
  })
}

export const showParticipantError = (message) => {
  Swal.fire({
    title: 'Ups... Ha ocurrido un error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'Regresar'
  }).then(() => {
    const microsite = getQueryParams('microsite')
    if (microsite) window.location.href = microsite
  })
}

export const showProcessError = (message) => {
  Swal.fire({
    title: 'Ups... Ha ocurrido un error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'Tomar la foto de nuevo'
  }).then(() => {
    window.location.reload()
  })
}

export const showFinalMessage = () => {
  Swal.fire({
    text: 'La factura se subió correctamente.',
    icon: 'success',
    confirmButtonText: 'Regresar'
  }).then(() => {
    const microsite = getQueryParams('microsite')
    if (microsite) window.location.href = microsite
  })
}

export const showDataMessage = (data) => {
  const deleteItem = (event) => {
    const button = event.target
    const row = button.parentElement.parentElement
    const index = button.getAttribute('data-index')

    const newItems = data.items.toSpliced(index, 1)
    data.items = newItems

    row.remove()
  }

  const html = `
    <div class="flex flex-col gap-4">
      <p class="self-start"><strong>Referencia:</strong> ${data.id}</p>
      <table class="border-collapse w-full border border-slate-500 bg-slate-800 text-sm shadow-sm text-center">
        <thead class="bg-slate-700">
          <tr>
            <th class="w-1/4 border border-slate-600 font-semibold p-3 text-slate-200 text-left">Descripción</th>
            <th class="w-1/4 border border-slate-600 font-semibold p-3 text-slate-200 text-left">Cantidad</th>
            <th class="w-1/4 border border-slate-600 font-semibold p-3 text-slate-200 text-left">Precio</th>
            <th class="w-1/4 border border-slate-600 font-semibold p-3 text-slate-200 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${
            data.items.map((item, index) => `
              <tr>
                <td class="border border-slate-700 p-3 text-slate-400">${item.description}</td>
                <td class="border border-slate-700 p-3 text-slate-400">${item.quantity}</td>
                <td class="border border-slate-700 p-3 text-slate-400">${item.price}</td>
                <td class="border border-slate-700 p-3 text-slate-400">
                  <button data-index="${index}" class="delete-button cursor-pointer hover:text-red-400 transition-colors m-auto">
                    <svg class="pointer-events-none" width="13" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M11.583 3.556v10.666c0 .982-.795 1.778-1.777 1.778H2.694a1.777 1.777 0 01-1.777-1.778V3.556h10.666zM8.473 0l.888.889h3.111v1.778H.028V.889h3.11L4.029 0h4.444z" fill="currentColor" fill-rule="nonzero"></path></svg>
                  </button>
                </td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
  `

  Swal.fire({
    title: 'Revisa los datos de tu factura',
    html,
    confirmButtonText: 'Tomar la foto de nuevo',
    showCancelButton: true,
    cancelButtonText: 'Enviar',
    didOpen: () => {
      const deleteButtons = document.querySelectorAll('.delete-button')
      deleteButtons.forEach(button => button.addEventListener('click', deleteItem))
    }
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.reload()
    } else {
      saveData(data).then(response => {
        if (!response.ok) {
          showProcessError(response.error)
        } else {
          showFinalMessage()
        }
      })
    }
  })
}
