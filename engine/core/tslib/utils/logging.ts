import type { LogLevelNames } from 'loglevel';
import log from 'loglevel'
import prefix from 'loglevel-plugin-prefix'

const timestampFormatter = (date: Date) => {
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, `$1.`) + date.getMilliseconds().toString().padStart(3, '0')
}
prefix.reg(log)
prefix.apply(log, {
  format(level, name, timestamp) {
    return `${timestamp} ${level} ${name}:`
  },
  timestampFormatter,
})

prefix.apply(log.getLogger('critical'), {
  format(level, name, timestamp) {
    return `[${timestamp}] ${level} ${name}:`
  },
  timestampFormatter,
})

if (process.env.NODE_ENV === 'test') {
  log.enableAll()
}

export function initLogger(level?: LogLevelNames) {
  if (!level) {
    log.enableAll()
  } else {
    log.setLevel(level)
  }
}

export function getLogger(name: string) {
  return log.getLogger(name)
}

export function isDebugLoggingEnabled(logger: log.Logger) {
  return logger.getLevel() <= log.levels.DEBUG
}
