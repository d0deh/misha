import Link from 'next/link'
import { MishaMark, MishaWordmark } from '@/components/brand/misha-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(28,28,28,0.03)] md:p-8">
        <div className="flex flex-col items-center text-center">
          <MishaMark size={56} tone="brand" />
          <MishaWordmark className="mt-5 items-center" showEnglish={false} />
          <h1 className="mt-8 text-2xl font-medium text-foreground">مرحباً بعودتك</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            سجّل الدخول إلى مساحة إدارة الملكيات المشتركة.
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" dir="ltr" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" type="button">
            تسجيل الدخول
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <Link href="/buildings" className="font-medium text-primary hover:text-secondary">
            دخول النسخة التجريبية
          </Link>
          <a href="mailto:support@mishaa.sa" className="text-muted-foreground hover:text-foreground">
            المساعدة
          </a>
        </div>
      </section>
    </main>
  )
}
