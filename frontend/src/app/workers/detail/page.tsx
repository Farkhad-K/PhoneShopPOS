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
import { Separator } from '@/components/ui/separator'
import { CurrencyInput } from '@/components/shared/currency-input'
import { DataTable } from '@/components/shared/data-table'
import {
  useGetWorkerByIdQuery,
  useGetWorkerPaymentsQuery,
  useCreateWorkerPaymentMutation,
} from '@/api/workers'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ArrowLeft, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useEffect } from 'react'

const paymentSchema = z.object({
  workerId: z.number(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  bonus: z.number().min(0).optional(),
  deduction: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

export default function WorkerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: worker, isLoading } = useGetWorkerByIdQuery(Number(id))
  const { data: paymentsData, refetch: refetchPayments } =
    useGetWorkerPaymentsQuery({ workerId: Number(id) })

  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreateWorkerPaymentMutation()

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      workerId: Number(id),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      bonus: 0,
      deduction: 0,
      notes: '',
    },
  })

  const watchAmount = form.watch('amount')
  const watchBonus = form.watch('bonus') || 0
  const watchDeduction = form.watch('deduction') || 0

  const totalPaid = useMemo(() => {
    return watchAmount + watchBonus - watchDeduction
  }, [watchAmount, watchBonus, watchDeduction])

  useEffect(() => {
    if (worker) {
      form.setValue('amount', worker.monthlySalary)
    }
  }, [worker, form])

  const onSubmitPayment = async (data: PaymentFormData) => {
    try {
      await createPayment(data).unwrap()
      toast.success('Payment recorded successfully')
      form.reset({
        workerId: Number(id),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: worker?.monthlySalary || 0,
        bonus: 0,
        deduction: 0,
        notes: '',
      })
      refetchPayments()
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(
        err?.data?.message ||
          'Failed to record payment. Payment for this month/year may already exist.'
      )
    }
  }

  const paymentColumns: ColumnDef<WorkerPayment>[] = useMemo(
    () => [
      {
        accessorKey: 'month',
        header: 'Month',
        cell: ({ row }) => {
          const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ]
          return monthNames[row.original.month - 1]
        },
      },
      {
        accessorKey: 'year',
        header: 'Year',
      },
      {
        accessorKey: 'amount',
        header: 'Base',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.amount),
      },
      {
        accessorKey: 'bonus',
        header: 'Bonus',
        cell: ({ row }) =>
          row.original.bonus
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'UZS',
                minimumFractionDigits: 0,
              }).format(row.original.bonus)
            : '-',
      },
      {
        accessorKey: 'deduction',
        header: 'Deduction',
        cell: ({ row }) =>
          row.original.deduction
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'UZS',
                minimumFractionDigits: 0,
              }).format(row.original.deduction)
            : '-',
      },
      {
        accessorKey: 'totalPaid',
        header: 'Total Paid',
        cell: ({ row }) => (
          <span className="font-semibold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'UZS',
              minimumFractionDigits: 0,
            }).format(row.original.totalPaid)}
          </span>
        ),
      },
      {
        accessorKey: 'paymentDate',
        header: 'Date',
        cell: ({ row }) =>
          format(new Date(row.original.paymentDate), 'MMM dd, yyyy'),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <BaseLayout title="Worker Details" description="Loading...">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  if (!worker) {
    return (
      <BaseLayout title="Worker Not Found" description="Worker not found">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Worker not found</p>
          <Button onClick={() => navigate('/workers')} className="mt-4">
            Back to Workers
          </Button>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout title={worker.fullName} description={worker.phoneNumber}>
      <div className="space-y-6 p-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate('/workers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Worker Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Full Name
                </p>
                <p className="text-lg font-semibold">{worker.fullName}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p>{worker.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Passport ID
                  </p>
                  <p>{worker.passportId}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p>{worker.email || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p>{worker.address || 'N/A'}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Salary
                  </p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'UZS',
                      minimumFractionDigits: 0,
                    }).format(worker.monthlySalary)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Hire Date
                  </p>
                  <p>{format(new Date(worker.hireDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {worker.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm">{worker.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                New Payment
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
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={2020}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Amount *</FormLabel>
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="bonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonus</FormLabel>
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
                      name="deduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deduction</FormLabel>
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

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total to Pay:</span>
                      <span className="text-xl font-bold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0,
                        }).format(totalPaid)}
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Payment notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-sm text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <p className="font-medium mb-1">Note:</p>
                    <p>
                      Only one payment per month/year is allowed. The system will
                      reject duplicate payments.
                    </p>
                  </div>

                  <Button type="submit" disabled={isCreatingPayment}>
                    {isCreatingPayment ? 'Processing...' : 'Record Payment'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={paymentColumns}
              data={paymentsData?.data || []}
            />
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
