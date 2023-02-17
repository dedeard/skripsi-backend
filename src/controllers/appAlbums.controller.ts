import config from '@/config/config'
import db from '@/config/db'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import fileExists from '@/shared/fileExists'
import path from 'path'

export const getAlbums = ca(async (req, res) => {
  const userAlbums = await db.usersOnAlbums.findMany({ where: { userId: req.user?.id }, include: { album: { include: { media: true } } } })
  const albums = userAlbums.map((el) => el.album)
  res.json(albums)
})

export const getAlbum = ca(async (req, res) => {
  const id = Number(req.params.albumId)
  if (isNaN(id) || id < 1) throw new ApiError(400, 'Album id is invalid!')
  const userAlbum = await db.usersOnAlbums.findFirst({
    where: { userId: req.user?.id, albumId: id },
    include: { album: { include: { media: true } } },
  })
  if (!userAlbum) throw new ApiError(404, 'Album not found!')
  res.json(userAlbum.album)
})

export const getMedia = ca(async (req, res) => {
  const download = req.query.download === 'true'
  const name = String(req.params.name || '')
  const media = await db.media.findFirst({ where: { name } })
  if (!media) throw new ApiError(404, 'Media not found!')
  const share = await db.usersOnAlbums.count({ where: { albumId: media.albumId, userId: req.user?.id } })
  if (!share) throw new ApiError(401, 'Can not read media!')

  const file = path.join(config.uploadDir, 'media', String(media.albumId), media.name)
  const exists = await fileExists(file)
  if (!exists) throw new ApiError(404, 'File not found')
  res.setHeader('cache-control', 'public, max-age=86400, must-revalidate')
  if (download) return res.download(file, media.originalName)
  res.sendFile(file)
})
