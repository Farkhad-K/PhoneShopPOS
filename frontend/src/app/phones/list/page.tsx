import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetPhonesQuery } from '@/api/phones'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { debounce } from '@/lib/debounce'

export default function PhonesListPage() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState<PhoneFilterParams>({
    page: 1,
    limit: 20,
    status: undefined,
    search: '',
  })

  const { data, isLoading } = useGetPhonesQuery(filters)

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }, [])

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  )

  const columns: ColumnDef<Phone>[] = useMemo(
    () => [
      {
        accessorKey: 'barcode',
        header: 'Barcode',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.barcode}</span>
        ),
      },
      {
        accessorKey: 'brand',
        header: 'Brand',
      },
      {
        accessorKey: 'model',
        header: 'Model',
      },
      {
        accessorKey: 'condition',
        header: 'Condition',
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.condition.toLowerCase().replace('_', ' ')}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'purchasePrice',
        header: 'Purchase Price',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.purchasePrice),
      },
      {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.totalCost),
      },
      {
        accessorKey: 'createdAt',
        header: 'Added',
        cell: ({ row }) =>
          format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/phones/${row.original.id}`)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [navigate]
  )

  if (isLoading) {
    return (
      <>
        <PageHeader title="Phone Inventory" description="Manage your phone inventory" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Phone Inventory" description={`Total: ${data?.meta?.total || 0} phones`} />
      <div className="space-y-4 p-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by brand, model, barcode..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value === 'all' ? undefined : (value as PhoneStatus),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="IN_STOCK">In Stock</SelectItem>
              <SelectItem value="IN_REPAIR">In Repair</SelectItem>
              <SelectItem value="READY_FOR_SALE">Ready for Sale</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
              <SelectItem value="RETURNED">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {['all', 'IN_STOCK', 'IN_REPAIR', 'READY_FOR_SALE', 'SOLD'].map(
            (status) => (
              <Button
                key={status}
                variant={
                  (filters.status || 'all') === status ? 'default' : 'outline'
                }
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    status:
                      status === 'all' ? undefined : (status as PhoneStatus),
                    page: 1,
                  }))
                }
              >
                {status === 'all'
                  ? 'All'
                  : status.replace('_', ' ')}
              </Button>
            )
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          onRowClick={(phone) => navigate(`/phones/${phone.id}`)}
        />
      </div>
    </>
  )
}
