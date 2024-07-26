import express from 'express'
import cors from 'cors'

import veryfiRoutes from './routes/veryfi.routes.js'
import superlikersRoutes from './routes/superlikers.routes.js'

export class Server {
  constructor () {
    this.app = express()
    this.port = process.env.PORT ?? '5001'

    this.middlewares()
    this.routes()
  }

  middlewares () {
    this.app.set('trust proxy', true)

    this.app.use((req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      next()
    })

    this.app.use(cors())

    this.app.use(express.static('public'))

    this.app.use(express.urlencoded({ extended: false }))

    this.app.use(express.json({ limit: '50mb' }))
  }

  routes () {
    this.app.use('/', veryfiRoutes)
    this.app.use('/superlikers', superlikersRoutes)
  }

  listen () {
    this.app.listen(this.port, () => {
      console.log(`HTTPS Server running on PORT ${this.port}`)
    })
  }
}
