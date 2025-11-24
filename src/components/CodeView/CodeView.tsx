import React, { useEffect } from 'react'
import { useHighlight } from '@/hooks/useHighlight'
import { useByteSize } from '@/hooks/useBytes'
import { useMarkSearch, useLocalMark } from '@/hooks/useMark'
import { useFormattedCode } from '../../hooks/useFormattedCode'
import { DelayedLoader } from '../DelayedLoader'
import { Spinner } from '../Spinner'
import { config } from '../../config'
import classes from './CodeView.module.css'

interface ICodeViewProps {
  text: string
  language: 'graphql' | 'json'
  autoFormat?: boolean
  className?: string
  searchQuery?: string
  onSearchResults?: (results: {
    matchCount: number
    currentIndex: number
    goToNext: () => void
    goToPrevious: () => void
  }) => void
}

const LoadingIndicator = () => {
  return (
    <div className="flex items-center">
      <Spinner />
      <div className="dark:text-white ml-4 mt-0.5">Formatting...</div>
    </div>
  )
}

const CodeTooLargeMessage = () => {
  return (
    <div className="dark:text-white">
      The response payload is too large to display.
    </div>
  )
}

const CodeRenderer = (props: ICodeViewProps) => {
  const { text, language, autoFormat, searchQuery, onSearchResults } = props
  const formattedText = useFormattedCode(text, language, autoFormat)

  const { markup: jsonMarkup, loading } = useHighlight(language, formattedText)

  // Use local search if searchQuery is provided, otherwise use global search
  const globalRef = useMarkSearch(jsonMarkup)
  const localMarkResult = useLocalMark(searchQuery || '', jsonMarkup)

  const ref = searchQuery ? localMarkResult.ref : globalRef

  // Notify parent of search results if using local search
  useEffect(() => {
    if (searchQuery && onSearchResults) {
      onSearchResults({
        matchCount: localMarkResult.matchCount,
        currentIndex: localMarkResult.currentIndex,
        goToNext: localMarkResult.goToNext,
        goToPrevious: localMarkResult.goToPrevious,
      })
    }
  }, [
    searchQuery,
    onSearchResults,
    localMarkResult.matchCount,
    localMarkResult.currentIndex,
    localMarkResult.goToNext,
    localMarkResult.goToPrevious,
  ])

  return (
    <DelayedLoader loading={loading} loader={<LoadingIndicator />}>
      <pre>
        <code
          dangerouslySetInnerHTML={{ __html: jsonMarkup }}
          className={classes.container}
          ref={ref}
        />
      </pre>
    </DelayedLoader>
  )
}

export const CodeView = (props: ICodeViewProps) => {
  const {
    text,
    language,
    autoFormat,
    className,
    searchQuery,
    onSearchResults,
  } = props
  const size = useByteSize(text.length, { unit: 'mb' })

  return (
    <div className={className}>
      {size > config.maxUsableResponseSizeMb ? (
        <CodeTooLargeMessage />
      ) : (
        <CodeRenderer
          autoFormat={autoFormat}
          text={text}
          language={language}
          searchQuery={searchQuery}
          onSearchResults={onSearchResults}
        />
      )}
    </div>
  )
}
