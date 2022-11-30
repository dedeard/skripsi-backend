import Joi from 'joi'
import ca from '@/shared/catchAsync'
import { passwordMatchLookup } from '@/shared/validationLookup'
import ApiError from '@/shared/ApiError'
import { User } from '@prisma/client'
import db from '@/config/db'
import passwordService from '@/services/password.service'
import { userTrans } from '@/shared/transformers'

/**
 * Get profile
 * GET /account/profile
 *
 */
export const getProfile = ca((req, res) => {
  res.json(userTrans(req.user as User))
})

/**
 * Update profile
 * PUT /account/profile
 *
 */
export const updateProfile = ca(async (req, res) => {
  let user = req.user as User
  try {
    const { name, password, newPassword } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30),
      newPassword: Joi.string().trim().min(3).max(30),
      password: Joi.when('newPassword', {
        then: Joi.string().trim().required().external(passwordMatchLookup(user.password)),
      }),
    }).validateAsync({ name, password, newPassword }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to update profile.', e)
  }

  const data: any = {}

  if (req.body.name) data.name = req.body.name
  if (req.body.newPassword) data.password = await passwordService.hash(req.body.newPassword)

  user = await db.user.update({
    where: { id: user.id },
    data,
    include: { role: true },
  })

  res.json(userTrans(user))
})
