import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { LayoutProvider } from '@/context/LayoutContext'
import ThemeProvider from '@/components/ui/ThemeProvider'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EduSpaceAI — Asisten Riset Akademik Berbasis AI',
  description:
    'Platform riset akademik bertenaga AI untuk mahasiswa Indonesia. Bantu skripsi, temukan referensi Scopus, koreksi PUEBI, dan visualisasi data penelitian.',
  keywords: ['skripsi', 'riset akademik', 'AI penelitian', 'jurnal Scopus', 'PUEBI', 'asisten AI mahasiswa'],
  authors: [{ name: 'EduSpaceAI Team' }],
  openGraph: {
    title: 'EduSpaceAI — Asisten Riset Akademik Berbasis AI',
    description:
      'Platform riset akademik bertenaga AI untuk mahasiswa Indonesia. Bantu skripsi, referensi, dan penulisan.',
    url: 'https://eduspaceai.com',
    siteName: 'EduSpaceAI',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EduSpaceAI' }],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduSpaceAI — Asisten Riset Akademik Berbasis AI',
    description: 'Platform riset akademik bertenaga AI untuk mahasiswa Indonesia.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.png' },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <AuthProvider>
            <ChatProvider>
              <LayoutProvider>
                <Suspense fallback={null}>
                  <MainLayout>{children}</MainLayout>
                </Suspense>
              </LayoutProvider>
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
