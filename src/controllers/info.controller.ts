import config from '@/config/config'
import db from '@/config/db'
import ca from '@/shared/catchAsync'

export const counter = ca(async (req, res) => {
  const media = await db.media.findMany()
  const albumCount = await db.album.count()

  const imageCount = media.filter((el) => el.type === 'image').length
  const videoCount = media.filter((el) => el.type === 'video').length

  const used = media.map((el) => el.size).reduce((ps, a) => ps + a, 0)
  const free = config.totalSpace - used

  res.json({ image: imageCount, video: videoCount, used, free, album: albumCount })
})
