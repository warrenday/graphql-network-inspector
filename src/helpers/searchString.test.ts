import { searchString } from './searchString'

describe('searchString', () => {
  it('returns the match from a string with the given start/end buffer', () => {
    const res = searchString({
      text: 'i really want to be searched',
      search: 'wan',
      buffer: 5,
    })

    expect(res).toEqual({
      match: 'wan',
      start: 'ally ',
      end: 't to ',
    })
  })

  it('handles searched when matched portion is at the start', () => {
    const res = searchString({
      text: 'i really want to be searched',
      search: 'i',
      buffer: 5,
    })

    expect(res).toEqual({
      match: 'i',
      start: '',
      end: ' real',
    })
  })

  it('handles searched when matched portion is at the end', () => {
    const res = searchString({
      text: 'i really want to be searched',
      search: 'searched',
      buffer: 5,
    })

    expect(res).toEqual({
      match: 'searched',
      start: 'o be ',
      end: '',
    })
  })

  it('handles searched when matched portion is not found', () => {
    const res = searchString({
      text: 'i really want to be searched',
      search: 'not found',
      buffer: 5,
    })

    expect(res).toEqual({
      match: '',
      start: '',
      end: '',
    })
  })

  it('returns the match for special characters', () => {
    const res = searchString({
      text: 'hello world (and universe)',
      search: '(a',
      buffer: 5,
    })

    expect(res).toEqual({
      match: '(a',
      start: 'orld ',
      end: 'nd un',
    })
  })
})
