import { ICompleteNetworkRequest } from "@/helpers/networkHelpers"
import { Button } from "../Button"
import { useCopyCurl } from "@/hooks/useCopyCurl/useCopyCurl"

interface ICopyAsCurlButtonProps {
  networkRequest?: ICompleteNetworkRequest
  className?: string
}

export const CopyAsCurlButton = ({ networkRequest, className }: ICopyAsCurlButtonProps) => {
  const { copyAsCurl, isCopied } = useCopyCurl()

  return (
    <div className={className}>
      <Button
        testId="copy-button"
        variant="primary"
        onClick={() => networkRequest && copyAsCurl(networkRequest)}
      >
        {isCopied ? "Copied!" : "Copy as cURL"}
      </Button>
    </div>
  )
} 