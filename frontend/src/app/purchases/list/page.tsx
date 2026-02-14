import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetPurchasesQuery } from '@/api/purchases'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { debounce } from '@/lib/debounce'

export default function PurchasesListPage() {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useGetPurchasesQuery()

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.toLowerCase())
  }, [])

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  )

  const purchases = useMemo(() => {
    const allPurchases = data?.data || []
    if (!searchQuery) return allPurchases

    return allPurchases.filter(
      (purchase) =>
        purchase.supplier?.fullName.toLowerCase().includes(searchQuery)
    )
  }, [data, searchQuery])

  const columns: ColumnDef<Purchase>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'supplier',
        header: 'Supplier',
        cell: ({ row }) => {
          const supplier = row.original.supplier
          return supplier ? (
            <div>
              <div className="font-medium">{supplier.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {supplier.phoneNumber}
              </div>
            </div>
          ) : (
            'N/A'
          )
        },
      },
      {
        accessorKey: 'phones',
        header: 'Phones',
        cell: ({ row }) => {
          const phones = row.original.phones || []
          return <span className="font-medium">{phones.length} phone(s)</span>
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
        cell: ({ row }) => {
          const phones = row.original.phones || []
          const total = phones.reduce(
            (sum, phone) => sum + phone.purchasePrice,
            0
          )
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(total)
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
      },
      {
        accessorKey: 'purchaseDate',
        header: 'Date',
        cell: ({ row }) =>
          format(new Date(row.original.purchaseDate), 'MMM dd, yyyy'),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <>
        <PageHeader title="Purchases" description="Manage phone purchases" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Purchases" description={`Total: ${purchases.length} purchases`} />
      <div className="space-y-4 p-6">
        <div className="flex gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by supplier..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button onClick={() => navigate('/purchases/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={purchases}
          onRowClick={(purchase) => navigate(`/purchases/${purchase.id}`)}
        />
      </div>
    </>
  )
}
