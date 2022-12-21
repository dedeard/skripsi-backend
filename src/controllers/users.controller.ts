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
  const user = await db.user.findUnique({ where: { id }, include: { role: true } })
  if (!user) throw new ApiError(404, 'User is undefined.')
  if (original) return user
  return userTrans(user)
}

export const getUsers = ca(async (req, res) => {
  const users = await db.user.findMany({ include: { role: true, albums: true } })
  res.json(usersTrans(users.map((el) => ({ ...el, albums: el.albums.map((e) => e.albumId) }))))
})

export const getUser = ca(async (req, res) => {
  const user = await findOrFailUser(req)
  const albums = (await db.usersOnAlbums.findMany({ where: { userId: user.id } })).map((el) => el.albumId)
  res.json({ ...user, albums })
})

export const createUser = ca(async (req, res) => {
  const roles = await db.role.findMany({ where: { name: { not: 'Super Admin' } } })
  try {
    const { name, email, password, roleId } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30).required(),
      password: Joi.string().trim().min(3).max(30).required(),
      email: Joi.string().trim().email().required().external(uniqueEmailLookup()),
      roleId: Joi.number()
        .valid(...roles.map((el) => el.id))
        .required(),
    }).validateAsync({ name, email, password, roleId }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed create user.', e)
  }
  const data = {
    ...req.body,
    password: await passwordService.hash(req.body.password),
    roleId: req.body.roleId || undefined,
  }
  const user = await db.user.create({ data, include: { role: true } })
  res.json(userTrans(user))
})

export const updateUser = ca(async (req, res) => {
  let user = await findOrFailUser(req)

  if (user.role?.name === 'Super Admin' && req.user?.role?.name !== 'Super Admin') {
    throw new ApiError(403, 'You can not update super admin.')
  }

  const roles = await db.role.findMany({ where: { name: { not: 'Super Admin' } } })
  let { name, email, password, roleId } = req.body
  try {
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30).required().default(user.name),
      password: Joi.string().trim().min(3).max(30).allow(null, ''),
      email: Joi.string().trim().email().required().external(uniqueEmailLookup(user.id)).default(user.email),
      roleId: Joi.number()
        .valid(...roles.map((el) => el.id))
        .required(),
    }).validateAsync({ name, email, password, roleId }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed update user.', e)
  }
  const data = { ...req.body, roleId: req.body.roleId || undefined }
  if (user.role?.name === 'Super Admin') data.roleId = undefined
  if (data.password) data.password = await passwordService.hash(data.password)

  user = userTrans(await db.user.update({ where: { id: user.id }, data, include: { role: true } }))
  res.json(user)
})

export const deleteUser = ca(async (req, res) => {
  const user = await findOrFailUser(req, true)
  if (user.role?.name === 'Super Admin') throw new ApiError(403, 'You can not delete super admin.')
  await db.user.delete({ where: { id: user.id } })
  res.sendStatus(204)
})

export const addAlbumToUser = ca(async (req, res) => {
  const user = await findOrFailUser(req, true)
  const albumId = Number(req.params.albumId)
  if (isNaN(albumId) || albumId < 1) throw new ApiError(404, 'Album id is invalid')
  const exists = await db.usersOnAlbums.findFirst({ where: { userId: user.id, albumId } })
  if (!exists) {
    await db.usersOnAlbums.create({ data: { userId: user.id, albumId } })
  }
  res.sendStatus(204)
})

export const removeAlbumFromUser = ca(async (req, res) => {
  const user = await findOrFailUser(req, true)
  const albumId = Number(req.params.albumId)
  if (isNaN(albumId) || albumId < 1) throw new ApiError(404, 'Album id is invalid')
  await db.usersOnAlbums.deleteMany({ where: { userId: user.id, albumId } })
  res.sendStatus(204)
})
