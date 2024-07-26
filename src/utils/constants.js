import path from 'node:path'
import * as url from 'node:url'

export const currentDir = url.fileURLToPath(new URL('.', import.meta.url))

export const dirname = path.resolve(currentDir, '../../../')
