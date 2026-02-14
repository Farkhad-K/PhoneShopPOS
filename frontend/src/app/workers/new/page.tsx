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
import { PhoneNumberInput } from '@/components/shared/phone-number-input'
import { CurrencyInput } from '@/components/shared/currency-input'
import { useCreateWorkerMutation } from '@/api/workers'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'

const workerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  passportId: z.string().min(1, 'Passport ID is required'),
  hireDate: z.string(),
  monthlySalary: z.number().min(1, 'Monthly salary must be greater than 0'),
  notes: z.string().optional(),
})

type WorkerFormData = z.infer<typeof workerSchema>

export default function NewWorkerPage() {
  const navigate = useNavigate()

  const [createWorker, { isLoading: isCreating }] = useCreateWorkerMutation()

  const form = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      passportId: '',
      hireDate: new Date().toISOString().split('T')[0],
      monthlySalary: 0,
      notes: '',
    },
  })

  const onSubmit = async (data: WorkerFormData) => {
    try {
      const result = await createWorker(data).unwrap()
      toast.success('Worker created successfully!')
      navigate(`/workers/${result.id}`)
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || 'Failed to create worker')
    }
  }

  return (
    <BaseLayout title="New Worker" description="Add a new worker">
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => navigate('/workers')}>
            Cancel
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Worker Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <PhoneNumberInput
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Street, City, Region"
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
                    name="passportId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="AA1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hire Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="monthlySalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary *</FormLabel>
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional information..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/workers')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Worker
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
