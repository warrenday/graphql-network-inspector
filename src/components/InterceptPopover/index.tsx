import { Button } from "../Button"
import { MockIcon } from "../Icons/MockIcon"
import { Popover } from "../Popover"

interface IInterceptButtonProps {}

export const InterceptButton = (props: IInterceptButtonProps) => {
  return (
    <Popover
      button={
        <Button icon={<MockIcon />} onClick={() => {}} testId="mock-button">
          Intercept
        </Button>
      }
    >
      <div className="text-center p-8 box-border">
        <div className="w-96">
          <h2 className="font-bold mb-2">Intercept requests</h2>
          <p className="mb-2">
            Use our powerful desktop app to intercept requests and manipulate
            responses.
          </p>
          <p>
            Learn more:{" "}
            <a
              className="text-blue-500 underline"
              href="https://graphproxy.com/blog/posts/intercepting-graphql-requests/"
              target="_blank"
              rel="noreferrer"
            >
              Intercept requests
            </a>
          </p>
        </div>
      </div>
    </Popover>
  )
}
