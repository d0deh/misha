'use client'

import { useState, useMemo } from 'react'
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PermissionButton } from '@/components/ui/permission-button'
import {
  getOwnerById,
  getOwnerUnits,
  getRoleLabel,
  getStatusLabel,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useUser, canSeeContactDetails, canSeeOwnersList, canManageAssociation } from '@/lib/user-context'
import { useAppData } from '@/lib/app-data-context'
import { useToast } from '@/lib/use-toast'

const roleBadgeStyles: Record<string, { dot: string; badge: string }> = {
  chairman: { dot: 'bg-teal-600', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  vice_chairman: { dot: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  board_member: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  manager: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  owner: { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  resident: { dot: 'bg-stone-300', badge: 'bg-stone-50 text-stone-600 border-stone-200' },
}

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  under_formation: 'bg-amber-50 text-amber-700 border-amber-200',
}
const statusDot: Record<string, string> = {
  active: 'bg-emerald-500',
  suspended: 'bg-red-500',
  under_formation: 'bg-amber-500',
}

const feeStatusStyles: Record<string, { dot: string; badge: string; label: string }> = {
  paid: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'مدفوع' },
  partial: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'جزئي' },
  unpaid: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'غير مدفوع' },
}

export default function AssociationPage() {
  const { role, userId } = useUser()
  const { owners, units, ownershipLinks, association, associationRoles, addDocument, fees } = useAppData()
  const { toast } = useToast()
  const showContacts = canSeeContactDetails(role)
  const showOwnersList = canSeeOwnersList(role)
  const isAdmin = ['chairman', 'vice_chairman'].includes(role)

  const boardRoles = associationRoles.filter((r) => r.role !== 'owner' && r.role !== 'resident')
  const boardCount = boardRoles.length

  const [ownerSearch, setOwnerSearch] = useState('')

  // Meeting minutes dialog
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
    toast('تم إنشاء محضر الاجتماع بنجاح ✓')
    setMinutesOpen(false)
    setMinutesDate('')
    setMinutesTitle('محضر اجتماع ')
    setMinutesSummary('')
  }

  // Fees data
  const feesData = useMemo(() => {
    const showAll = ['chairman', 'vice_chairman', 'manager'].includes(role)
    const relevantFees = showAll ? fees : fees.filter((f) => f.ownerId === userId)
    return relevantFees.map((fee) => {
      const owner = getOwnerById(fee.ownerId, owners)
      const ownerUnits = getOwnerUnits(fee.ownerId, ownershipLinks, units)
      return {
        ownerId: fee.ownerId,
        ownerName: owner?.fullName || '',
        unitNumbers: ownerUnits.map((u) => u.unitNumber).join('، '),
        amountDue: fee.annualAmount,
        amountPaid: fee.paidAmount,
        status: fee.status,
      }
    })
  }, [role, userId, fees, owners, ownershipLinks, units])

  const totalDue = feesData.reduce((s, f) => s + f.amountDue, 0)
  const totalCollected = feesData.reduce((s, f) => s + f.amountPaid, 0)
  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PermissionButton
          hasPermission={isAdmin}
          tooltipText="فقط رئيس الجمعية أو نائبه يمكنه إنشاء محاضر"
          size="sm"
          className="bg-teal-600 text-white hover:bg-teal-700"
          onClick={() => setMinutesOpen(true)}
        >
          <Plus className="h-4 w-4" />
          محضر اجتماع جديد
        </PermissionButton>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">الجمعية والأعضاء</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {association.name} · رقم التسجيل{' '}
            <span className="tabular-nums" dir="ltr">
              {association.registrationNumber}
            </span>
          </p>
        </div>
      </div>

      {/* Association info */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 border-s-[3px] border-s-teal-400">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-stone-900">{association.name}</p>
            <p className="text-sm text-stone-600 mt-0.5 tabular-nums" dir="ltr">
              {association.registrationNumber}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
              statusBadge[association.status]
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[association.status])} />
            {getStatusLabel(association.status)}
          </span>
        </div>
      </div>

      {/* Board members */}
      <div>
        <h2 className="text-sm font-semibold text-stone-600 mb-3">مجلس الإدارة</h2>
        <div className="rounded-lg border border-stone-200 bg-white divide-y divide-stone-100">
          {boardRoles.map((roleRecord) => {
            const owner = getOwnerById(roleRecord.userId, owners)
            if (!owner) return null
            const style = roleBadgeStyles[roleRecord.role] || roleBadgeStyles.owner
            return (
              <div key={roleRecord.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{owner.fullName}</p>
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium mt-1', style.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                    {getRoleLabel(roleRecord.role)}
                  </span>
                </div>
                {showContacts && (
                  <div className="flex items-center gap-1.5 text-stone-600 shrink-0">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-xs tabular-nums" dir="ltr">{owner.phone}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Owners table */}
      {showOwnersList && (
        <div>
          <h2 className="text-sm font-semibold text-stone-600 mb-3">الملاك</h2>
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
            <Input
              placeholder="بحث باسم المالك..."
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              className="ps-9 border-stone-200 focus-visible:ring-teal-500"
            />
          </div>
          <div className="rounded-lg border border-stone-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-100 hover:bg-stone-100">
                  <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">الاسم</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">الدور</TableHead>
                  {showContacts && (
                    <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">الهاتف</TableHead>
                  )}
                  <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">الوحدات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners
                  .filter((o) => ownerSearch === '' || o.fullName.includes(ownerSearch))
                  .map((owner) => {
                  const ownerRole = associationRoles.find((r) => r.userId === owner.id)
                  const unitCount = getOwnerUnits(owner.id, ownershipLinks, units).length
                  const isPrimary = ownershipLinks.some((l) => {
                    if (l.ownerId !== owner.id || !l.isPrimaryRepresentative) return false
                    return ownershipLinks.filter((ol) => ol.unitId === l.unitId).length > 1
                  })
                  const style = roleBadgeStyles[ownerRole?.role || 'owner']
                  return (
                    <TableRow key={owner.id} className="h-12 border-b border-stone-100">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stone-900">{owner.fullName}</span>
                          {isPrimary && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              ممثل
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium', style.badge)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                          {getRoleLabel(ownerRole?.role || 'owner')}
                        </span>
                      </TableCell>
                      {showContacts && (
                        <TableCell className="tabular-nums text-stone-600 hidden md:table-cell" dir="ltr">{owner.phone}</TableCell>
                      )}
                      <TableCell className="tabular-nums text-stone-600 hidden md:table-cell">{unitCount} وحدة</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Fees overview */}
      <div>
        <h2 className="text-sm font-semibold text-stone-600 mb-3">كشف الرسوم السنوية</h2>
        <div className="rounded-lg border border-stone-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-100 hover:bg-stone-100">
                <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">المالك</TableHead>
                <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">الوحدات</TableHead>
                <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">المطلوب</TableHead>
                <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">المدفوع</TableHead>
                <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesData.map((fee) => {
                const fStyle = feeStatusStyles[fee.status]
                return (
                  <TableRow key={fee.ownerId} className="h-12 border-b border-stone-100">
                    <TableCell className="text-sm font-medium text-stone-900">{fee.ownerName.split(' ').slice(0, 3).join(' ')}</TableCell>
                    <TableCell className="text-sm text-stone-600 hidden md:table-cell">{fee.unitNumbers}</TableCell>
                    <TableCell className="text-sm tabular-nums text-stone-700">{fee.amountDue.toLocaleString('ar-SA')} ر.س</TableCell>
                    <TableCell className="text-sm tabular-nums text-stone-700">{fee.amountPaid.toLocaleString('ar-SA')} ر.س</TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium', fStyle.badge)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', fStyle.dot)} />
                        {fStyle.label}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {['chairman', 'vice_chairman', 'manager'].includes(role) && (
          <>
            <div className="flex items-center gap-2 text-sm text-stone-600 mt-3">
              <span>الإجمالي المطلوب <span className="font-bold text-stone-900 tabular-nums">{totalDue.toLocaleString('ar-SA')} ر.س</span></span>
              <span className="text-stone-300">·</span>
              <span>المحصّل <span className="font-bold text-stone-900 tabular-nums">{totalCollected.toLocaleString('ar-SA')} ر.س</span></span>
              <span className="text-stone-300">·</span>
              <span>نسبة التحصيل <span className="font-bold text-stone-900 tabular-nums">{collectionRate}٪</span></span>
            </div>
            <div className="h-2 rounded-full bg-stone-100 overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-stone-600">
        {owners.length} مالك · {boardCount} أعضاء مجلس إدارة
      </p>

      {/* Meeting minutes dialog */}
      <Dialog open={minutesOpen} onOpenChange={setMinutesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>محضر اجتماع جديد</DialogTitle>
            <DialogDescription>سجّل محضر اجتماع الجمعية أو مجلس الإدارة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>تاريخ الاجتماع</Label>
              <Input
                type="date"
                value={minutesDate}
                onChange={(e) => setMinutesDate(e.target.value)}
                className="border-stone-200 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label>العنوان</Label>
              <Input
                value={minutesTitle}
                onChange={(e) => setMinutesTitle(e.target.value)}
                className="border-stone-200 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label>الملخص والقرارات</Label>
              <Textarea
                value={minutesSummary}
                onChange={(e) => setMinutesSummary(e.target.value)}
                placeholder="اكتب ملخص الاجتماع والقرارات المتخذة..."
                rows={5}
                className="border-stone-200 focus-visible:ring-teal-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleMinutesSubmit}>حفظ المحضر</Button>
            <Button variant="outline" onClick={() => setMinutesOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
