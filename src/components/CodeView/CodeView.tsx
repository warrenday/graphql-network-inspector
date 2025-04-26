import { useHighlight } from '@/hooks/useHighlight'
import { useByteSize } from '@/hooks/useBytes'
import { useFormattedCode } from '../../hooks/useFormattedCode'
import { DelayedLoader } from '../DelayedLoader'
import { Spinner } from '../Spinner'
import { config } from '../../config'
import classes from './CodeView.module.css'
import { useMarkSearch } from '../../hooks/useMark'
import { Button } from '../Button'

interface ICodeViewProps {
  text: string
  language: 'graphql' | 'json'
  autoFormat?: boolean
  className?: string
  isSearchControlsVisible?: boolean
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
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-2 shadow-md">
      <div className="flex items-center gap-2">
        <Button onClick={jumpToPrevious} variant="primary">
          Previous
        </Button>
        <Button onClick={jumpToNext} variant="primary">
          Next
        </Button>
      </div>
      <div className="dark:text-white ml-4 mr-2 mt-0.5">
        {currentIndex + 1} of {totalResults}
      </div>
    </div>
  )
}

const CodeRenderer = (props: ICodeViewProps) => {
  const { text, language, autoFormat, isSearchControlsVisible } = props

  const formattedText = useFormattedCode(text, language, autoFormat)
  const { markup: jsonMarkup, loading } = useHighlight(language, formattedText)
  const { ref, currentIndex, totalResults, jumpToNext, jumpToPrevious } =
    useMarkSearch(jsonMarkup)

  return (
    <>
      {isSearchControlsVisible && (
        <div className="fixed right-3 bottom-3 z-50 flex gap-2">
          <SearchControls
            currentIndex={currentIndex}
            totalResults={totalResults}
            jumpToNext={jumpToNext}
            jumpToPrevious={jumpToPrevious}
          />
        </div>
      )}
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
  const { text, language, autoFormat, className, isSearchControlsVisible } =
    props
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
          isSearchControlsVisible={isSearchControlsVisible}
        />
      )}
    </div>
  )
}
