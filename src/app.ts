import http from 'http'
import express from 'express'
import fileupload from 'express-fileupload'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import config from '@/config/config'
import logger from '@/config/logger'
import routes from '@/routes'
import ErrorMiddleware from '@/middlewares/error.middleware'

class Application {
  app: express.Application
  server: http.Server

  constructor() {
    this.app = express()
    this.server = http.createServer(this.app)

    this.config()

    new ErrorMiddleware(this.app)
  }

  config() {
    this.app.enable('trust proxy')

    if (config.isDev) {
      this.app.use(morgan('dev'))
    }
    this.app.use(cors())
    // this.app.use(helmet())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(fileupload())
    this.app.use(routes)
  }

  onError(error: any) {
    if (error.syscall !== 'listen') throw error
    switch (error.code) {
      case 'EACCES':
        logger.error(`[SERVER] Port ${config.port} requires elevated privileges`)
        process.exit(1)
      case 'EADDRINUSE':
        logger.error(`[SERVER] Port ${config.port} is already in use`)
        process.exit(1)
      default:
        throw error
    }
  }

  listen(): http.Server {
    this.server.listen(config.port, () => {
      logger.info('[SERVER] Listening on port: ' + config.port)
    })
    this.server.on('error', this.onError)
    return this.server
  }
}

export default Application
