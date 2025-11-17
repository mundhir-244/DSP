import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { UserContextProvider } from '../context/userContext'
import './index.css'
import { router } from './router'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <UserContextProvider>
      <RouterProvider router={router} />
      <Toaster position='top-right' toastOptions={{ duration: 3000 }} />
    </UserContextProvider>
  // </StrictMode>,
)
