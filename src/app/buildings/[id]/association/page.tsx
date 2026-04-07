'use client'

import { useMemo, useState } from 'react'
import { Phone, Plus, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBody,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderTitle,
} from '@/components/ui/page-header'
import { PermissionButton } from '@/components/ui/permission-button'
import {
  getOwnerById,
  getOwnerUnits,
  getRoleLabel,
  getStatusLabel,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  canSeeContactDetails,
  canSeeOwnersList,
  useUser,
} from '@/lib/user-context'
import { useAppData } from '@/lib/app-data-context'
import { useToast } from '@/lib/use-toast'

const roleBadgeStyles: Record<string, { dot: string; badge: string }> = {
  chairman: { dot: 'bg-primary', badge: 'border-primary/20 bg-primary/10 text-primary' },
  vice_chairman: { dot: 'bg-primary', badge: 'border-primary/20 bg-primary/10 text-primary' },
  board_member: { dot: 'bg-violet-500', badge: 'border-violet-200 bg-violet-50 text-violet-700' },
  manager: { dot: 'bg-warning', badge: 'border-warning/20 bg-warning/10 text-warning' },
  owner: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
  resident: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
}

const statusBadge: Record<string, string> = {
  active: 'border-success/20 bg-success/10 text-success',
  suspended: 'border-destructive/20 bg-destructive/10 text-destructive',
  under_formation: 'border-warning/20 bg-warning/10 text-warning',
}

const statusDot: Record<string, string> = {
  active: 'bg-success',
  suspended: 'bg-destructive',
  under_formation: 'bg-warning',
}

const feeStatusStyles: Record<string, { dot: string; badge: string; label: string }> = {
  paid: {
    dot: 'bg-success',
    badge: 'border-success/20 bg-success/10 text-success',
    label: 'مدفوع',
  },
  partial: {
    dot: 'bg-warning',
    badge: 'border-warning/20 bg-warning/10 text-warning',
    label: 'جزئي',
  },
  unpaid: {
    dot: 'bg-destructive',
    badge: 'border-destructive/20 bg-destructive/10 text-destructive',
    label: 'غير مدفوع',
  },
}

