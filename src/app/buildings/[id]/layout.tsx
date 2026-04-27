import { notFound } from 'next/navigation'
import { UserProvider } from '@/lib/user-context'
import { AppDataProvider } from '@/lib/app-data-context'
import { ToastProvider } from '@/lib/use-toast'
import { Topbar } from '@/components/layout/topbar'
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
          <div className="min-h-screen bg-background">
            <Topbar buildingId={id} />
            <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 md:px-6 md:pb-10 md:pt-6 lg:pt-7">
              {children}
            </main>
          </div>
        </ToastProvider>
      </AppDataProvider>
    </UserProvider>
  )
}
