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
import { useCreateRepairMutation } from '@/api/repairs'
import { useGetPhonesQuery } from '@/api/phones'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Wrench } from 'lucide-react'

const repairSchema = z.object({
  phoneId: z.number().min(1, 'Phone is required'),
  description: z.string().min(1, 'Description is required'),
  repairCost: z.number().min(1, 'Repair cost must be greater than 0'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']) as z.ZodType<RepairStatus>,
  startDate: z.string().optional(),
  notes: z.string().optional(),
})

type RepairFormData = z.infer<typeof repairSchema>

export default function NewRepairPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPhoneId = searchParams.get('phoneId')

  const { data: phonesData } = useGetPhonesQuery({
    status: 'IN_STOCK',
  })
  const phones = phonesData?.data || []

  const [createRepair, { isLoading: isCreating }] = useCreateRepairMutation()

  const form = useForm<RepairFormData>({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      phoneId: preselectedPhoneId ? Number(preselectedPhoneId) : 0,
      description: '',
      repairCost: 0,
      status: 'PENDING',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  const selectedPhoneId = form.watch('phoneId')
  const selectedPhone = phones.find((p) => p.id === selectedPhoneId)

  const onSubmit = async (data: RepairFormData) => {
    try {
      const result = await createRepair(data).unwrap()
      toast.success('Repair created successfully!')
      navigate(`/repairs/${result.id}`)
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || 'Failed to create repair')
    }
  }

  return (
    <BaseLayout title="New Repair" description="Create a new repair record">
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => navigate('/repairs')}>
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
                            <SelectValue placeholder="Select phone to repair" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {phones.map((phone) => (
                            <SelectItem key={phone.id} value={phone.id.toString()}>
                              {phone.brand} {phone.model} - {phone.barcode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <span className="text-muted-foreground">Barcode:</span>{' '}
                        <span className="font-mono">{selectedPhone.barcode}</span>
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
                      <div>
                        <span className="text-muted-foreground">Total Cost:</span>{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0,
                        }).format(selectedPhone.totalCost)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repair Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the issue and repair work needed..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="repairCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repair Cost *</FormLabel>
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
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
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
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
                          placeholder="Additional notes about the repair..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/repairs')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Wrench className="mr-2 h-4 w-4" />
                    Create Repair
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
