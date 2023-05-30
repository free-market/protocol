import dotenv from 'dotenv'
import os from 'os'
import path from 'path'

export function initEnv() {
  dotenv.config({ path: path.join(os.homedir(), '.env') })
  dotenv.config({ path: path.join(os.homedir(), '.freemarket.env') })
}
