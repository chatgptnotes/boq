import { redirect } from 'next/navigation'
import { getUser } from '@/services/auth'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardShell userEmail={user.email ?? ''}>
      {children}
    </DashboardShell>
  )
}
