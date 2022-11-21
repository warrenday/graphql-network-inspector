import React from "react"
import { Button } from "../Button"
import { Popover } from "../Popover"

const Link = (props: { href: string; children: React.ReactNode }) => {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-500 underline"
    >
      {props.children}
    </a>
  )
}

export const SupportPopover = () => {
  return (
    <Popover
      button={
        <Button className="fixed p-2 bottom-0.5 right-0.5">Support</Button>
      }
      position={{ bottom: 20, right: 0 }}
      className="m-3"
    >
      <div className="p-4 max-w-xl">
        <h2 className="font-bold mb-2">Support</h2>
        <p className="mb-6">
          Thanks for using graphql inspector. There are a few ways to reach out
          for product support.
        </p>
        <p>
          Feature or bug?{" "}
          <Link href="https://github.com/warrenday/graphql-network-inspector/issues">
            Raise a request on GitHub.
          </Link>
        </p>
        <p>
          General discussion or guidance?{" "}
          <Link href="https://twitter.com/warrenjday">Find me @warrenjday</Link>
        </p>
      </div>
    </Popover>
  )
}
