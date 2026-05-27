import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppBootstrap } from '@/app/AppBootstrap'
import { router } from '@/app/router'
import '@/app/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppBootstrap>
      <RouterProvider router={router} />
    </AppBootstrap>
  </StrictMode>,
)
