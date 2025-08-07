interface ISearchStringArgs {
  text: string
  search: string
  buffer?: number
}

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const getSearchInput = (search: string) => {
  const searchString = escapeRegExp(search)
  try {
    return new RegExp(searchString, 'i')
  } catch (e) {
    return searchString
  }
}

export const searchString = ({
  text,
  search,
  buffer = 12,
}: ISearchStringArgs) => {
  const searchInput = getSearchInput(search)
  const matchPosition = text.search(searchInput)

  if (matchPosition === -1) {
    return {
      start: '',
      match: '',
      end: '',
    }
  }

  const highlightLength = search.length
  const matchPositionEnd = matchPosition + highlightLength

  const start = text.slice(Math.max(0, matchPosition - buffer), matchPosition)
  const match = text.slice(matchPosition, matchPositionEnd)
  const end = text.slice(matchPositionEnd, matchPositionEnd + buffer)

  return {
    start,
    match,
    end,
  }
}
