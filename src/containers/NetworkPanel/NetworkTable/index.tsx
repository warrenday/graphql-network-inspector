import { useMemo, useRef } from 'react'
import prettyBytes from 'pretty-bytes'
import prettyMs from 'pretty-ms'
import { Table, ITableProps } from '../../../components/Table'
import { Dot } from '../../../components/Dot'
import { Badge } from '../../../components/Badge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import { useKeyDown } from '../../../hooks/useKeyDown'
import {
  getErrorMessages,
  OperationType,
} from '../../../helpers/graphqlHelpers'
import { QuickFiltersContainer } from '../QuickFiltersContainer'
import theme from '../../../theme'

const OperationAliases: Record<OperationType, string> = {
  query: 'Q',
  mutation: 'M',
  subscription: 'S',
  persisted: 'P',
}

export interface INetworkTableDataRow {
  id: string
  type: OperationType
  name: string
  total: number
  status: number
  size: number
  time: number
  url: string
  responseBody: string,
  variables: string
}

export interface INetworkTableProps {
  data: INetworkTableDataRow[]
  error?: string
  onRowClick: (rowId: string | number, row: INetworkTableDataRow) => void
  onRowSelect: (rowId: string | number) => void
  selectedRowId?: string | number | null
  showSingleColumn?: boolean
}

interface IOperationProps {
  type: OperationType
  name: string
  total: number
  responseBody: string
}

const Operation = (props: IOperationProps) => {
  const { type, name, total, responseBody } = props
  const errorMessages = useMemo(
    () => getErrorMessages(responseBody),
    [responseBody]
  )

  const operationColor = theme.operationColors[type].text

  return (
    <div className="flex items-center gap-2" data-testid="column-operation">
      <Badge>
        <span
          className={errorMessages?.length ? 'text-red-500' : operationColor}
        >
          {OperationAliases[type]}
        </span>
      </Badge>

      <span className="font-bold">{name}</span>

      <div>
        {total > 1 && (
          <span className="font-bold opacity-75 mr-2">+{total - 1}</span>
        )}
      </div>
      <div className="ml-auto mr-1">
        {errorMessages && errorMessages.length > 0 && (
          <Dot title={errorMessages.join('\n')}>{errorMessages.length}</Dot>
        )}
      </div>
    </div>
  )
}

const Status = ({ status }: { status?: number }) => {
  const statusColor = getStatusColor(status)

  const statusText = useMemo(() => {
    if (status === -1) {
      return '(pending)'
    }

    if (status === 0) {
      return '(cancelled)'
    }

    return status
  }, [status])

  return (
    <div
      className="flex items-center w-20 min-w-[80px]"
      data-testid="column-status"
    >
      <div
        className="w-3 h-3 rounded-full mr-2"
        style={{
          backgroundColor: statusColor,
          transform: 'rotate(0.1deg)',
          marginTop: '-1px',
        }}
      />
      {statusText}
    </div>
  )
}

const ByteSize = ({ byteSize }: { byteSize: number }) => {
  const prettyByteSize = useMemo(() => prettyBytes(byteSize), [byteSize])
  return (
    <div data-testid="column-size" className="w-20">
      {prettyByteSize}
    </div>
  )
}

const Time = ({ ms }: { ms: number }) => {
  const prettyTimeValue = useMemo(() => prettyMs(ms), [ms])
  return (
    <div data-testid="column-time" className="w-20">
      {prettyTimeValue}
    </div>
  )
}

export const NetworkTable = (props: INetworkTableProps) => {
  const {
    data,
    error,
    onRowClick,
    onRowSelect,
    selectedRowId,
    showSingleColumn,
  } = props

  const ref = useRef<HTMLDivElement>(null)

  const selectNextRow = (direction: 'up' | 'down') => {
    const directionCount = direction === 'up' ? -1 : 1
    const selectedRowIndex = data.findIndex((row) => row.id === selectedRowId)
    const nextRow = data[selectedRowIndex + directionCount]
    if (nextRow) {
      onRowSelect(nextRow.id)
    }
  }

  function scrollSelectedIntoView() {
    ref.current
      ?.querySelector<HTMLElement>("[aria-selected='true']")
      ?.scrollIntoView({ block: 'nearest' })
  }

  useKeyDown('ArrowUp', (e) => {
    e.preventDefault()
    selectNextRow('up')
    setTimeout(scrollSelectedIntoView, 0)
  })

  useKeyDown('ArrowDown', (e) => {
    e.preventDefault()
    selectNextRow('down')
    setTimeout(scrollSelectedIntoView, 0)
  })

  const columns = useMemo(() => {
    const columns: ITableProps<INetworkTableDataRow>['columns'] = [
      {
        id: 'query',
        Header: 'Query / Mutation',
        accessor: (row) => (
          <Operation
            type={row.type}
            name={row.name}
            total={row.total}
            responseBody={row.responseBody}
          />
        ),
      },
        {
          Header: 'Variables',
          accessor: (row) => <div>{row.variables}</div>,
        },
      {
        Header: 'Status',
        accessor: (row) => <Status status={row.status} />,
      },
      {
        Header: 'Size',
        accessor: (row) => <ByteSize byteSize={row.size || 0} />,
      },
      {
        Header: 'Time',
        accessor: (row) => <Time ms={row.time} />,
      },
      {
        Header: 'URL',
        accessor: (row) => <div data-testid="column-url">{row.url}</div>,
      },
    ]

    return showSingleColumn ? columns.slice(0, 1) : columns
  }, [showSingleColumn])

  return (
    <div
      ref={ref}
      className="w-full h-full flex flex-col relative dark:bg-gray-900"
      data-testid="network-table"
    >
      <Table
        columns={columns}
        data={data}
        error={error}
        onRowClick={onRowClick}
        selectedRowId={selectedRowId}
        isScollBottomMaintained
      />

      <div className="overflow-hidden">
        <QuickFiltersContainer />
      </div>
    </div>
  )
}
