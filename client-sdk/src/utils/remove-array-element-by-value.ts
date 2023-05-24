export function removeArrayElementByValue<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item)
  if (index !== -1) {
    const ret = [...array]
    ret.splice(index, 1)
    return ret
  }
  return array
}