export default function AssociationPage() {
  const { role, userId } = useUser()
  const { owners, units, ownershipLinks, association, associationRoles, addDocument, fees } =
    useAppData()
  const { toast } = useToast()
  const showContacts = canSeeContactDetails(role)
  const showOwnersList = canSeeOwnersList(role)
  const isAdmin = ['chairman', 'vice_chairman'].includes(role)

  const boardRoles = associationRoles.filter(
    (associationRole) => associationRole.role !== 'owner' && associationRole.role !== 'resident'
  )
  const boardCount = boardRoles.length

  const [ownerSearch, setOwnerSearch] = useState('')
  const [minutesOpen, setMinutesOpen] = useState(false)
  const [minutesDate, setMinutesDate] = useState('')
  const [minutesTitle, setMinutesTitle] = useState('محضر اجتماع ')
  const [minutesSummary, setMinutesSummary] = useState('')

  function handleMinutesSubmit() {
    if (!minutesSummary.trim()) return

    addDocument(
      {
        title: minutesTitle.trim() || `محضر اجتماع ${minutesDate}`,
        documentType: 'minutes',
        entityType: 'association',
        entityId: association.id,
        fileUrl: `/documents/minutes-${minutesDate || 'new'}.pdf`,
        uploadedBy: userId,
        visibility: 'everyone',
        notes: minutesSummary.trim(),
        fileSize: '0.8 MB',
      },
      userId
    )

    toast('تم إنشاء محضر الاجتماع بنجاح')
    setMinutesOpen(false)
    setMinutesDate('')
    setMinutesTitle('محضر اجتماع ')
    setMinutesSummary('')
  }

  const feesData = useMemo(() => {
    const showAll = ['chairman', 'vice_chairman', 'manager'].includes(role)
    const relevantFees = showAll ? fees : fees.filter((fee) => fee.ownerId === userId)

    return relevantFees.map((fee) => {
      const owner = getOwnerById(fee.ownerId, owners)
      const ownerUnits = getOwnerUnits(fee.ownerId, ownershipLinks, units)

      return {
        ownerId: fee.ownerId,
        ownerName: owner?.fullName || '',
        unitNumbers: ownerUnits.map((unit) => unit.unitNumber).join('، '),
        amountDue: fee.annualAmount,
        amountPaid: fee.paidAmount,
        status: fee.status,
      }
    })
  }, [fees, owners, ownershipLinks, role, units, userId])

  const totalDue = feesData.reduce((sum, fee) => sum + fee.amountDue, 0)
  const totalCollected = feesData.reduce((sum, fee) => sum + fee.amountPaid, 0)
  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageHeaderBody>
          <PageHeaderEyebrow>سجل الجمعية</PageHeaderEyebrow>
          <PageHeaderTitle>الجمعية والأعضاء</PageHeaderTitle>
          <PageHeaderDescription>
            {association.name} · رقم التسجيل{' '}
            <span className="tabular-nums" dir="ltr">
              {association.registrationNumber}
            </span>
          </PageHeaderDescription>
        </PageHeaderBody>
        <PageHeaderActions>
          <PermissionButton
            hasPermission={isAdmin}
            tooltipText="فقط رئيس الجمعية أو نائبه يمكنه إنشاء محاضر"
            size="sm"
            onClick={() => setMinutesOpen(true)}
          >
            <Plus className="h-4 w-4" data-icon="inline-start" />
            محضر اجتماع جديد
          </PermissionButton>
        </PageHeaderActions>
      </PageHeader>

      <div className="page-shell p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{association.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground tabular-nums" dir="ltr">
              {association.registrationNumber}
            </p>
          </div>
          <span className={cn('status-pill', statusBadge[association.status])}>
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[association.status])} />
            {getStatusLabel(association.status)}
          </span>
        </div>
      </div>

      <section className="page-shell p-5 md:p-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-heading-kicker">مجلس الإدارة</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">الأعضاء والدور التنفيذي</h2>
          </div>
          <p className="text-sm text-muted-foreground">{boardCount} أعضاء</p>
        </div>

        <div className="divide-y divide-border/70 overflow-hidden rounded-[1.25rem] border border-border/80 bg-muted/20">
          {boardRoles.map((roleRecord) => {
            const owner = getOwnerById(roleRecord.userId, owners)
            if (!owner) return null
            const style = roleBadgeStyles[roleRecord.role] || roleBadgeStyles.owner

            return (
              <div key={roleRecord.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{owner.fullName}</p>
                  <span className={cn('status-pill mt-1', style.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                    {getRoleLabel(roleRecord.role)}
                  </span>
                </div>
                {showContacts && (
                  <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-xs tabular-nums" dir="ltr">
                      {owner.phone}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {showOwnersList && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-heading-kicker">قائمة الملاك</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">التمثيل والملكية</h2>
            </div>
          </div>
          <div className="page-shell p-4 md:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث باسم المالك..."
                value={ownerSearch}
                onChange={(event) => setOwnerSearch(event.target.value)}
                className="ps-9"
              />
            </div>
          </div>
          <div className="data-table-shell">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/45 hover:bg-muted/45">
                  <TableHead>الاسم</TableHead>
                  <TableHead>الدور</TableHead>
                  {showContacts && <TableHead className="hidden md:table-cell">الهاتف</TableHead>}
                  <TableHead className="hidden md:table-cell">الوحدات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners
                  .filter((owner) => ownerSearch === '' || owner.fullName.includes(ownerSearch))
                  .map((owner) => {
                    const ownerRole = associationRoles.find((associationRole) => associationRole.userId === owner.id)
                    const unitCount = getOwnerUnits(owner.id, ownershipLinks, units).length
                    const isPrimary = ownershipLinks.some((link) => {
                      if (link.ownerId !== owner.id || !link.isPrimaryRepresentative) return false
                      return ownershipLinks.filter((otherLink) => otherLink.unitId === link.unitId).length > 1
                    })
                    const style = roleBadgeStyles[ownerRole?.role || 'owner']

                    return (
                      <TableRow key={owner.id} className="h-12">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{owner.fullName}</span>
                            {isPrimary && (
                              <span className="inline-flex items-center gap-1 text-xs text-success">
                                <span className="h-1 w-1 rounded-full bg-success" />
                                ممثل
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn('status-pill', style.badge)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                            {getRoleLabel(ownerRole?.role || 'owner')}
                          </span>
                        </TableCell>
                        {showContacts && (
                          <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell" dir="ltr">
                            {owner.phone}
                          </TableCell>
                        )}
                        <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                          {unitCount} وحدة
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <p className="section-heading-kicker">الرسوم السنوية</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">كشف الرسوم والتحصيل</h2>
        </div>
        <div className="data-table-shell">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/45 hover:bg-muted/45">
                <TableHead>المالك</TableHead>
                <TableHead className="hidden md:table-cell">الوحدات</TableHead>
                <TableHead>المطلوب</TableHead>
                <TableHead>المدفوع</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesData.map((fee) => {
                const style = feeStatusStyles[fee.status]
                return (
                  <TableRow key={fee.ownerId} className="h-12">
                    <TableCell className="text-sm font-medium text-foreground">
                      {fee.ownerName.split(' ').slice(0, 3).join(' ')}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {fee.unitNumbers}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-foreground/85">
                      {fee.amountDue.toLocaleString('ar-SA')} ر.س
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-foreground/85">
                      {fee.amountPaid.toLocaleString('ar-SA')} ر.س
                    </TableCell>
                    <TableCell>
                      <span className={cn('status-pill', style.badge)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                        {style.label}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {['chairman', 'vice_chairman', 'manager'].includes(role) && (
          <div className="page-shell p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                الإجمالي المطلوب{' '}
                <span className="font-semibold tabular-nums text-foreground">
                  {totalDue.toLocaleString('ar-SA')} ر.س
                </span>
              </span>
              <span>·</span>
              <span>
                المحصل{' '}
                <span className="font-semibold tabular-nums text-foreground">
                  {totalCollected.toLocaleString('ar-SA')} ر.س
                </span>
              </span>
              <span>·</span>
              <span>
                نسبة التحصيل{' '}
                <span className="font-semibold tabular-nums text-foreground">{collectionRate}٪</span>
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/80">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        {owners.length} مالك · {boardCount} أعضاء مجلس إدارة
      </p>

      <Dialog open={minutesOpen} onOpenChange={setMinutesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>محضر اجتماع جديد</DialogTitle>
            <DialogDescription>سجل محضر اجتماع الجمعية أو مجلس الإدارة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>تاريخ الاجتماع</Label>
              <Input type="date" value={minutesDate} onChange={(event) => setMinutesDate(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>العنوان</Label>
              <Input value={minutesTitle} onChange={(event) => setMinutesTitle(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>الملخص والقرارات</Label>
              <Textarea
                value={minutesSummary}
                onChange={(event) => setMinutesSummary(event.target.value)}
                placeholder="اكتب ملخص الاجتماع والقرارات المتخذة..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleMinutesSubmit}>حفظ المحضر</Button>
            <Button variant="outline" onClick={() => setMinutesOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
