import { BaseLayout } from '@/components/layouts/base-layout'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetWorkersQuery } from '@/api/workers'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { debounce } from '@/lib/debounce'

export default function WorkersListPage() {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useGetWorkersQuery()

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.toLowerCase())
  }, [])

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  )

  const workers = useMemo(() => {
    const allWorkers = data?.data || []
    if (!searchQuery) return allWorkers

    return allWorkers.filter(
      (worker) =>
        worker.fullName.toLowerCase().includes(searchQuery) ||
        worker.phoneNumber.includes(searchQuery)
    )
  }, [data, searchQuery])

  const columns: ColumnDef<Worker>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-medium">{row.original.fullName}</div>
        ),
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone',
      },
      {
        accessorKey: 'passportId',
        header: 'Passport ID',
      },
      {
        accessorKey: 'monthlySalary',
        header: 'Monthly Salary',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.monthlySalary),
      },
      {
        accessorKey: 'hireDate',
        header: 'Hire Date',
        cell: ({ row }) =>
          format(new Date(row.original.hireDate), 'MMM dd, yyyy'),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <BaseLayout title="Workers" description="Manage workers">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout
      title="Workers"
      description={`Total: ${workers.length} workers`}
    >
      <div className="space-y-4 p-6">
        <div className="flex gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button onClick={() => navigate('/workers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Worker
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={workers}
          onRowClick={(worker) => navigate(`/workers/${worker.id}`)}
        />
      </div>
    </BaseLayout>
  )
}
