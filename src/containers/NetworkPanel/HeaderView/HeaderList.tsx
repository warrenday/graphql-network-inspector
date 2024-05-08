import { useMarkSearch } from "@/hooks/useMark"
import { IHeader } from "@/hooks/useNetworkMonitor"
import useCopy from "@/hooks/useCopy"
import parseAuthHeader from "./parseAuthHeader"
import { useState } from "react"

interface IHeadersProps {
  headers: IHeader[]
}

const HeaderListItem = (props: { header: IHeader }) => {
  const { header } = props
  const { isCopied, copy } = useCopy()
  const [parsedValue, setParsedValue] = useState<string | null>(null)

  /**
   * Copy the header value as-is to the clipboard
   *
   */
  const copyHeader = (header: IHeader) => {
    copy(`"${header.name}": "${header.value}"`)
  }

  /**
   * To automatically parse JWTs the user can double click.
   *
   * If the header is a valid JWT the value will be parsed
   * and copied. Double clicking again will reverse this action.
   *
   */
  const parseAndCopyHeader = (header: IHeader) => {
    if (!header.value) {
      return
    }

    // If value already parsed, double click will clear it.
    if (parsedValue) {
      setParsedValue(null)
      copy(header.value)
      return
    }

    // Parse the header and copy the parsed value
    const parsed = parseAuthHeader(header)
    if (parsed) {
      setParsedValue(parsed)
      copy(parsed)
    }
  }

  return (
    <li className="p-0 m-0 w-fit relative">
      <button
        onClick={() => copyHeader(header)}
        onDoubleClick={() => parseAndCopyHeader(header)}
        className="text-left dark:text-gray-300 px-3 py-0.5 rounded-md w-fit cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        <span className="font-bold">{header.name}: </span>
        <span className="break-all">{parsedValue || header.value}</span>
      </button>
      {isCopied && (
        <div className="rounded-md px-1.5 py-0.5 font-bold text-white bg-blue-400 dark:bg-blue-600 absolute left-2 -top-4">
          Copied!
        </div>
      )}
    </li>
  )
}

export const HeaderList = (props: IHeadersProps) => {
  const { headers } = props
  const ref = useMarkSearch()

  return (
    <ul className="list-none m-0" ref={ref}>
      {headers.map((header) => (
        <HeaderListItem
          key={`${header.name}:${header.value}`}
          header={header}
        />
      ))}
    </ul>
  )
}
