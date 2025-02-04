import { useCallback } from 'react'
import { generateCurlCommand } from '@/helpers/curlHelpers'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'
import useCopy from './useCopy'

interface IUseCurlCommandOptions {
  onCopy?: () => void
  onError?: (error: Error) => void
}

export const useCurlCommand = (options: IUseCurlCommandOptions = {}) => {
  const { copy, isCopied } = useCopy()

  const copyAsCurl = useCallback(
    (request: ICompleteNetworkRequest) => {
      try {
        const curlCommand = generateCurlCommand(request)
        copy(curlCommand)
        options.onCopy?.()
      } catch (error) {
        // Log error for debugging
        console.error('Failed to generate cURL command:', error)

        // Handle specific error types
        if (error instanceof Error) {
          options.onError?.(error)
        } else {
          options.onError?.(new Error('Unknown error generating cURL command'))
        }
      }
    },
    [copy, options]
  )

  return { copyAsCurl, isCopied }
}
