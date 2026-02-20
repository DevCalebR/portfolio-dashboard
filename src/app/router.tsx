import { lazy, Suspense, type ReactElement } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { RouteLoadingState } from './RouteLoadingState'

const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)

const RunsPage = lazy(() =>
  import('../pages/RunsPage').then((module) => ({
    default: module.RunsPage,
  })),
)

const NewRunPage = lazy(() =>
  import('../pages/NewRunPage').then((module) => ({
    default: module.NewRunPage,
  })),
)

const RunDetailPage = lazy(() =>
  import('../pages/RunDetailPage').then((module) => ({
    default: module.RunDetailPage,
  })),
)

const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function withRouteFallback(element: ReactElement): ReactElement {
  return <Suspense fallback={<RouteLoadingState />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/dashboard" />,
      },
      {
        path: 'dashboard',
        element: withRouteFallback(<DashboardPage />),
      },
      {
        path: 'runs',
        element: withRouteFallback(<RunsPage />),
      },
      {
        path: 'runs/new',
        element: withRouteFallback(<NewRunPage />),
      },
      {
        path: 'runs/:id',
        element: withRouteFallback(<RunDetailPage />),
      },
      {
        path: '*',
        element: withRouteFallback(<NotFoundPage />),
      },
    ],
  },
])
