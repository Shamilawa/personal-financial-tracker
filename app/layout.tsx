import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FinTrack - Personal Finance Tracker',
  description: 'Track your monthly income and expenses with ease',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { getAccounts, getSettings } from "@/lib/actions"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [accounts, settings] = await Promise.all([
    getAccounts(),
    getSettings()
  ])

  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SidebarProvider>
          <AppSidebar accounts={accounts} currency={settings.currency} />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  )
}
