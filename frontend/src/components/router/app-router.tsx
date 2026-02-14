import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes'
import { PageLoader } from '@/components/ui/page-loader'

function renderRoutes(routeConfigs: RouteConfig[], isChild = false) {
  return routeConfigs.map((route, index) => {
    const element = isChild ? route.element : (
      <Suspense fallback={<PageLoader />}>
        {route.element}
      </Suspense>
    )

    if (route.index) {
      return (
        <Route
          key={route.path + index}
          index
          element={element}
        />
      )
    }

    return (
      <Route
        key={route.path + index}
        path={route.path}
        element={element}
      >
        {route.children && renderRoutes(route.children, true)}
      </Route>
    )
  })
}

export function AppRouter() {
  return (
    <Routes>
      {renderRoutes(routes)}
    </Routes>
  )
}
