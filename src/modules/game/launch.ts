import { invoke } from '@tauri-apps/api/core'
import { RUST_COMMANDS } from '../commands/commands'
import { exists, rename, writeTextFile } from '@tauri-apps/plugin-fs'
import { path } from '@tauri-apps/api'

// Snippet from patcher repo
export const ORIGINAL_FILE_EXT = '.original'
export const PATCHED_FILE_EXT = '.patched'
const ON_THE_FLY_STRINGS_FILE_NAME = '.current_strings.txt'

type SaveFile = {
  name: string
  url: string
}

type ChangeSaveFilesFromNetworkParams = {
  savesFolder: string
  savesFiles: SaveFile[]
}

export type PatchGameTranslationFile = {
  pathsInGameFolder: { windows: string }
  content: string
  pathInGitFolder: string
}

export const changeSaveFilesFromNetwork = async ({ savesFiles, savesFolder }: ChangeSaveFilesFromNetworkParams) => {
  const saveFilesPromises = savesFiles.map(async (file) => {
    const response = await fetch(file.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch save file from ${file.url}`)
    }
    return { name: file.name, content: await response.text() }
  })
  const saveFilesContents = await Promise.all(saveFilesPromises)
  for (const saveFile of saveFilesContents) {
    const saveFilePath = await path.join(savesFolder, saveFile.name)
    await writeTextFile(saveFilePath, saveFile.content)
  }
}

type PatchAndLaunchGameParams = {
  gameFolder: string
  utmtCliFolder: string
  gitFolder: string
  savesFolder: string
  savesFiles: SaveFile[]
  files: PatchGameTranslationFile[]
}

export const patchAndLaunchGame = async ({
  files,
  gameFolder,
  gitFolder,
  savesFiles,
  savesFolder,
  utmtCliFolder
}: PatchAndLaunchGameParams) => {
  await changeSaveFilesFromNetwork({ savesFolder, savesFiles })

  for (const file of files) {
    const absoluteFilePathInGameFolder = await path.join(gameFolder, file.pathsInGameFolder.windows ?? '')
    const originalFilePathInGameFolder = absoluteFilePathInGameFolder + ORIGINAL_FILE_EXT
    if (!file.pathsInGameFolder.windows.endsWith('.win')) {
      if (await exists(absoluteFilePathInGameFolder)) {
        await rename(absoluteFilePathInGameFolder, originalFilePathInGameFolder)
      }
      await writeTextFile(absoluteFilePathInGameFolder, file.content)
    } else {
      const outputFilePath = absoluteFilePathInGameFolder + PATCHED_FILE_EXT
      const absoluteFilePathInGitFolder = await path.join(gitFolder, file.pathInGitFolder)
      const chapterDirInGitFolder = await path.dirname(absoluteFilePathInGitFolder)
      const onTheFlyStringsFilePath = await path.join(chapterDirInGitFolder, ON_THE_FLY_STRINGS_FILE_NAME)

      await writeTextFile(onTheFlyStringsFilePath, file.content)

      if (!(await exists(originalFilePathInGameFolder))) {
        await rename(absoluteFilePathInGameFolder, originalFilePathInGameFolder)
      }

      await invoke(RUST_COMMANDS.IMPORT_STRINGS, {
        sourceDataWinPath: originalFilePathInGameFolder,
        outputDataWinPath: outputFilePath,
        utmtCliFolderPath: utmtCliFolder,
        gitChapterFolderPath: chapterDirInGitFolder,
        gitRootFolderPath: gitFolder
      })

      await rename(outputFilePath, absoluteFilePathInGameFolder)
    }
  }

  await invoke(RUST_COMMANDS.RUN_GAME_EXECUTABLE, { gameFolderPath: gameFolder })
}
