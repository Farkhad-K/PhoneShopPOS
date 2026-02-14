import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CurrencyInput } from '@/components/shared/currency-input'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  useGetCustomerByIdQuery,
  useGetCustomerBalanceQuery,
} from '@/api/customers'
import { useCreatePaymentMutation } from '@/api/payments'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ArrowLeft, DollarSign, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_PAYMENT']) as z.ZodType<PaymentMethod>,
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: customer, isLoading } = useGetCustomerByIdQuery(Number(id))
  const { data: balance, refetch: refetchBalance } =
    useGetCustomerBalanceQuery(Number(id))

  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreatePaymentMutation()

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      notes: '',
    },
  })

  const onSubmitPayment = async (data: PaymentFormData) => {
    try {
      await createPayment({
        ...data,
        customerId: Number(id),
      }).unwrap()
      toast.success('Payment applied successfully')
      form.reset()
      refetchBalance()
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || 'Failed to apply payment')
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Customer Details" description="Loading..." />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  if (!customer) {
    return (
      <>
        <PageHeader title="Customer Not Found" description="Customer not found" />
        <div className="text-center p-8">
          <p className="text-muted-foreground">Customer not found</p>
          <Button onClick={() => navigate('/customers')} className="mt-4">
            Back to Customers
          </Button>
        </div>
      </>
    )
  }

  const totalDebt = balance?.totalDebt || 0

  return (
    <>
      <PageHeader title={customer.fullName} description={customer.phoneNumber} />
      <div className="space-y-6 p-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Full Name
                </p>
                <p className="text-lg font-semibold">{customer.fullName}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p>{customer.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Passport ID
                  </p>
                  <p>{customer.passportId || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p>{customer.address || 'N/A'}</p>
              </div>

              {customer.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="text-sm text-muted-foreground">
                Registered: {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Balance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Debt
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'UZS',
                    minimumFractionDigits: 0,
                  }).format(totalDebt)}
                </p>
              </div>

              {balance && balance.unpaidSales && balance.unpaidSales.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3">
                      Unpaid Sales (FIFO Order)
                    </p>
                    <div className="space-y-2">
                      {balance.unpaidSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-3 border rounded-lg text-sm space-y-1"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {sale.phone.brand} {sale.phone.model}
                            </span>
                            <StatusBadge
                              status={
                                sale.paidAmount === 0
                                  ? 'UNPAID'
                                  : sale.paidAmount < sale.salePrice
                                  ? 'PARTIAL'
                                  : 'PAID'
                              }
                            />
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Sale Price:</span>
                            <span>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'UZS',
                                minimumFractionDigits: 0,
                              }).format(sale.salePrice)}
                            </span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Paid:</span>
                            <span>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'UZS',
                                minimumFractionDigits: 0,
                              }).format(sale.paidAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium text-red-600">
                            <span>Remaining:</span>
                            <span>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'UZS',
                                minimumFractionDigits: 0,
                              }).format(sale.remainingBalance)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(sale.saleDate), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {totalDebt > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Apply Payment (FIFO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitPayment)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Amount *</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="BANK_TRANSFER">
                                Bank Transfer
                              </SelectItem>
                              <SelectItem value="CARD">Card</SelectItem>
                              <SelectItem value="MOBILE_PAYMENT">
                                Mobile Payment
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Payment notes..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    <p className="font-medium mb-1">FIFO Payment Logic:</p>
                    <p>
                      Payment will be automatically applied to the oldest unpaid
                      transaction first. If the payment exceeds the transaction
                      balance, the remainder will be applied to the next
                      transaction.
                    </p>
                  </div>

                  <Button type="submit" disabled={isCreatingPayment}>
                    {isCreatingPayment ? 'Processing...' : 'Apply Payment'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
