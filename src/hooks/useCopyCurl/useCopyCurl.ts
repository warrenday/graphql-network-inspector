import { useCallback } from 'react'
import { getChromeNetworkCurl } from '@/helpers/curlHelpers'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'
import useCopy from '../useCopy'

export const useCopyCurl = () => {
  const { copy, isCopied } = useCopy()

  const copyAsCurl = useCallback(
    async (networkRequest: ICompleteNetworkRequest) => {
      if (!networkRequest) {
        console.warn('No network request data available')
        return
      }

      try {
        const curl = await getChromeNetworkCurl(
          networkRequest.id,
          networkRequest
        )
        copy(curl)
      } catch (error) {
        console.error('Failed to generate cURL command:', error)
      }
    },
    [copy]
  )

  return { copyAsCurl, isCopied }
}
