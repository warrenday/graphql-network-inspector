export const stringify = (
  value: any,
  replacer?: () => any,
  space?: string | number
): string => {
  if (!value) {
    return ""
  }
  try {
    return JSON.stringify(value, replacer, space)
  } catch (e) {
    return "{}"
  }
}

export const parse = <T extends {}>(
  text?: string,
  reviver?: () => any
): T | null => {
  try {
    return JSON.parse(text as string, reviver)
  } catch (e) {
    return null
  }
}
