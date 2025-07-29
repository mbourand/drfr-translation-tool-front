import { path } from '@tauri-apps/api'
import { readDir, remove } from '@tauri-apps/plugin-fs'

export const repairGameFiles = async (folder: string) => {
  const files = await readDir(folder)

  const repairPromises = files.map(async (entry) => {
    const entryPath = await path.join(folder, entry.name)

    if (entry.isDirectory) return repairGameFiles(entryPath)
    if (entryPath.endsWith('.original')) await remove(entryPath)
  })

  await Promise.all(repairPromises)
}
