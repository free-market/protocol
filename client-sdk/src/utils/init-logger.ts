import log, { LogLevelNames } from 'loglevel'
import prefix from 'loglevel-plugin-prefix'

export function initLogger(level?: LogLevelNames) {
  prefix.reg(log)
  if (!level) {
    log.enableAll()
  } else {
    log.setLevel(level)
  }

  const timestampFormatter = (date: Date) => {
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, `$1.`) + date.getMilliseconds().toString().padStart(3, '0')
  }
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
}
