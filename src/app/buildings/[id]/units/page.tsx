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
  const [editCommonAreas, setEditCommonAreas] = useState(building.commonAreas.join('ØŒ '))

  function handleEditSubmit() {
    updateBuilding(
      {
        name: editName.trim(),
        nationalAddress: editAddress.trim(),
        totalArea: Number(editArea) || building.totalArea,
        commonAreas: editCommonAreas
          .split('ØŒ')
          .map((value) => value.trim())
          .filter(Boolean),
      },
      userId
    )
    toast('ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¨Ù†Ù‰')
    setEditOpen(false)
  }

  const floors = Array.from(new Set(units.map((unit) => unit.floor))).sort((a, b) => a - b)
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
          <PageHeaderEyebrow>Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¨Ù†Ù‰</PageHeaderEyebrow>
          <PageHeaderTitle>Ø§Ù„Ù…Ø¨Ù†Ù‰ ÙˆØ§Ù„ÙˆØ­Ø¯Ø§Øª</PageHeaderTitle>
          <PageHeaderDescription>
            {building.name} Â· {building.nationalAddress} Â· {building.unitCount} ÙˆØ­Ø¯Ø© Â· Ø§Ù„Ø¥Ø´ØºØ§Ù„{' '}
            {occupancyRate}Ùª
          </PageHeaderDescription>
        </PageHeaderBody>
        <PageHeaderActions>
          <PermissionButton
            hasPermission={canEdit}
            tooltipText="ÙÙ‚Ø· Ø±Ø¦ÙŠØ³ Ø§Ù„Ø¬Ù…Ø¹ÙŠØ© ÙŠÙ…ÙƒÙ†Ù‡ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(building.name)
              setEditAddress(building.nationalAddress)
              setEditArea(String(building.totalArea))
              setEditCommonAreas(building.commonAreas.join('ØŒ '))
              setEditOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" data-icon="inline-start" />
            ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¨Ù†Ù‰
          </PermissionButton>
        </PageHeaderActions>
      </PageHeader>

      <div className="page-shell p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Ø¨Ø­Ø« Ø¨Ø±Ù‚Ù… Ø§Ù„ÙˆØ­Ø¯Ø© Ø£Ùˆ Ø§Ø³Ù… Ø§Ù„Ù…Ø§Ù„Ùƒ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={floorFilter} onValueChange={(value) => setFloorFilter(value ?? '')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="ÙƒÙ„ Ø§Ù„Ø·ÙˆØ§Ø¨Ù‚" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ÙƒÙ„ Ø§Ù„Ø·ÙˆØ§Ø¨Ù‚</SelectItem>
              {floors.map((floor) => (
                <SelectItem key={floor} value={String(floor)}>
                  Ø§Ù„Ø·Ø§Ø¨Ù‚ {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? '')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="ÙƒÙ„ Ø§Ù„Ø­Ø§Ù„Ø§Øª" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ÙƒÙ„ Ø§Ù„Ø­Ø§Ù„Ø§Øª</SelectItem>
              <SelectItem value="owner-occupied">Ù…Ø§Ù„Ùƒ Ù…Ù‚ÙŠÙ…</SelectItem>
              <SelectItem value="occupied">Ù…Ø¤Ø¬Ø±Ø©</SelectItem>
              <SelectItem value="vacant">Ø´Ø§ØºØ±Ø©</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="data-table-shell">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/45 hover:bg-muted/45">
              <TableHead>Ø±Ù‚Ù… Ø§Ù„ÙˆØ­Ø¯Ø©</TableHead>
              <TableHead className="hidden md:table-cell">Ø§Ù„Ø·Ø§Ø¨Ù‚</TableHead>
              <TableHead className="hidden md:table-cell">Ø§Ù„Ù…Ø³Ø§Ø­Ø©</TableHead>
              <TableHead>Ø§Ù„Ù…Ø§Ù„Ùƒ</TableHead>
              <TableHead>Ø§Ù„Ø­Ø§Ù„Ø©</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center align-middle">
                  <LayoutGrid className="mx-auto mb-3 h-12 w-12 text-muted-foreground/45" />
                  <p className="text-base font-medium text-foreground">Ù„Ø§ ØªÙˆØ¬Ø¯ ÙˆØ­Ø¯Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ø­Ø§ÙˆÙ„ ØªØºÙŠÙŠØ± Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¨Ø­Ø« Ø£Ùˆ Ø§Ù„ÙÙ„Ø§ØªØ±
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
                    <TableCell className="font-medium tabular-nums text-foreground">
                      {unit.unitNumber}
                      {isMine && (
                        <span className="ms-2 rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          ÙˆØ­Ø¯ØªÙƒ
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden tabular-nums text-sm text-muted-foreground md:table-cell">
                      {unit.floor}
                    </TableCell>
                    <TableCell className="hidden tabular-nums text-sm text-muted-foreground md:table-cell">
                      {unit.area} Ù…Â²
                    </TableCell>
                    <TableCell className="text-sm text-foreground/85">
                      {owner?.fullName || 'â€”'}
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
        Ø¹Ø±Ø¶ {filteredUnits.length} Ù…Ù† {units.length} ÙˆØ­Ø¯Ø©
      </p>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full overflow-hidden p-0 sm:max-w-md">
          {selectedUnit && (
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                <div className="bg-shell p-5 pe-12 text-shell-foreground">
                  <SheetHeader className="p-0">
                    <SheetDescription className="text-shell-muted">Ø¨ÙŠØ§Ù† Ø§Ù„ÙˆØ­Ø¯Ø©</SheetDescription>
                    <SheetTitle className="text-lg font-medium text-shell-foreground">
                      Ø§Ù„ÙˆØ­Ø¯Ø© {selectedUnit.unitNumber}
                    </SheetTitle>
                  </SheetHeader>
                  <p className="mt-1 text-sm text-shell-muted">
                    {getStatusLabel(selectedUnit.occupancyStatus)} Â· Ø§Ù„Ø·Ø§Ø¨Ù‚ {selectedUnit.floor}
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <DetailSection title="Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙˆØ­Ø¯Ø©">
                    <DetailRow label="Ø§Ù„Ù…Ø³Ø§Ø­Ø©" value={`${selectedUnit.area} Ù…Â²`} />
                    <DetailRow
                      label="Ø­ØµØ© Ø§Ù„Ù…Ù„ÙƒÙŠØ©"
                      value={`${selectedUnit.ownershipSharePercentage}Ùª`}
                    />
                    <DetailRow
                      label="Ø­Ø§Ù„Ø© Ø§Ù„Ø¥Ø´ØºØ§Ù„"
                      value={getStatusLabel(selectedUnit.occupancyStatus)}
                    />
                    {myUnitIds.includes(selectedUnit.id) && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Ø£Ù†Øª Ù…Ø§Ù„Ùƒ Ù‡Ø°Ù‡ Ø§Ù„ÙˆØ­Ø¯Ø©
                      </span>
                    )}
                    {selectedUnit.notes && <DetailRow label="Ù…Ù„Ø§Ø­Ø¸Ø§Øª" value={selectedUnit.notes} />}
                  </DetailSection>

                  {selectedOwner && (
                    <>
                      <Separator className="bg-border" />
                      <DetailSection title="Ø§Ù„Ù…Ø§Ù„Ùƒ">
                        <DetailRow label="Ø§Ù„Ø§Ø³Ù…" value={selectedOwner.fullName} />
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
                          <DetailRow label="Ø§Ù„Ø¯ÙˆØ±" value={getRoleLabel(selectedOwnerRole.role)} />
                        )}
                        {selectedLink?.isPrimaryRepresentative && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            Ù…Ù…Ø«Ù„ Ø±Ø¦ÙŠØ³ÙŠ
                          </span>
                        )}
                      </DetailSection>
                    </>
                  )}

                  {selectedOwnerUnits.length > 1 && selectedOwner && (
                    <>
                      <Separator className="bg-border" />
                      <DetailSection title="ÙˆØ­Ø¯Ø§Øª Ø£Ø®Ø±Ù‰ Ù„Ù„Ù…Ø§Ù„Ùƒ">
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
                                    'rounded-xl border px-3.5 py-2 text-sm font-medium tabular-nums transition-colors hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
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
            <DialogTitle>ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¨Ù†Ù‰</DialogTitle>
            <DialogDescription>Ø­Ø¯Ù‘Ø« Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© Ù„Ù„Ù…Ø¨Ù†Ù‰</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Ø§Ø³Ù… Ø§Ù„Ù…Ø¨Ù†Ù‰</Label>
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ÙˆØ·Ù†ÙŠ</Label>
              <Input value={editAddress} onChange={(event) => setEditAddress(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ø§Ù„Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© (Ù…Â²)</Label>
              <Input type="number" value={editArea} onChange={(event) => setEditArea(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ø§Ù„Ù…Ø±Ø§ÙÙ‚ Ø§Ù„Ù…Ø´ØªØ±ÙƒØ©</Label>
              <Textarea
                rows={3}
                value={editCommonAreas}
                onChange={(event) => setEditCommonAreas(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSubmit}>Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Ø¥Ù„ØºØ§Ø¡
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
