import { Button } from "../Button"

interface IShareButtonProps {
  onClick: () => void
}

export const ShareButton = (props: IShareButtonProps) => {
  const { onClick } = props

  return <Button onClick={onClick}>Export / Share</Button>
}
