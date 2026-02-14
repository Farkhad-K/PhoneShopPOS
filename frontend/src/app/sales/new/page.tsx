import { BaseLayout } from '@/components/layouts/base-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { CurrencyInput } from '@/components/shared/currency-input'
import { useCreateSaleMutation } from '@/api/sales'
import { useGetPhonesQuery } from '@/api/phones'
import { useGetCustomersQuery } from '@/api/customers'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ShoppingCart, TrendingUp } from 'lucide-react'
import { useMemo, useEffect } from 'react'

const saleSchema = z.object({
  phoneId: z.number().min(1, 'Phone is required'),
  customerId: z.number().optional(),
  salePrice: z.number().min(1, 'Sale price must be greater than 0'),
  paymentType: z.enum(['CASH', 'PAY_LATER']) as z.ZodType<PaymentType>,
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'UNPAID']) as z.ZodType<PaymentStatus>,
  paidAmount: z.number().min(0).optional(),
  saleDate: z.string().optional(),
  notes: z.string().optional(),
})

type SaleFormData = z.infer<typeof saleSchema>

export default function NewSalePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPhoneId = searchParams.get('phoneId')

  const { data: phonesData } = useGetPhonesQuery({
    status: 'READY_FOR_SALE',
  })
  const availablePhones = phonesData?.data || []

  const { data: customersData } = useGetCustomersQuery()
  const customers = customersData?.data || []

  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation()

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      phoneId: preselectedPhoneId ? Number(preselectedPhoneId) : 0,
      customerId: undefined,
      salePrice: 0,
      paymentType: 'CASH',
      paymentStatus: 'PAID',
      paidAmount: 0,
      saleDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  const selectedPhoneId = form.watch('phoneId')
  const salePrice = form.watch('salePrice')
  const paymentType = form.watch('paymentType')
  const paymentStatus = form.watch('paymentStatus')

  const selectedPhone = availablePhones.find((p) => p.id === selectedPhoneId)

  const profit = useMemo(() => {
    if (!selectedPhone || !salePrice) return 0
    return salePrice - selectedPhone.totalCost
  }, [selectedPhone, salePrice])

  const profitMargin = useMemo(() => {
    if (!salePrice) return 0
    return (profit / salePrice) * 100
  }, [profit, salePrice])

  useEffect(() => {
    if (paymentType === 'CASH') {
      form.setValue('paymentStatus', 'PAID')
      form.setValue('paidAmount', salePrice)
    } else if (paymentType === 'PAY_LATER') {
      form.setValue('paymentStatus', 'UNPAID')
      form.setValue('paidAmount', 0)
    }
  }, [paymentType, salePrice, form])

  useEffect(() => {
    if (paymentStatus === 'PAID') {
      form.setValue('paidAmount', salePrice)
    } else if (paymentStatus === 'UNPAID') {
      form.setValue('paidAmount', 0)
    }
  }, [paymentStatus, salePrice, form])

  const onSubmit = async (data: SaleFormData) => {
    if (data.paymentType === 'PAY_LATER' && !data.customerId) {
      toast.error('Customer is required for pay-later sales')
      return
    }

    try {
      const result = await createSale(data).unwrap()
      toast.success(
        `Sale created successfully! Profit: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'UZS',
          minimumFractionDigits: 0,
        }).format(profit)}`
      )
      navigate(`/sales/${result.id}`)
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || 'Failed to create sale')
    }
  }

  return (
    <BaseLayout title="New Sale" description="Create a new sale transaction">
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Cancel
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Phone Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="phoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select phone to sell" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availablePhones.map((phone) => (
                            <SelectItem key={phone.id} value={phone.id.toString()}>
                              {phone.brand} {phone.model} - {phone.barcode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Only phones with status READY_FOR_SALE or IN_STOCK are available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedPhone && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium">Selected Phone Details</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Brand:</span>{' '}
                        {selectedPhone.brand}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>{' '}
                        {selectedPhone.model}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Condition:</span>{' '}
                        {selectedPhone.condition}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Purchase Price:</span>{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0,
                        }).format(selectedPhone.purchasePrice)}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground font-medium">Total Cost (incl. repairs):</span>{' '}
                        <span className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0,
                          }).format(selectedPhone.totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sale Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price *</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedPhone && salePrice > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Profit Calculation</span>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sale Price:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0,
                          }).format(salePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0,
                          }).format(selectedPhone.totalCost)}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Profit:</span>
                        <span
                          className={`font-bold ${
                            profit > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0,
                          }).format(profit)}{' '}
                          ({profitMargin.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">Cash (Full Payment)</SelectItem>
                            <SelectItem value="PAY_LATER">
                              Pay Later (Customer Debt)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Customer {paymentType === 'PAY_LATER' && '*'}
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : undefined)
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer.id}
                                value={customer.id.toString()}
                              >
                                {customer.fullName} - {customer.phoneNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {paymentType === 'PAY_LATER'
                            ? 'Required for pay-later sales'
                            : 'Optional'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Date</FormLabel>
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
                          placeholder="Additional notes about the sale..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={paymentType === 'CASH'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="PARTIAL">Partial</SelectItem>
                          <SelectItem value="UNPAID">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {paymentType === 'CASH'
                          ? 'Auto-set to PAID for cash sales'
                          : 'Select payment status'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paidAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Amount</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={
                            paymentStatus === 'PAID' || paymentStatus === 'UNPAID'
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {paymentStatus === 'PAID' && 'Auto-filled with sale price'}
                        {paymentStatus === 'UNPAID' && 'Auto-set to 0'}
                        {paymentStatus === 'PARTIAL' && 'Enter partial payment amount'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paymentStatus === 'PARTIAL' && salePrice > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Remaining:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'UZS',
                      minimumFractionDigits: 0,
                    }).format(salePrice - (form.watch('paidAmount') || 0))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sales')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create Sale
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </BaseLayout>
  )
}
