import fs from 'fs-extra'

export default async function fileExists(fileName: string): Promise<boolean> {
  try {
    await fs.access(fileName)
    return true
  } catch (e) {
    return false
  }
}
