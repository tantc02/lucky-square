import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vòng Quay May Mắn & Lắc Xí Ngầu',
  description: 'Trò chơi Vòng quay may mắn và Lắc xí ngầu tương tác chuyên nghiệp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-800 min-h-screen antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  )
}
