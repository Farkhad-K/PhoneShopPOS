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
import { useCreatePurchaseMutation } from '@/api/purchases'
import { useGetSuppliersQuery } from '@/api/suppliers'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, Package } from 'lucide-react'
import { useMemo, useEffect } from 'react'

const phoneSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  imei: z.string().optional(),
  color: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']) as z.ZodType<PhoneCondition>,
  purchasePrice: z.number().min(1, 'Price must be greater than 0'),
  status: z.enum(['IN_STOCK', 'IN_REPAIR']) as z.ZodType<PhoneStatus>,
  notes: z.string().optional(),
})

const purchaseSchema = z.object({
  supplierId: z.number().min(1, 'Supplier is required'),
  phones: z.array(phoneSchema).min(1, 'At least one phone is required'),
  purchaseDate: z.string().optional(),
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'UNPAID']) as z.ZodType<PaymentStatus>,
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type PurchaseFormData = z.infer<typeof purchaseSchema>

export default function NewPurchasePage() {
  const navigate = useNavigate()

  const { data: suppliersData } = useGetSuppliersQuery()
  const suppliers = suppliersData?.data || []

  const [createPurchase, { isLoading: isCreating }] =
    useCreatePurchaseMutation()

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: 0,
      phones: [
        {
          brand: '',
          model: '',
          imei: '',
          color: '',
          condition: 'NEW',
          purchasePrice: 0,
          status: 'IN_STOCK',
          notes: '',
        },
      ],
      purchaseDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'PAID',
      paidAmount: 0,
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'phones',
  })

  const watchPhones = form.watch('phones')
  const watchPaymentStatus = form.watch('paymentStatus')

  const totalAmount = useMemo(() => {
    return watchPhones.reduce(
      (sum, phone) => sum + (phone.purchasePrice || 0),
      0
    )
  }, [watchPhones])

  useEffect(() => {
    if (watchPaymentStatus === 'PAID') {
      form.setValue('paidAmount', totalAmount)
    } else if (watchPaymentStatus === 'UNPAID') {
      form.setValue('paidAmount', 0)
    }
  }, [watchPaymentStatus, totalAmount, form])

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      const result = await createPurchase(data).unwrap()
      toast.success(
        `Purchase created successfully! ${data.phones.length} phone(s) added.`
      )
      navigate(`/purchases/${result.id}`)
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || 'Failed to create purchase')
    }
  }

  return (
    <BaseLayout
      title="New Purchase"
      description="Add new phones to inventory"
    >
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => navigate('/purchases')}>
            Cancel
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.id.toString()}
                            >
                              {supplier.fullName} - {supplier.phoneNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this purchase..."
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Phones ({fields.length})</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      brand: '',
                      model: '',
                      imei: '',
                      color: '',
                      condition: 'NEW',
                      purchasePrice: 0,
                      status: 'IN_STOCK',
                      notes: '',
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Phone
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Phone #{index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`phones.${index}.brand`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand *</FormLabel>
                            <FormControl>
                              <Input placeholder="Apple, Samsung..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`phones.${index}.model`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model *</FormLabel>
                            <FormControl>
                              <Input placeholder="iPhone 15 Pro..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`phones.${index}.imei`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IMEI</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789012345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`phones.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input placeholder="Midnight Black..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`phones.${index}.condition`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition *</FormLabel>
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
                                <SelectItem value="NEW">New</SelectItem>
                                <SelectItem value="LIKE_NEW">Like New</SelectItem>
                                <SelectItem value="GOOD">Good</SelectItem>
                                <SelectItem value="FAIR">Fair</SelectItem>
                                <SelectItem value="POOR">Poor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`phones.${index}.status`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Status *</FormLabel>
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
                                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                                <SelectItem value="IN_REPAIR">
                                  In Repair
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`phones.${index}.purchasePrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purchase Price *</FormLabel>
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
                    </div>

                    <FormField
                      control={form.control}
                      name={`phones.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Condition details, defects, etc..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'UZS',
                      minimumFractionDigits: 0,
                    }).format(totalAmount)}
                  </span>
                </div>

                <FormField
                  control={form.control}
                  name="paidAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Amount</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchPaymentStatus !== 'PAID' && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Remaining:{' '}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(totalAmount - (form.watch('paidAmount') || 0))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchases')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Create Purchase
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
