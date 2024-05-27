const decodeQueryParam = (param: string): string => {
  try {
    return decodeURIComponent(param.replace(/\+/g, ' '))
  } catch (e) {
    return param
  }
}

export default decodeQueryParam
