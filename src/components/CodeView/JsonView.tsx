import ReactJson from '@notdutzi/react-json-view'
import { useDarkTheme } from '../../hooks/useTheme'
import { useState } from 'react'

interface IJsonViewProps {
  src: object
  collapsed?: number
}

export const JsonView = (props: IJsonViewProps) => {
  const isDarkTheme = useDarkTheme()
  const [expandAll, setExpandAll] = useState<boolean>(false)

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setExpandAll(!expandAll)
    }
  }

  return (
    <div className="p-4" onClick={handleClick}>
      <ReactJson
        name={null}
        src={props.src}
        theme={isDarkTheme ? 'tomorrow' : 'rjv-default'}
        style={{
          fontFamily:
            'Monaco, Menlo, Consolas, "Droid Sans Mono", "Inconsolata", "Courier New", monospace',
        }}
        enableClipboard={false}
        displayDataTypes={false}
        displayObjectSize={true}
        collapsed={expandAll ? 99 : props.collapsed}
      />
    </div>
  )
}
