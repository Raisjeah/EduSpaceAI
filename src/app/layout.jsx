import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import MainLayout from '@/components/MainLayout'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import ThemeProvider from '@/components/ThemeProvider'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EduSpaceAI',
  description: 'Platform belajar dengan AI',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <AuthProvider>
            <ChatProvider>
              <MainLayout>{children}</MainLayout>
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
