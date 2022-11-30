import Joi from 'joi'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import { uniqueRoleNameLookup } from '@/shared/validationLookup'
import db from '@/config/db'
import { rolesTrans, roleTrans } from '@/shared/transformers'
import * as dataPermissions from '@/config/permissions'

export const getRoles = ca(async (req, res) => {
  const roles = await db.role.findMany()
  res.json(rolesTrans(roles))
})

export const getPermissions = ca(async (req, res) => {
  res.json(Object.values(dataPermissions))
})

export const getRole = ca(async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Role is undefined.')
  const role = await db.role.findUnique({ where: { id } })
  if (!role) throw new ApiError(404, 'Role is undefined.')
  res.json(roleTrans(role))
})

export const createRole = ca(async (req, res) => {
  let { name, permissions } = req.body
  try {
    const data = await Joi.object({
      name: Joi.string().trim().min(3).max(255).required().external(uniqueRoleNameLookup()),
      permissions: Joi.array()
        .items(Joi.string().valid(...Object.values(dataPermissions)))
        .required(),
    }).validateAsync({ name, permissions }, { abortEarly: false })
    name = data.name
    permissions = JSON.stringify([...new Set(data.permissions)])
  } catch (e) {
    throw new ApiError(422, 'Failed to create role.', e)
  }
  const role = await db.role.create({ data: { name, permissions } })
  res.json(roleTrans(role))
})

export const updateRole = ca(async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Role is undefined.')
  let role = await db.role.findUnique({ where: { id } })
  if (!role) throw new ApiError(404, 'Role is undefined.')
  if (role.name === 'Super Admin') throw new ApiError(422, 'Super Admin role cannot be updated.')

  let { name, permissions } = req.body
  try {
    const data = await Joi.object({
      name: Joi.string().trim().min(3).max(255).required().external(uniqueRoleNameLookup(role.id)),
      permissions: Joi.array()
        .items(Joi.string().valid(...Object.values(dataPermissions)))
        .required(),
    }).validateAsync({ name, permissions }, { abortEarly: false })
    name = data.name
    permissions = JSON.stringify([...new Set(data.permissions as string[])])
  } catch (e) {
    throw new ApiError(422, 'Failed to create role.', e)
  }
  role = await db.role.update({ where: { id }, data: { name, permissions } })

  res.json(roleTrans(role))
})

export const deleteRole = ca(async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Role is undefined.')
  const role = await db.role.findUnique({ where: { id } })
  if (!role) throw new ApiError(404, 'Role is undefined.')
  if (role.name === 'Super Admin') throw new ApiError(422, 'Super Admin role cannot be deleted.')

  await db.role.delete({ where: { id } })

  res.sendStatus(204)
})
