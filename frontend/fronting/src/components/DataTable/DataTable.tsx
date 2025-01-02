'use client'

import { Table, Tbody, Td, Th, Thead, Tr, Box } from '@chakra-ui/react'
import { Loading } from '../base/Loading'

interface DataTableProps {
  data: any[]
  columns: Array<{
    header: string
    accessor: string
  }>
  isLoading?: boolean
}

export function DataTable({ data, columns, isLoading }: DataTableProps) {
  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="200px"
      >
        <Loading />
      </Box>
    )
  }

  return (
    <Table>
      <Thead>
        <Tr>
          {columns.map(column => (
            <Th key={column.accessor}>{column.header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row, i) => (
          <Tr key={i}>
            {columns.map(column => (
              <Td key={column.accessor}>{row[column.accessor]}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
} 