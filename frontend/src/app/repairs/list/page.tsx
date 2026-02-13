import { BaseLayout } from '@/components/layouts/base-layout'
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
import { useGetRepairsQuery, useCompleteRepairMutation } from '@/api/repairs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CheckCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { debounce } from '@/lib/debounce'
import { toast } from 'sonner'

export default function RepairsListPage() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState<RepairFilterParams>({
    page: 1,
    limit: 20,
    status: undefined,
    search: '',
  })

  const { data, isLoading } = useGetRepairsQuery(filters)
  const [completeRepair] = useCompleteRepairMutation()

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }, [])

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  )

  const handleCompleteRepair = async (repairId: number) => {
    try {
      await completeRepair(repairId).unwrap()
      toast.success('Repair completed successfully')
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || 'Failed to complete repair')
    }
  }

  const columns: ColumnDef<Repair>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => {
          const phone = row.original.phone
          if (!phone) return 'N/A'
          return (
            <div>
              <div className="font-medium">
                {phone.brand} {phone.model}
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {phone.barcode}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'description',
        header: 'Issue',
        cell: ({ row }) => (
          <div className="max-w-xs truncate">{row.original.description}</div>
        ),
      },
      {
        accessorKey: 'repairCost',
        header: 'Cost',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.repairCost),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'startDate',
        header: 'Date',
        cell: ({ row }) =>
          row.original.startDate
            ? format(new Date(row.original.startDate), 'MMM dd, yyyy')
            : 'N/A',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.status !== 'COMPLETED' &&
              row.original.status !== 'CANCELLED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCompleteRepair(row.original.id)
                  }}
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </Button>
              )}
          </div>
        ),
      },
    ],
    [handleCompleteRepair]
  )

  if (isLoading) {
    return (
      <BaseLayout title="Repairs" description="Manage phone repairs">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout
      title="Repairs"
      description={`Total: ${data?.meta.total || 0} repairs`}
    >
      <div className="space-y-4 p-6">
        <div className="flex gap-4 justify-between items-center">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone, issue..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status:
                    value === 'all' ? undefined : (value as RepairStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => navigate('/repairs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Repair
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
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
                    status === 'all' ? undefined : (status as RepairStatus),
                  page: 1,
                }))
              }
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          onRowClick={(repair) => navigate(`/repairs/${repair.id}`)}
        />
      </div>
    </BaseLayout>
  )
}
