import { notFound } from 'next/navigation'
import { UserProvider } from '@/lib/user-context'
import { AppDataProvider } from '@/lib/app-data-context'
import { ToastProvider } from '@/lib/use-toast'
import { AppShell } from '@/components/layout/app-shell'
import { getBuildingData } from '@/lib/mock-data'

export default async function BuildingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!getBuildingData(id)) {
    notFound()
  }

  return (
    <UserProvider buildingId={id}>
      <AppDataProvider buildingId={id}>
        <ToastProvider>
          <AppShell buildingId={id}>{children}</AppShell>
        </ToastProvider>
      </AppDataProvider>
    </UserProvider>
  )
}
