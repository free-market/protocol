export const shouldRunE2e = () => {
  const e2e = process.env.E2E?.toLowerCase()
  if (!e2e) {
    return false
  }
  return ['true', 't', 'yes', 'y', '1'].includes(e2e)
}
