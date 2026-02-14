import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { BarcodeDisplay } from '@/components/shared/barcode-display'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useGetPhoneByIdQuery } from '@/api/phones'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Package,
  Wrench,
  ShoppingCart,
} from 'lucide-react'

export default function PhoneDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: phone, isLoading } = useGetPhoneByIdQuery(Number(id))

  if (isLoading) {
    return (
      <>
        <PageHeader title="Phone Details" description="Loading..." />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  if (!phone) {
    return (
      <>
        <PageHeader title="Phone Not Found" description="Phone not found" />
        <div className="text-center p-8">
          <p className="text-muted-foreground">Phone not found</p>
          <Button onClick={() => navigate('/phones')} className="mt-4">
            Back to Phones
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={`${phone.brand} ${phone.model}`} description={`Barcode: ${phone.barcode}`} />
      <div className="space-y-6 p-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate('/phones')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Phone Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Brand & Model
                </p>
                <p className="text-lg font-semibold">
                  {phone.brand} {phone.model}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    IMEI
                  </p>
                  <p className="font-mono">{phone.imei || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Color
                  </p>
                  <p>{phone.color || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Condition
                  </p>
                  <p className="capitalize">
                    {phone.condition.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <StatusBadge status={phone.status} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Purchase Price
                  </p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'UZS',
                      minimumFractionDigits: 0,
                    }).format(phone.purchasePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Cost
                  </p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'UZS',
                      minimumFractionDigits: 0,
                    }).format(phone.totalCost)}
                  </p>
                </div>
              </div>

              {phone.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm">{phone.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <BarcodeDisplay
            barcode={phone.barcode}
            phoneModel={`${phone.brand} ${phone.model}`}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {phone.purchase && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Purchased</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(phone.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {phone.purchase.supplier && (
                      <p className="text-sm text-muted-foreground">
                        From: {phone.purchase.supplier.fullName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {phone.repairs && phone.repairs.length > 0 && (
                <>
                  {phone.repairs.map((repair) => (
                    <div key={repair.id} className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <Wrench className="h-5 w-5 text-yellow-600 dark:text-yellow-200" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Repair: {repair.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Cost:{' '}
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0,
                          }).format(repair.repairCost)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(repair.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <StatusBadge status={repair.status} className="mt-1" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {phone.sale && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-200" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Sold</p>
                    <p className="text-sm text-muted-foreground">
                      Sale Price:{' '}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(phone.sale.salePrice)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Profit:{' '}
                      <span
                        className={
                          phone.sale.profit > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0,
                        }).format(phone.sale.profit)}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(phone.sale.saleDate), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {phone.sale.customer && (
                      <p className="text-sm text-muted-foreground">
                        To: {phone.sale.customer.fullName}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {phone.status !== 'SOLD' && (
          <div className="flex gap-2 justify-end">
            {(phone.status === 'IN_STOCK' ||
              phone.status === 'READY_FOR_SALE') && (
              <Button onClick={() => navigate(`/sales/new?phoneId=${phone.id}`)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Sell Phone
              </Button>
            )}
            {phone.status !== 'IN_REPAIR' && (
              <Button
                variant="outline"
                onClick={() => navigate(`/repairs/new?phoneId=${phone.id}`)}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Create Repair
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
