'use client'

import { useState, useMemo } from 'react'
import { Search, Phone, Mail, Building2, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PermissionButton } from '@/components/ui/permission-button'
import { useAppData } from '@/lib/app-data-context'
import { useToast } from '@/lib/use-toast'
import { canManageAssociation, canSeeContactDetails } from '@/lib/user-context'
import {
  getUnitOwner,
  getOwnerRole,
  getOwnerUnits,
  getStatusLabel,
  getRoleLabel,
  getUserUnitIds,
} from '@/lib/mock-data'
import { useUser } from '@/lib/user-context'
import type { Unit } from '@/lib/types'
import { cn } from '@/lib/utils'
import { DetailSection, DetailRow } from '@/components/ui/detail-section'

const statusStyles: Record<string, { dot: string; badge: string }> = {
  'owner-occupied': {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  occupied: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  vacant: {
    dot: 'bg-stone-400',
    badge: 'bg-stone-100 text-stone-600 border-stone-200',
  },
}

export default function UnitsPage() {
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const { userId, role } = useUser()
  const { building, updateBuilding, units, ownershipLinks, owners, associationRoles } = useAppData()
  const { toast } = useToast()
  const myUnitIds = getUserUnitIds(userId, ownershipLinks)
  const canEdit = canManageAssociation(role)

  // Edit building dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(building.name)
  const [editAddress, setEditAddress] = useState(building.nationalAddress)
  const [editArea, setEditArea] = useState(String(building.totalArea))
  const [editCommonAreas, setEditCommonAreas] = useState(building.commonAreas.join('، '))

  function handleEditSubmit() {
    updateBuilding(
      {
        name: editName.trim(),
        nationalAddress: editAddress.trim(),
        totalArea: Number(editArea) || building.totalArea,
        commonAreas: editCommonAreas.split('،').map((s) => s.trim()).filter(Boolean),
      },
      userId
    )
    toast('تم تحديث بيانات المبنى ✓')
    setEditOpen(false)
  }

  const floors = Array.from(new Set(units.map((u) => u.floor))).sort((a, b) => a - b)
  const occupiedCount = units.filter((u) => u.occupancyStatus !== 'vacant').length
  const occupancyRate = Math.round((occupiedCount / units.length) * 100)

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const owner = getUnitOwner(unit.id, ownershipLinks, owners)
      const matchesSearch =
        search === '' ||
        unit.unitNumber.includes(search) ||
        (owner?.fullName || '').includes(search)
      const matchesFloor =
        !floorFilter || floorFilter === 'all' || unit.floor === Number(floorFilter)
      const matchesStatus =
        !statusFilter || statusFilter === 'all' || unit.occupancyStatus === statusFilter
      return matchesSearch && matchesFloor && matchesStatus
    })
  }, [search, floorFilter, statusFilter, units, ownershipLinks, owners])

  function handleRowClick(unit: Unit) {
    setSelectedUnit(unit)
    setSheetOpen(true)
  }

  const selectedOwner = selectedUnit ? getUnitOwner(selectedUnit.id, ownershipLinks, owners) : undefined
  const selectedOwnerRole = selectedOwner
    ? getOwnerRole(selectedOwner.id, associationRoles)
    : undefined
  const selectedOwnerUnits = selectedOwner
    ? getOwnerUnits(selectedOwner.id, ownershipLinks, units)
    : []
  const selectedLink = selectedUnit
    ? ownershipLinks.find((l) => l.unitId === selectedUnit.id)
    : undefined

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <PermissionButton
          hasPermission={canEdit}
          tooltipText="فقط رئيس الجمعية يمكنه التعديل"
          variant="outline"
          size="sm"
          onClick={() => {
            setEditName(building.name)
            setEditAddress(building.nationalAddress)
            setEditArea(String(building.totalArea))
            setEditCommonAreas(building.commonAreas.join('، '))
            setEditOpen(true)
          }}
        >
          <Pencil className="h-4 w-4" />
          تعديل بيانات المبنى
        </PermissionButton>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">المبنى والوحدات</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {building.name} · {building.nationalAddress} · {building.unitCount}{' '}
            وحدة · الإشغال {occupancyRate}٪
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
          <Input
            placeholder="بحث برقم الوحدة أو اسم المالك..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 border-stone-200 focus-visible:ring-teal-500"
          />
        </div>
        <Select value={floorFilter} onValueChange={(v) => setFloorFilter(v ?? '')} items={{ all: 'الكل', ...Object.fromEntries(floors.map((f) => [String(f), `الطابق ${f}`])) }}>
          <SelectTrigger className="w-full sm:w-40 border-stone-200 focus:ring-teal-500">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {floors.map((f) => (
              <SelectItem key={f} value={String(f)}>
                الطابق {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')} items={{ all: 'الكل', 'owner-occupied': 'مالك مقيم', occupied: 'مؤجرة', vacant: 'شاغرة' }}>
          <SelectTrigger className="w-full sm:w-40 border-stone-200 focus:ring-teal-500">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="owner-occupied">مالك مقيم</SelectItem>
            <SelectItem value="occupied">مؤجرة</SelectItem>
            <SelectItem value="vacant">شاغرة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-100 hover:bg-stone-100">
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                رقم الوحدة
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">
                الطابق
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">
                المساحة
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                المالك
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                الحالة
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center align-middle"
                >
                  <Building2 className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-stone-700">
                    لا توجد وحدات مطابقة للبحث
                  </p>
                  <p className="text-sm text-stone-600 mt-1">
                    حاول تغيير معايير البحث أو الفلاتر
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUnits.map((unit) => {
                const owner = getUnitOwner(unit.id, ownershipLinks, owners)
                const style = statusStyles[unit.occupancyStatus]
                const isMine = myUnitIds.includes(unit.id)
                return (
                  <TableRow
                    key={unit.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(unit)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick(unit) } }}
                    className={cn(
                      'cursor-pointer hover:bg-teal-50/30 h-12 border-b border-stone-100',
                      isMine && 'bg-teal-50/40'
                    )}
                  >
                    <TableCell className="font-semibold tabular-nums text-stone-900">
                      {unit.unitNumber}
                      {isMine && (
                        <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded px-1.5 py-0.5 ms-2">وحدتك</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm text-stone-600 hidden md:table-cell">
                      {unit.floor}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm text-stone-600 hidden md:table-cell">
                      {unit.area} م²
                    </TableCell>
                    <TableCell className="text-sm text-stone-700">
                      {owner?.fullName || '—'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                          style.badge
                        )}
                      >
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full', style.dot)}
                        />
                        {getStatusLabel(unit.occupancyStatus)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-stone-600">
        عرض {filteredUnits.length} من {units.length} وحدة
      </p>

      {/* Unit detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-hidden p-0">
          {selectedUnit && (
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                <div className="bg-teal-800 p-5 pe-12 text-white">
                  <SheetHeader className="p-0">
                    <SheetDescription className="text-teal-300 text-xs">
                      بيان الوحدة
                    </SheetDescription>
                    <SheetTitle className="text-white text-lg font-bold">
                      الوحدة {selectedUnit.unitNumber}
                    </SheetTitle>
                  </SheetHeader>
                  <p className="text-sm text-white/70 mt-1">
                    {getStatusLabel(selectedUnit.occupancyStatus)} — الطابق{' '}
                    {selectedUnit.floor}
                  </p>
                </div>

                <div className="p-5 space-y-5">
                  <DetailSection title="بيانات الوحدة">
                    <DetailRow
                      label="المساحة"
                      value={`${selectedUnit.area} م²`}
                    />
                    <DetailRow
                      label="حصة الملكية"
                      value={`${selectedUnit.ownershipSharePercentage}٪`}
                    />
                    <DetailRow
                      label="حالة الإشغال"
                      value={getStatusLabel(selectedUnit.occupancyStatus)}
                    />
                    {myUnitIds.includes(selectedUnit.id) && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700"><span className="h-1.5 w-1.5 rounded-full bg-teal-500" />أنت مالك هذه الوحدة</span>
                    )}
                    {selectedUnit.notes && (
                      <DetailRow label="ملاحظات" value={selectedUnit.notes} />
                    )}
                  </DetailSection>

                  {selectedOwner && (
                    <>
                      <Separator className="bg-stone-100" />
                      <DetailSection title="المالك">
                        <DetailRow
                          label="الاسم"
                          value={selectedOwner.fullName}
                        />
                        {canSeeContactDetails(role) && (
                          <>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                              <span className="text-sm text-stone-700" dir="ltr">
                                {selectedOwner.phone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                              <span className="text-sm text-stone-700" dir="ltr">
                                {selectedOwner.email}
                              </span>
                            </div>
                          </>
                        )}
                        {selectedOwnerRole && (
                          <DetailRow
                            label="الدور"
                            value={getRoleLabel(selectedOwnerRole.role)}
                          />
                        )}
                        {selectedLink?.isPrimaryRepresentative && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            ممثل رئيسي
                          </span>
                        )}
                      </DetailSection>
                    </>
                  )}

                  {selectedOwnerUnits.length > 1 && selectedOwner && (
                    <>
                      <Separator className="bg-stone-100" />
                      <DetailSection title="وحدات أخرى للمالك">
                        <div className="flex flex-wrap gap-2">
                          {selectedOwnerUnits
                            .filter((u) => u.id !== selectedUnit.id)
                            .map((u) => {
                              const uStyle = statusStyles[u.occupancyStatus]
                              return (
                                <button
                                  key={u.id}
                                  onClick={() => setSelectedUnit(u)}
                                  className={cn(
                                    'rounded-lg border px-3.5 py-2 text-sm font-bold tabular-nums transition-colors',
                                    'hover:ring-2 hover:ring-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                                    uStyle.badge
                                  )}
                                >
                                  {u.unitNumber}
                                </button>
                              )
                            })}
                        </div>
                      </DetailSection>
                    </>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit building dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المبنى</DialogTitle>
            <DialogDescription>حدّث المعلومات الأساسية للمبنى</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>اسم المبنى</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="border-stone-200 focus-visible:ring-teal-500" />
            </div>
            <div className="space-y-1.5">
              <Label>العنوان الوطني</Label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="border-stone-200 focus-visible:ring-teal-500" />
            </div>
            <div className="space-y-1.5">
              <Label>المساحة الإجمالية (م²)</Label>
              <Input type="number" value={editArea} onChange={(e) => setEditArea(e.target.value)} className="border-stone-200 focus-visible:ring-teal-500" />
            </div>
            <div className="space-y-1.5">
              <Label>المرافق المشتركة (مفصولة بفاصلة)</Label>
              <Textarea value={editCommonAreas} onChange={(e) => setEditCommonAreas(e.target.value)} rows={3} className="border-stone-200 focus-visible:ring-teal-500" />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleEditSubmit}>حفظ التغييرات</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

