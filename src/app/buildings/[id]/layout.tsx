import { UserProvider } from '@/lib/user-context'
import { AppDataProvider } from '@/lib/app-data-context'
import { ToastProvider } from '@/lib/use-toast'
import { Topbar } from '@/components/layout/topbar'

export default async function BuildingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <UserProvider buildingId={id}>
      <AppDataProvider buildingId={id}>
        <ToastProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.08),_transparent_32%),linear-gradient(180deg,_#f7f4ee_0%,_#f4efe8_48%,_#f8f6f2_100%)]">
            <Topbar buildingId={id} />
            <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 md:px-6 md:pb-10 md:pt-8">
              {children}
            </main>
          </div>
        </ToastProvider>
      </AppDataProvider>
    </UserProvider>
  )
}
