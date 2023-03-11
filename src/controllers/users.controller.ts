import { Request } from 'express'
import Joi from 'joi'
import db from '@/config/db'
import ca from '@/shared/catchAsync'
import ApiError from '@/shared/ApiError'
import { uniqueEmailLookup } from '@/shared/validationLookup'
import { usersTrans, userTrans } from '@/shared/transformers'
import passwordService from '@/services/password.service'

const findOrFailUser = async (req: Request, original: boolean = false) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'User is undefined.')
  const user = await db.user.findUnique({ where: { id }, include: { role: true, field: true } })
  if (!user) throw new ApiError(404, 'User is undefined.')
  if (original) return user
  return userTrans(user)
}

export const getUsers = ca(async (req, res) => {
  const users = await db.user.findMany({ include: { role: true, field: true } })
  res.json(usersTrans(users))
})

export const getUser = ca(async (req, res) => {
  const user = await findOrFailUser(req)
  res.json(user)
})

export const createUser = ca(async (req, res) => {
  const roles = await db.role.findMany({ where: { name: { not: 'Super Admin' } } })
  const fields = await db.field.findMany()

  try {
    const { name, email, password, roleId, fieldId } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30).required(),
      password: Joi.string().trim().min(3).max(30).required(),
      email: Joi.string().trim().email().required().external(uniqueEmailLookup()),
      roleId: Joi.number()
        .valid(...roles.map((el) => el.id))
        .required(),
      fieldId: Joi.number()
        .valid(...fields.map((el) => el.id))
        .required(),
    }).validateAsync({ name, email, password, roleId, fieldId }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed create user.', e)
  }
  const data = {
    ...req.body,
    password: await passwordService.hash(req.body.password),
  }
  const user = await db.user.create({ data, include: { role: true, field: true } })
  res.json(userTrans(user))
})

export const updateUser = ca(async (req, res) => {
  let user = await findOrFailUser(req)

  if (user.role?.name === 'Super Admin' && req.user?.role?.name !== 'Super Admin') {
    throw new ApiError(403, 'You can not update super admin.')
  }

  const roles = await db.role.findMany({ where: { name: { not: 'Super Admin' } } })
  const fields = await db.field.findMany()
  let { name, email, password, roleId, fieldId } = req.body
  try {
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30).required().default(user.name),
      password: Joi.string().trim().min(3).max(30).allow(null, ''),
      email: Joi.string().trim().email().required().external(uniqueEmailLookup(user.id)).default(user.email),
      roleId: Joi.number()
        .valid(...roles.map((el) => el.id))
        .required(),
      fieldId: Joi.number()
        .valid(...fields.map((el) => el.id))
        .required(),
    }).validateAsync({ name, email, password, roleId, fieldId }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed update user.', e)
  }
  const data = { ...req.body }
  if (user.role?.name === 'Super Admin') data.roleId = undefined
  if (data.password) data.password = await passwordService.hash(data.password)

  user = userTrans(await db.user.update({ where: { id: user.id }, data, include: { role: true, field: true } }))
  res.json(user)
})

export const deleteUser = ca(async (req, res) => {
  const user = await findOrFailUser(req, true)
  if (user.role?.name === 'Super Admin') throw new ApiError(403, 'You can not delete super admin.')
  await db.user.delete({ where: { id: user.id } })
  res.sendStatus(204)
})
