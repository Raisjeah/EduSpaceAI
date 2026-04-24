import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import MainLayout from '@/components/MainLayout'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EduSpaceAI',
  description: 'Platform belajar dengan AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
