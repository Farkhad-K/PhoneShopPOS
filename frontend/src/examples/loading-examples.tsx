/**
 * Loading Components Examples
 * Shows all loading components and their usage
 * DELETE THIS FILE after reviewing the examples
 */

import * as React from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PageLoader } from '@/components/ui/page-loader'
import {
  PageSkeletonLoader,
  CardSkeletonLoader,
  TableSkeletonLoader,
  FormSkeletonLoader,
  DashboardSkeletonLoader,
} from '@/components/ui/skeleton-loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function LoadingExamples() {
  const [showPageLoader, setShowPageLoader] = React.useState(false)
  const [showFullScreenSpinner, setShowFullScreenSpinner] = React.useState(false)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Loading Components Examples</h1>
        <p className="text-muted-foreground">
          All loading states and animations available in the app
        </p>
      </div>

      <Tabs defaultValue="spinners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spinners">Spinners</TabsTrigger>
          <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
          <TabsTrigger value="usage">Usage Examples</TabsTrigger>
        </TabsList>

        {/* Spinners Tab */}
        <TabsContent value="spinners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Loader (Full-Screen)</CardTitle>
              <CardDescription>
                Used for route transitions and initial app load
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowPageLoader(true)}>
                Show Page Loader
              </Button>
              {showPageLoader && (
                <div className="relative h-[400px] border rounded-lg overflow-hidden">
                  <PageLoader />
                  <Button
                    className="absolute top-4 right-4 z-[60]"
                    onClick={() => setShowPageLoader(false)}
                  >
                    Close
                  </Button>
                </div>
              )}
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`import { PageLoader } from '@/components/ui/page-loader'

<Suspense fallback={<PageLoader />}>
  <YourComponent />
</Suspense>`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading Spinner Sizes</CardTitle>
              <CardDescription>
                Inline spinners in different sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Small</p>
                  <LoadingSpinner size="sm" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Medium (Default)</p>
                  <LoadingSpinner size="md" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Large</p>
                  <LoadingSpinner size="lg" />
                </div>
              </div>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`import { LoadingSpinner } from '@/components/ui/loading-spinner'

<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full-Screen Spinner</CardTitle>
              <CardDescription>
                Spinner with backdrop overlay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowFullScreenSpinner(true)}>
                Show Full-Screen Spinner
              </Button>
              {showFullScreenSpinner && (
                <>
                  <LoadingSpinner fullScreen />
                  <Button
                    className="fixed top-4 right-4 z-[60]"
                    onClick={() => setShowFullScreenSpinner(false)}
                  >
                    Close
                  </Button>
                </>
              )}
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`<LoadingSpinner fullScreen />`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skeletons Tab */}
        <TabsContent value="skeletons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Skeleton</CardTitle>
              <CardDescription>
                General page content loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PageSkeletonLoader />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Skeleton</CardTitle>
              <CardDescription>
                Card-based layouts loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CardSkeletonLoader />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Table Skeleton</CardTitle>
              <CardDescription>
                Data table loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableSkeletonLoader />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Skeleton</CardTitle>
              <CardDescription>
                Form fields loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormSkeletonLoader />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Skeleton</CardTitle>
              <CardDescription>
                Complete dashboard loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardSkeletonLoader />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Examples Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Patterns</CardTitle>
              <CardDescription>
                Common patterns for using loading states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Route Transitions</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

<Suspense fallback={<PageLoader />}>
  <YourRoute />
</Suspense>`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">2. Async Data Loading</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`function DataTable() {
  const { data, isLoading } = useQuery('data', fetchData)
  
  if (isLoading) {
    return <TableSkeletonLoader />
  }
  
  return <Table data={data} />
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">3. Button Loading State</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <Button disabled={isLoading}>
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading ? 'Saving...' : 'Save'}
    </Button>
  )
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">4. Section Loading</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`function ProfileSection() {
  const { profile, isLoading } = useProfile()
  
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }
  
  return <ProfileCard profile={profile} />
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">5. Redux Persist</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`import { PersistGate } from 'redux-persist/integration/react'
import { PageLoader } from '@/components/ui/page-loader'

<PersistGate loading={<PageLoader delay={0} />} persistor={persistor}>
  <App />
</PersistGate>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">✅ Do:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Use PageLoader for full-page transitions</li>
                  <li>Use skeleton loaders for predictable layouts</li>
                  <li>Add delay to prevent flash on fast loads</li>
                  <li>Show loading text for accessibility</li>
                  <li>Match skeleton to actual content layout</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">❌ Don't:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Show loaders for less than 100ms operations</li>
                  <li>Use full-screen loaders for small sections</li>
                  <li>Show loaders without proper accessibility labels</li>
                  <li>Block the entire UI unnecessarily</li>
                  <li>Forget to handle loading errors</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
