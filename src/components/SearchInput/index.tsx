import { useCallback, useMemo, useRef } from "react"
import { debounce } from "@/helpers/debounce"

interface ISearchInputProps {
  className?: string
  debounceDelay?: number
  onSearch: (query: string) => void
}
export const SearchInput = (props: ISearchInputProps) => {
  const { onSearch, className, debounceDelay = 350 } = props
  const ref = useRef<HTMLInputElement>(undefined!)
  const onSearchImmediate = useCallback(() => {
    if (ref.current) onSearch(ref.current.value)
  }, [onSearch])
  const onSearchDebounced = useMemo(
    () => debounce(onSearchImmediate, debounceDelay),
    [onSearchImmediate, debounceDelay]
  )
  return (
    <input
      ref={ref}
      onChange={() => onSearchDebounced()}
      onBlur={onSearchImmediate}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSearchImmediate()
      }}
      placeholder="Search full request"
      autoFocus
      className={`text-input ${className}`}
      data-testid="search-input"
      type="search"
    />
  )
}
