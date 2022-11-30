import { NextFunction, Request, Response } from 'express'
import ca from '@/shared/catchAsync'
import ApiError from '@/shared/ApiError'
import jwtService from '@/services/jwt.service'
import { userTrans } from '@/shared/transformers'

type Options = {
  cans?: string[]
  can?: string
  isAdmin?: boolean
  required?: boolean
}

class AuthMiddleware {
  req: Request
  next: NextFunction
  options?: Options
  cans: string[] = []
  required: boolean
  isAdmin: boolean

  constructor(req: Request, next: NextFunction, options?: Options) {
    this.req = req
    this.next = next
    this.options = options
    this.required = options?.required ?? true
    this.isAdmin = options?.isAdmin ?? false

    if (options?.cans) {
      this.cans = options.cans
    } else if (options?.can) {
      this.cans = String(options.can || '').split('|')
    }
  }

  async checkAuth(): Promise<void> {
    const bearer = this.parseBearerToken(this.req) || String(this.req.query.auth || '') || null
    if (!bearer && this.required) throw new ApiError(401, 'Bearer token is required')

    try {
      if (bearer) this.req.user = await jwtService.verify(bearer)
    } catch (e: any) {
      if (this.required) {
        if (e.name === 'TokenExpiredError') {
          return this.next(new ApiError(401, 'Auth token has expired.'))
        }
        return this.next(new ApiError(401, 'Invalid auth token'))
      }
    }

    if (this.req.user) {
      const user = userTrans(this.req.user)
      const role = user?.role

      if (this.isAdmin && !role) throw new ApiError(403, 'Forbidden')

      if (this.cans.length > 0 && role?.name !== 'Super Admin') {
        const permissions: string[] = role?.permissions || []
        const exists: boolean[] = this.cans.map((can) => !!permissions.find((el) => el === can))
        if (!exists.includes(true)) throw new ApiError(403, 'Forbidden')
      }
    }

    this.next()
  }

  parseBearerToken(req: Request): string | null {
    const auth = req.headers ? req.headers.authorization || null : null
    if (!auth) return null

    const parts = auth.split(' ')
    if (parts.length < 2) return null

    const schema = (parts.shift() as string).toLowerCase()
    const token = parts.join(' ')
    if (schema !== 'bearer') return null

    return token
  }
}

export function auth(options?: Options): (req: Request, res: Response, next: NextFunction) => void {
  return ca(async (req, res, next) => {
    const authentication = new AuthMiddleware(req, next, options)
    await authentication.checkAuth()
  })
}
