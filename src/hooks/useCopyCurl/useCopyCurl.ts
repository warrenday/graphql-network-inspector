import { useCallback } from 'react'
import { getNetworkCurl } from '@/helpers/curlHelpers'
import useCopy from '../useCopy'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'

export const useCopyCurl = () => {
  const { copy, isCopied } = useCopy()

  const copyAsCurl = useCallback(
    async (networkRequest: ICompleteNetworkRequest) => {
      if (!networkRequest) {
        console.warn('No network request data available')
        return
      }

      try {
        const curl = await getNetworkCurl(networkRequest)
        copy(curl)
      } catch (error) {
        console.error('Failed to generate cURL command:', error)
      }
    },
    [copy]
  )

  return { copyAsCurl, isCopied }
}
