import log from 'loglevel'
import chalk from 'chalk'
import prefix from 'loglevel-plugin-prefix'

const colors: any = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
}

prefix.reg(log)
log.enableAll()

const timestampFormatter = (date: Date) => {
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, `$1.`) + date.getMilliseconds().toString().padStart(3, '0')
}
prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)} ${chalk.green(`${name}:`)}`
  },
  timestampFormatter,
})

prefix.apply(log.getLogger('critical'), {
  format(level, name, timestamp) {
    return chalk.red.bold(`[${timestamp}] ${level} ${name}:`)
  },
  timestampFormatter,
})

// log.trace('trace')
// log.debug('debug')
// log.getLogger('critical').info('Something significant happened')
// log.log('log')
// log.info('info')
// log.warn('warn')
// log.error('error')
