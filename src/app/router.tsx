import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { NewRunPage } from '../pages/NewRunPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RunDetailPage } from '../pages/RunDetailPage'
import { RunsPage } from '../pages/RunsPage'

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
        element: <DashboardPage />,
      },
      {
        path: 'runs',
        element: <RunsPage />,
      },
      {
        path: 'runs/new',
        element: <NewRunPage />,
      },
      {
        path: 'runs/:id',
        element: <RunDetailPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
