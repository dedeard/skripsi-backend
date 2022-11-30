import db from '@/config/db'
import path from 'path'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import fileExists from '@/shared/fileExists'
import { randomBytes } from 'crypto'
import { Request } from 'express'
import Joi from 'joi'
import moment from 'moment'
import config from '@/config/config'

const findOrFailAlbum = async (req: Request) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Album is undefined.')
  const album = await db.album.findUnique({ where: { id } })
  if (!album) throw new ApiError(404, 'Album is undefined.')
  return album
}

export const getShares = ca(async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Id is invalid.')
  const share = await db.share.findMany({ where: { albumId: id } })
  res.json(share)
})

export const createShare = ca(async (req, res) => {
  const album = await findOrFailAlbum(req)

  try {
    let { title, durations } = req.body
    req.body = await Joi.object({
      title: Joi.string().trim().min(3).max(200).required(),
      durations: Joi.number().allow('').min(0).required(),
    }).validateAsync({ title, durations }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to create share.', e)
  }

  const cretateAt = moment()
  let expiredAt = null
  if (req.body.durations) expiredAt = cretateAt.add(req.body.durations, 'hours')
  const token = cretateAt.unix() + randomBytes(16).toString('hex')

  const share = await db.share.create({
    data: {
      title: req.body.title,
      token,
      albumId: album.id,
      createdAt: cretateAt.toDate(),
      expiredAt: expiredAt?.toDate(),
    },
  })

  res.json(share)
})

export const deleteShare = ca(async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Share is undefined.')
  await db.share.delete({ where: { id } })
  res.sendStatus(204)
})

export const sharedAlbum = ca(async (req, res) => {
  const token = String(req.query.token || '') || ''
  if (!token) throw new ApiError(401, 'Token is required')
  const share = await db.share.findUnique({ where: { token }, include: { album: { include: { media: true } } } })
  if (!share) throw new ApiError(401, 'Token is invalid')
  if (!share.album) throw new ApiError(404, 'Album is undefined')
  if (share.expiredAt && moment().isAfter(moment(share.expiredAt))) throw new ApiError(401, 'Token has expired')
  res.json(share.album)
})

export const sharedFile = ca(async (req, res) => {
  const token = String(req.query.token || '')
  const name = String(req.params.name || '')
  const download = req.query.download === 'true'
  if (!token) throw new ApiError(401, 'Token is required')
  const share = await db.share.findUnique({ where: { token } })
  if (!share) throw new ApiError(401, 'Token is invalid')
  if (share.expiredAt && moment().isAfter(moment(share.expiredAt))) throw new ApiError(401, 'Token has expired')

  const media = await db.media.findFirst({ where: { name, albumId: share.albumId } })
  if (!media) throw new ApiError(404, 'Media is undefined')

  const file = path.join(config.uploadDir, 'media', String(share.albumId), media.name)
  const exists = await fileExists(file)
  if (!exists) throw new ApiError(404, 'File not found')
  if (download) return res.download(file, media.originalName)
  res.sendFile(file)
})
