import { BrowserRouter } from 'react-router-dom'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}
