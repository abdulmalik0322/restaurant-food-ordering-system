import React from 'react'
import { Inbox } from 'lucide-react'

export interface Column<T> {
  header: string
  accessor: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: (row: T) => string
  emptyLabel?: string
}

function DataTable<T>({ columns, data, keyField, emptyLabel = 'No records found' }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="table-wrap bg-white">
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-ink-400">
          <Inbox size={28} />
          <p className="text-sm">{emptyLabel}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="table-wrap bg-white">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c, i) => <th key={i} className={c.className}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={keyField(row)}>
              {columns.map((c, i) => <td key={i} className={c.className}>{c.accessor(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
