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
import { useCreateCustomerMutation } from '@/api/customers'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'

const customerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  passportId: z.string().optional(),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function NewCustomerPage() {
  const navigate = useNavigate()

  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      address: '',
      passportId: '',
      notes: '',
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const result = await createCustomer(data).unwrap()
      toast.success('Customer created successfully!')
      navigate(`/customers/${result.id}`)
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || 'Failed to create customer')
    }
  }

  return (
    <BaseLayout title="New Customer" description="Add a new customer">
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            Cancel
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
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

                <FormField
                  control={form.control}
                  name="passportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport ID</FormLabel>
                      <FormControl>
                        <Input placeholder="AA1234567" {...field} />
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
                    onClick={() => navigate('/customers')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Customer
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
