import { Request } from 'express'
import fs from 'fs-extra'
import path from 'path'
import Joi from 'joi'
import db from '@/config/db'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import config from '@/config/config'

const include = { media: true, share: true }

const findOrFailAlbum = async (req: Request) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Album is undefined.')
  const album = await db.album.findUnique({ where: { id }, include })
  if (!album) throw new ApiError(404, 'Album is undefined.')
  return album
}

export const getAlbums = ca(async (req, res) => {
  const albums = await db.album.findMany({ include })
  res.json(albums)
})

export const getAlbum = ca(async (req, res) => {
  const { id } = await findOrFailAlbum(req)
  const album = await db.album.findUnique({ where: { id }, include })
  res.json(album)
})

export const createAlbum = ca(async (req, res) => {
  try {
    let { name, description } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(200).required(),
      description: Joi.string().allow('').trim().max(500).required(),
    }).validateAsync({ name, description }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to create album.', e)
  }
  const album = await db.album.create({ data: req.body, include })
  res.json(album)
})

export const updateAlbum = ca(async (req, res) => {
  let album = await findOrFailAlbum(req)

  try {
    let { name, description } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(200).required(),
      description: Joi.string().allow('').trim().max(500).required(),
    }).validateAsync({ name, description }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to create album.', e)
  }
  album = await db.album.update({ where: { id: album.id }, data: req.body, include })
  res.json(album)
})

export const deleteAlbum = ca(async (req, res) => {
  const { id } = await findOrFailAlbum(req)
  await db.album.delete({ where: { id } })
  const name = path.join(config.uploadDir, 'media', String(id))
  try {
    await fs.unlink(name)
  } catch (e) {}
  res.sendStatus(204)
})
