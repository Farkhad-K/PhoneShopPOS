import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetCustomersQuery } from '@/api/customers'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users } from 'lucide-react'
import { debounce } from '@/lib/debounce'

export default function CustomersListPage() {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useGetCustomersQuery()

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.toLowerCase())
  }, [])

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  )

  const customers = useMemo(() => {
    const allCustomers = data?.data || []
    if (!searchQuery) return allCustomers

    return allCustomers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(searchQuery) ||
        customer.phoneNumber.includes(searchQuery)
    )
  }, [data, searchQuery])

  const columns: ColumnDef<Customer>[] = useMemo(
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
        accessorKey: 'address',
        header: 'Address',
        cell: ({ row }) => row.original.address || 'N/A',
      },
      {
        accessorKey: 'passportId',
        header: 'Passport ID',
        cell: ({ row }) => row.original.passportId || 'N/A',
      },
      {
        accessorKey: 'createdAt',
        header: 'Registered',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <>
        <PageHeader title="Customers" description="Manage customers" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Customers" description={`Total: ${customers.length} customers`} />
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

          <Button onClick={() => navigate('/customers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
        />
      </div>
    </>
  )
}
