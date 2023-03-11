import config from '@/config/config'
import db from '@/config/db'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import fileExists from '@/shared/fileExists'
import path from 'path'

export const getAlbums = ca(async (req, res) => {
  const fieldId = req.user?.fieldId || undefined
  const albums = await db.album.findMany({ where: { fieldId }, include: { media: true, field: true } })
  res.json(albums)
})

export const getAlbum = ca(async (req, res) => {
  const fieldId = req.user?.fieldId || undefined
  const id = Number(req.params.albumId)
  if (isNaN(id) || id < 1) throw new ApiError(400, 'Album id is invalid!')

  const album = await db.album.findFirst({ where: { fieldId, id }, include: { media: true, field: true } })
  if (!album) throw new ApiError(404, 'Album not found!')
  res.json(album)
})

export const getMedia = ca(async (req, res) => {
  const fieldId = req.user?.fieldId || undefined
  const download = req.query.download === 'true'
  const name = String(req.params.name || '')
  const media = await db.media.findFirst({ where: { name } })
  if (!media) throw new ApiError(404, 'Media not found!')
  const allow = await db.album.count({ where: { id: media.albumId, fieldId } })
  if (!allow) throw new ApiError(401, 'Can not read media!')

  const file = path.join(config.uploadDir, 'media', String(media.albumId), media.name)
  const exists = await fileExists(file)
  if (!exists) throw new ApiError(404, 'File not found')
  res.setHeader('cache-control', 'public, max-age=86400, must-revalidate')
  if (download) return res.download(file, media.originalName)
  res.sendFile(file)
})
