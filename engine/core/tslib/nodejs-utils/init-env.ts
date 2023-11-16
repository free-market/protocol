import dotenv from 'dotenv'
import os from 'os'
import path from 'path'
import fs from 'fs'
import { getLogger } from '../utils/logging'
const logger = getLogger('env-utils')

function initEnv() {
  const fileNames = ['.freemarket', '.env']
  for (const fileName of fileNames) {
    // check to see if fileName exists
    const filePath = path.join(os.homedir(), fileName)
    if (fs.existsSync(filePath)) {
      logger.info(`loading env from ${filePath}`)
      dotenv.config({ path: filePath })
    }
  }
}

initEnv()
