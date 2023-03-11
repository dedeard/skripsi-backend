import db from '@/config/db'
import ca from '@/shared/catchAsync'

export const getFields = ca(async (req, res) => {
  const fields = await db.field.findMany()
  res.json(fields)
})
