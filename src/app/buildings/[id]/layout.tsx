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
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,63,69,0.1),_transparent_28%),linear-gradient(180deg,_#f4ede3_0%,_#f1eadf_44%,_#f8f5ef_100%)]">
            <Topbar buildingId={id} />
            <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 md:px-6 md:pb-10 md:pt-6 lg:pt-7">
              {children}
            </main>
          </div>
        </ToastProvider>
      </AppDataProvider>
    </UserProvider>
  )
}
