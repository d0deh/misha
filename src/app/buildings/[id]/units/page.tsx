'use client'

import { useMemo, useState } from 'react'
import { LayoutGrid, Mail, Pencil, Phone, Search } from 'lucide-react'
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useAppData } from '@/lib/app-data-context'
import { useToast } from '@/lib/use-toast'
import { canManageAssociation, canSeeContactDetails, useUser } from '@/lib/user-context'
import { unitStatusFilterItems } from '@/lib/labels'
import {
  getOwnerRole,
  getOwnerUnits,
  getRoleLabel,
  getStatusLabel,
  getUnitOwner,
  getUserUnitIds,
} from '@/lib/mock-data'
import type { Unit } from '@/lib/types'
import { cn } from '@/lib/utils'
import { DetailRow, DetailSection } from '@/components/ui/detail-section'

const statusStyles: Record<string, { dot: string; badge: string }> = {
  'owner-occupied': {
    dot: 'bg-success',
    badge: 'border-success/20 bg-success/10 text-success',
  },
  occupied: {
    dot: 'bg-warning',
    badge: 'border-warning/20 bg-warning/10 text-warning',
  },
  vacant: {
    dot: 'bg-muted-foreground',
    badge: 'border-border bg-muted text-muted-foreground',
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
        commonAreas: editCommonAreas
          .split('،')
          .map((value) => value.trim())
          .filter(Boolean),
      },
      userId
    )
    toast('تم تحديث بيانات المبنى')
    setEditOpen(false)
  }

  const floors = useMemo(
    () => Array.from(new Set(units.map((unit) => unit.floor))).sort((a, b) => a - b),
    [units]
  )
  const floorFilterItems = useMemo(
    () => ({
      all: 'كل الطوابق',
      ...Object.fromEntries(floors.map((floor) => [String(floor), `الطابق ${floor}`])),
    }),
    [floors]
  )
  const occupiedCount = units.filter((unit) => unit.occupancyStatus !== 'vacant').length
  const occupancyRate = Math.round((occupiedCount / units.length) * 100)

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const owner = getUnitOwner(unit.id, ownershipLinks, owners)
      const matchesSearch =
        search === '' ||
        unit.unitNumber.includes(search) ||
        (owner?.fullName || '').includes(search)
      const matchesFloor = !floorFilter || floorFilter === 'all' || unit.floor === Number(floorFilter)
      const matchesStatus =
        !statusFilter || statusFilter === 'all' || unit.occupancyStatus === statusFilter
      return matchesSearch && matchesFloor && matchesStatus
    })
  }, [floorFilter, owners, ownershipLinks, search, statusFilter, units])

  function handleRowClick(unit: Unit) {
    setSelectedUnit(unit)
    setSheetOpen(true)
  }

  const selectedOwner = selectedUnit ? getUnitOwner(selectedUnit.id, ownershipLinks, owners) : undefined
  const selectedOwnerRole = selectedOwner
    ? getOwnerRole(selectedOwner.id, associationRoles)
    : undefined
  const selectedOwnerUnits = selectedOwner ? getOwnerUnits(selectedOwner.id, ownershipLinks, units) : []
  const selectedLink = selectedUnit
    ? ownershipLinks.find((link) => link.unitId === selectedUnit.id)
    : undefined

  return (
    <div className="space-y-5">
      <PageHeader>
        <PageHeaderBody>
          <PageHeaderEyebrow>بيانات المبنى</PageHeaderEyebrow>
          <PageHeaderTitle>المبنى والوحدات</PageHeaderTitle>
          <PageHeaderDescription>
            {building.name} · {building.nationalAddress} · {building.unitCount} وحدة · الإشغال{' '}
            {occupancyRate}٪
          </PageHeaderDescription>
        </PageHeaderBody>
        <PageHeaderActions>
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
            <Pencil className="h-4 w-4" data-icon="inline-start" />
            تعديل بيانات المبنى
          </PermissionButton>
        </PageHeaderActions>
      </PageHeader>

      <div className="page-shell p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الوحدة أو اسم المالك..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="ps-9"
            />
          </div>
          <Select
            value={floorFilter}
            onValueChange={(value) => setFloorFilter(value ?? '')}
            items={floorFilterItems}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="كل الطوابق" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الطوابق</SelectItem>
              {floors.map((floor) => (
                <SelectItem key={floor} value={String(floor)}>
                  الطابق {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? '')}
            items={unitStatusFilterItems}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="owner-occupied">مالك مقيم</SelectItem>
              <SelectItem value="occupied">مؤجرة</SelectItem>
              <SelectItem value="vacant">شاغرة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="data-table-shell">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/45 hover:bg-muted/45">
              <TableHead>رقم الوحدة</TableHead>
              <TableHead className="hidden md:table-cell">الطابق</TableHead>
              <TableHead className="hidden md:table-cell">المساحة</TableHead>
              <TableHead>المالك</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center align-middle">
                  <LayoutGrid className="mx-auto mb-3 h-12 w-12 text-muted-foreground/45" />
                  <p className="text-base font-medium text-foreground">لا توجد وحدات مطابقة للبحث</p>
                  <p className="mt-1 text-sm text-muted-foreground">
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
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleRowClick(unit)
                      }
                    }}
                    className={cn('h-12 cursor-pointer hover:bg-primary/6', isMine && 'bg-primary/6')}
                  >
                    <TableCell className="font-semibold tabular-nums text-foreground">
                      {unit.unitNumber}
                      {isMine && (
                        <span className="ms-2 rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          وحدتك
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden tabular-nums text-sm text-muted-foreground md:table-cell">
                      {unit.floor}
                    </TableCell>
                    <TableCell className="hidden tabular-nums text-sm text-muted-foreground md:table-cell">
                      {unit.area} م²
                    </TableCell>
                    <TableCell className="text-sm text-foreground/85">
                      {owner?.fullName || '—'}
                    </TableCell>
                    <TableCell>
                      <span className={cn('status-pill', style.badge)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
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

      <p className="text-sm text-muted-foreground">
        عرض {filteredUnits.length} من {units.length} وحدة
      </p>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full overflow-hidden p-0 sm:max-w-md">
          {selectedUnit && (
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                <div className="bg-shell p-5 pe-12 text-shell-foreground">
                  <SheetHeader className="p-0">
                    <SheetDescription className="text-shell-muted">بيان الوحدة</SheetDescription>
                    <SheetTitle className="text-lg font-semibold text-shell-foreground">
                      الوحدة {selectedUnit.unitNumber}
                    </SheetTitle>
                  </SheetHeader>
                  <p className="mt-1 text-sm text-shell-muted">
                    {getStatusLabel(selectedUnit.occupancyStatus)} · الطابق {selectedUnit.floor}
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <DetailSection title="بيانات الوحدة">
                    <DetailRow label="المساحة" value={`${selectedUnit.area} م²`} />
                    <DetailRow
                      label="حصة الملكية"
                      value={`${selectedUnit.ownershipSharePercentage}٪`}
                    />
                    <DetailRow
                      label="حالة الإشغال"
                      value={getStatusLabel(selectedUnit.occupancyStatus)}
                    />
                    {myUnitIds.includes(selectedUnit.id) && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        أنت مالك هذه الوحدة
                      </span>
                    )}
                    {selectedUnit.notes && <DetailRow label="ملاحظات" value={selectedUnit.notes} />}
                  </DetailSection>

                  {selectedOwner && (
                    <>
                      <Separator className="bg-border" />
                      <DetailSection title="المالك">
                        <DetailRow label="الاسم" value={selectedOwner.fullName} />
                        {canSeeContactDetails(role) && (
                          <>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-sm text-foreground/85" dir="ltr">
                                {selectedOwner.phone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-sm text-foreground/85" dir="ltr">
                                {selectedOwner.email}
                              </span>
                            </div>
                          </>
                        )}
                        {selectedOwnerRole && (
                          <DetailRow label="الدور" value={getRoleLabel(selectedOwnerRole.role)} />
                        )}
                        {selectedLink?.isPrimaryRepresentative && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            ممثل رئيسي
                          </span>
                        )}
                      </DetailSection>
                    </>
                  )}

                  {selectedOwnerUnits.length > 1 && selectedOwner && (
                    <>
                      <Separator className="bg-border" />
                      <DetailSection title="وحدات أخرى للمالك">
                        <div className="flex flex-wrap gap-2">
                          {selectedOwnerUnits
                            .filter((unit) => unit.id !== selectedUnit.id)
                            .map((unit) => {
                              const style = statusStyles[unit.occupancyStatus]
                              return (
                                <button
                                  key={unit.id}
                                  onClick={() => setSelectedUnit(unit)}
                                  className={cn(
                                    'rounded-xl border px-3.5 py-2 text-sm font-semibold tabular-nums transition-colors hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    style.badge
                                  )}
                                >
                                  {unit.unitNumber}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المبنى</DialogTitle>
            <DialogDescription>حدّث المعلومات الأساسية للمبنى</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>اسم المبنى</Label>
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>العنوان الوطني</Label>
              <Input value={editAddress} onChange={(event) => setEditAddress(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>المساحة الإجمالية (م²)</Label>
              <Input type="number" value={editArea} onChange={(event) => setEditArea(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>المرافق المشتركة</Label>
              <Textarea
                rows={3}
                value={editCommonAreas}
                onChange={(event) => setEditCommonAreas(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSubmit}>حفظ التغييرات</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
