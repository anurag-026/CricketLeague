import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ArenaLayout } from '@/layouts/ArenaLayout'
import { CyberLayout } from '@/layouts/CyberLayout'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LobbyPage } from '@/pages/LobbyPage'
import { MatchArenaPage } from '@/pages/MatchArenaPage'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <CyberLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/history', element: <HistoryPage /> },
        ],
      },
      {
        element: <ArenaLayout />,
        children: [
          { path: '/lobby', element: <LobbyPage /> },
          { path: '/lobby/:roomCode', element: <LobbyPage /> },
          { path: '/match/:matchId', element: <MatchArenaPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
