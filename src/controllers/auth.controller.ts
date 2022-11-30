import Joi from 'joi'
import db from '@/config/db'
import jwtService from '@/services/jwt.service'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import { registeredEmailLookup, uniqueEmailLookup } from '@/shared/validationLookup'
import passwordService from '@/services/password.service'
import { randomBytes } from 'crypto'
import moment from 'moment'
import config from '@/config/config'
import { createTransport } from 'nodemailer'
import logger from '@/config/logger'

/**
 * Register
 * POST /auth/register
 *
 */
export const register = ca(async (req, res) => {
  try {
    const { name, email, password } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30).required(),
      password: Joi.string().trim().min(3).max(30).required(),
      email: Joi.string().trim().email().required().external(uniqueEmailLookup()),
    }).validateAsync({ name, email, password }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed register.', e)
  }

  req.body.password = await passwordService.hash(req.body.password)

  await db.user.create({ data: req.body })
  res.sendStatus(204)
})

/**
 * Login
 * POST /auth/login
 *
 */
export const login = ca(async (req, res) => {
  try {
    const { email, password } = req.body
    req.body = await Joi.object({
      password: Joi.string().trim().required(),
      email: Joi.string().trim().email().required(),
    }).validateAsync({ email, password }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed login.', e)
  }

  const user = await db.user.findFirst({ where: { email: req.body.email } })
  if (user && (await passwordService.verify(req.body.password, user.password))) {
    return res.json(jwtService.generate(user.id))
  }
  throw new ApiError(400, 'Password and email combination is invalid.')
})

/**
 * Forgot password
 * POST /auth/password
 *
 */
export const forgotPassword = ca(async (req, res) => {
  let email = String(req.body.email || '').toLowerCase()
  try {
    await Joi.object({
      email: Joi.string().trim().email().required().external(registeredEmailLookup()),
    }).validateAsync({ email }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to generate forgotten password code.', e)
  }

  await db.forgot.deleteMany({ where: { email } })
  const code = randomBytes(3).toString('hex').toUpperCase()
  await db.forgot.create({ data: { code, email, expiredAt: moment().add(config.resetPasswordExpMinutes, 'minutes').toDate() } })

  try {
    const info = await createTransport(config.smtp).sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Reset Password',
      html: `<h3>Hi, ${email}</h3> <p>You verification code is <strong>${code}</strong></p>`,
    })
    logger.info(`[RESET PASSWORD EMAIL] code: ${code} email: ${email} info: ${JSON.stringify(info)}`)
  } catch (e) {
    logger.error('[RESET PASSWORD EMAIL] ' + JSON.stringify(e))
  }
  res.sendStatus(204)
})

/**
 * Verify password reset code
 * GET /auth/password
 *
 */
export const verifyResetPasswordCode = ca(async (req, res) => {
  try {
    const { code, email } = req.query
    req.body = await Joi.object({
      code: Joi.string().required(),
      email: Joi.string().email().required(),
    }).validateAsync({ code, email }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to verify reset password code.', e)
  }

  const forgotCode = await db.forgot.findFirst({ where: req.body })
  if (!forgotCode) throw new ApiError(400, 'The code is invalid.')
  if (moment().isAfter(forgotCode.expiredAt)) throw new ApiError(400, 'The code has expired.')

  res.sendStatus(204)
})

/**
 * Reset password
 * PUT /auth/password
 *
 */
export const resetPassword = ca(async (req, res) => {
  try {
    const { code, email, password } = req.body
    req.body = await Joi.object({
      code: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().trim().min(3).max(30).required(),
    }).validateAsync({ code, email, password }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to reset your password.', e)
  }

  const forgotCode = await db.forgot.findFirst({ where: { email: req.body.email, code: req.body.code } })
  if (!forgotCode) throw new ApiError(400, 'The code is invalid.')
  if (moment().isAfter(forgotCode.expiredAt)) throw new ApiError(400, 'The code has expired.')

  await db.user.update({ where: { email: forgotCode.email }, data: { password: await passwordService.hash(req.body.password) } })
  await db.forgot.deleteMany({ where: { email: forgotCode.email } })

  res.sendStatus(204)
})
