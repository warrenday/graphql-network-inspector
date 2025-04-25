import { useHighlight } from '@/hooks/useHighlight'
import { useByteSize } from '@/hooks/useBytes'
import { useFormattedCode } from '../../hooks/useFormattedCode'
import { DelayedLoader } from '../DelayedLoader'
import { Spinner } from '../Spinner'
import { config } from '../../config'
import classes from './CodeView.module.css'
import { Ref } from 'react'
import { useMarkSearch } from '../../hooks/useMark'

interface ICodeViewProps {
  text: string
  language: 'graphql' | 'json'
  autoFormat?: boolean
  className?: string
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

interface ISearchControlsProps {
  currentIndex: number
  totalResults: number
  jumpToNext: () => void
  jumpToPrevious: () => void
}

const SearchControls = (props: ISearchControlsProps) => {
  const { currentIndex, totalResults, jumpToNext, jumpToPrevious } = props

  if (totalResults === 0) {
    return null
  }

  return (
    <div className="flex items-center">
      <button onClick={jumpToPrevious}>Previous</button>
      <button onClick={jumpToNext}>Next</button>
      <div className="dark:text-white ml-4 mt-0.5">
        {currentIndex + 1} of {totalResults}
      </div>
    </div>
  )
}

const CodeRenderer = (props: ICodeViewProps) => {
  const { text, language, autoFormat } = props

  const formattedText = useFormattedCode(text, language, autoFormat)
  const { markup: jsonMarkup, loading } = useHighlight(language, formattedText)
  const { ref, currentIndex, totalResults, jumpToNext, jumpToPrevious } =
    useMarkSearch(jsonMarkup)

  return (
    <>
      <div className="absolute left-3 bottom-3 z-10 flex gap-2">
        <SearchControls
          currentIndex={currentIndex}
          totalResults={totalResults}
          jumpToNext={jumpToNext}
          jumpToPrevious={jumpToPrevious}
        />
      </div>
      <DelayedLoader loading={loading} loader={<LoadingIndicator />}>
        <pre>
          <code
            dangerouslySetInnerHTML={{ __html: jsonMarkup }}
            className={classes.container}
            ref={ref}
          />
        </pre>
      </DelayedLoader>
    </>
  )
}

export const CodeView = (props: ICodeViewProps) => {
  const { text, language, autoFormat, className } = props
  const size = useByteSize(text.length, { unit: 'mb' })

  return (
    <div className={className}>
      {size > config.maxUsableResponseSizeMb ? (
        <CodeTooLargeMessage />
      ) : (
        <CodeRenderer autoFormat={autoFormat} text={text} language={language} />
      )}
    </div>
  )
}
