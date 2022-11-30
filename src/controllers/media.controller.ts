import express, { Request } from 'express'
import path from 'path'
import fs from 'fs-extra'
import db from '@/config/db'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import { UploadedFile } from 'express-fileupload'
import { fromBuffer } from 'file-type'
import config from '@/config/config'
import { Media } from '@prisma/client'
import moment from 'moment'
import { randomBytes } from 'crypto'

const findOrFailAlbum = async (req: Request) => {
  const id = Number(req.params.albumId)
  if (isNaN(id) || id < 1) throw new ApiError(404, 'Album is undefined.')
  const album = await db.album.findUnique({ where: { id }, include: { media: true } })
  if (!album) throw new ApiError(404, 'Album is undefined.')
  return album
}

const findOrFailMedia = async (req: Request) => {
  const id = Number(req.params.mediaId)
  const name = req.params.mediaId
  let media: Media | null
  if (isNaN(id) || id < 1) {
    media = await db.media.findUnique({ where: { name } })
  } else {
    media = await db.media.findUnique({ where: { id } })
  }
  if (!media) throw new ApiError(404, 'Media is undefined.')
  return media
}

export const sendMedia = express.static(path.join(config.uploadDir, 'media'))

export const downloadMedia = ca(async (req, res) => {
  const media = await findOrFailMedia(req)
  const fileName = path.join(config.uploadDir, 'media', String(media.albumId), media.name)
  res.download(fileName, media.originalName)
})

export const createMedia = ca(async (req, res) => {
  const album = await findOrFailAlbum(req)

  const file = req.files?.file
  const data: UploadedFile | undefined = Array.isArray(file) ? file[0] : file

  if (!data) throw new ApiError(422, 'File is required')

  const mime = await fromBuffer(data.data)
  if (!['jpeg', 'jpg', 'png', 'flv', 'mp4', 'mov', 'avi'].includes(mime?.ext || '')) {
    throw new ApiError(422, 'File format must be [jpeg,jpg,png,flv,mp4,mov,avi]')
  }
  if (data.size > config.maxUploadSize * 1024 * 1024) throw new ApiError(422, 'File size must be less than ' + config.maxUploadSize + 'MB')

  const fileName = moment().unix() + randomBytes(8).toString('hex') + '.' + mime?.ext
  const fullFileName = path.join(config.uploadDir, 'media', String(album.id), fileName)

  await fs.ensureDir(path.join(config.uploadDir, 'media', String(album.id)))
  await data.mv(fullFileName)

  let type = 'video'
  if (['jpeg', 'jpg', 'png'].includes(mime?.ext || '')) type = 'image'

  const media = await db.media.create({
    data: {
      type,
      name: fileName,
      size: data.size,
      originalName: path.parse(data.name).name + path.parse(data.name).ext,
      albumId: album.id,
    },
  })

  album.media.push(media)
  res.json(album.media)
})

export const deleteMedia = ca(async (req, res) => {
  const media = await findOrFailMedia(req)
  const name = path.join(config.uploadDir, 'media', String(media.albumId), media.name)
  await db.media.delete({ where: { id: media.id } })
  try {
    await fs.unlink(name)
  } catch (e) {}

  const album = await db.album.findUnique({ where: { id: media.albumId }, include: { media: true } })
  if (!album) throw new ApiError(404, 'Album is undefined.')
  res.json(album.media)
})
