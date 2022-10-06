export function sleep(millis: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, millis)
  })
}

export async function sleepRandom(min?: number, max?: number) {
  if (min) {
    let delay = min
    if (max) {
      delay += Math.floor(Math.random() * (max - min))
    }
    await sleep(delay)
  }
}
