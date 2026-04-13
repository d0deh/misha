'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, Wrench } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBody,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderTitle,
} from '@/components/ui/page-header'
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
import {
  getOwnerById,
  getOwnerUnits,
  getPriorityLabel,
  getStatusLabel,
} from '@/lib/mock-data'
import { useAppData } from '@/lib/app-data-context'
import { useUser, canManageMaintenance } from '@/lib/user-context'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/relative-time'
import type { MaintenanceRequest } from '@/lib/types'
import { priorityStyles, statusStyles } from './_constants'
import { CreateRequestDialog } from './create-request-dialog'
import { RequestDetailSheet } from './request-detail-sheet'

export default function MaintenancePage() {
  const { role, userId } = useUser()
  const appData = useAppData()
  const showManagement = canManageMaintenance(role)

  const isAdmin = ['chairman', 'vice_chairman'].includes(role)
  const isManager = role === 'manager'

  const [viewMode, setViewMode] = useState<'mine' | 'all'>(isAdmin || isManager ? 'all' : 'mine')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newDialogOpen, setNewDialogOpen] = useState(false)

  const { maintenanceRequests, units, ownershipLinks } = appData

  const userUnitIds = useMemo(() => {
    const userUnits = getOwnerUnits(userId, ownershipLinks, units)
    return new Set(userUnits.map((unit) => unit.id))
  }, [ownershipLinks, units, userId])

  const activeCount = maintenanceRequests.filter(
    (request) => request.status === 'new' || request.status === 'in_progress'
  ).length

  const filteredRequests = useMemo(() => {
    let base: MaintenanceRequest[]

    if (viewMode === 'mine') {
      base = maintenanceRequests.filter((request) => request.requesterId === userId)
    } else if (showManagement) {
      base = maintenanceRequests
    } else {
      base = maintenanceRequests.filter(
        (request) =>
          request.type === 'general' ||
          request.requesterId === userId ||
          (request.unitId !== undefined && userUnitIds.has(request.unitId))
      )
    }

    return base.filter((request) => {
      const matchesSearch = search === '' || request.title.includes(search)
      const matchesStatus =
        !statusFilter || statusFilter === 'all' || request.status === statusFilter
      const matchesPriority =
        !priorityFilter || priorityFilter === 'all' || request.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [
    maintenanceRequests,
    priorityFilter,
    search,
    showManagement,
    statusFilter,
    userId,
    userUnitIds,
    viewMode,
  ])

  function handleRowClick(request: MaintenanceRequest) {
    setSelectedRequestId(request.id)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader>
        <PageHeaderBody>
          <PageHeaderEyebrow>مركز الصيانة</PageHeaderEyebrow>
          <PageHeaderTitle>الصيانة</PageHeaderTitle>
          <PageHeaderDescription>
            {activeCount} طلب نشط من أصل {maintenanceRequests.length}
          </PageHeaderDescription>
        </PageHeaderBody>
        <PageHeaderActions>
          <Button size="sm" onClick={() => setNewDialogOpen(true)}>
            <Plus className="h-4 w-4" data-icon="inline-start" />
            طلب صيانة جديد
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="flex w-fit items-center gap-1 rounded-xl border border-border/80 bg-muted/55 p-1">
        <button
          onClick={() => setViewMode('mine')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            viewMode === 'mine'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          طلباتي
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            viewMode === 'all'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          كل الطلبات
        </button>
      </div>

      <div className="page-shell p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بعنوان الطلب..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? '')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="new">جديد</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value ?? '')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="كل الأولويات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأولويات</SelectItem>
              <SelectItem value="urgent">عاجلة</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter chips */}
      {((statusFilter && statusFilter !== 'all') || (priorityFilter && priorityFilter !== 'all')) && (
        <div className="flex flex-wrap gap-2">
          {statusFilter && statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('')}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-sm text-primary transition-colors hover:bg-primary/15"
            >
              {getStatusLabel(statusFilter)}
              <span className="text-xs">✕</span>
            </button>
          )}
          {priorityFilter && priorityFilter !== 'all' && (
            <button
              onClick={() => setPriorityFilter('')}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-sm text-primary transition-colors hover:bg-primary/15"
            >
              {getPriorityLabel(priorityFilter)}
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {filteredRequests.length === 0 ? (
          <div className="page-shell px-4 py-8 text-center">
            <Wrench className="mx-auto mb-3 h-12 w-12 text-muted-foreground/45" />
            <p className="text-base font-medium text-foreground">لا توجد طلبات صيانة مطابقة</p>
            <p className="mt-1 text-sm text-muted-foreground">حاول تغيير معايير البحث أو الفلاتر</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const requester = getOwnerById(request.requesterId, appData.owners)
            const priorityStyle = priorityStyles[request.priority]
            const statusStyle = statusStyles[request.status]
            return (
              <button
                key={request.id}
                onClick={() => handleRowClick(request)}
                className="page-shell w-full p-4 text-start transition-colors hover:bg-primary/4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{request.title}</p>
                  <span className={cn('status-pill shrink-0', statusStyle.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={cn('status-pill', priorityStyle.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', priorityStyle.dot)} />
                    {getPriorityLabel(request.priority)}
                  </span>
                  {request.requesterId === userId && (
                    <span className="text-xs font-medium text-primary">طلبك</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{requester?.fullName.split(' ').slice(0, 2).join(' ') || '—'}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(request.createdAt)}</span>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Desktop table view */}
      <div className="data-table-shell hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/45 hover:bg-muted/45">
              <TableHead>العنوان</TableHead>
              <TableHead className="hidden md:table-cell">النوع</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="hidden md:table-cell">مقدم الطلب</TableHead>
              <TableHead className="hidden md:table-cell">التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center align-middle">
                  <Wrench className="mx-auto mb-3 h-12 w-12 text-muted-foreground/45" />
                  <p className="text-base font-medium text-foreground">لا توجد طلبات صيانة مطابقة</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    حاول تغيير معايير البحث أو الفلاتر
                  </p>
                  <button
                    onClick={() => setNewDialogOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/8 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                  >
                    <Plus className="h-4 w-4" />
                    طلب صيانة جديد
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => {
                const requester = getOwnerById(request.requesterId, appData.owners)
                const priorityStyle = priorityStyles[request.priority]
                const statusStyle = statusStyles[request.status]

                return (
                  <TableRow
                    key={request.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(request)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleRowClick(request)
                      }
                    }}
                    className="h-12 cursor-pointer hover:bg-primary/6"
                  >
                    <TableCell className="max-w-48 truncate text-sm font-medium text-foreground">
                      {request.title}
                      {request.requesterId === userId && (
                        <span className="ms-1 text-xs text-primary">· طلبك</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {request.type === 'general' ? 'عام' : 'خاص'}
                    </TableCell>
                    <TableCell>
                      <span className={cn('status-pill', priorityStyle.badge)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', priorityStyle.dot)} />
                        {getPriorityLabel(request.priority)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('status-pill', statusStyle.badge)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
                        {getStatusLabel(request.status)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm text-foreground/85 md:table-cell">
                      {requester?.fullName.split(' ').slice(0, 2).join(' ') || '—'}
                    </TableCell>
                    <TableCell className="hidden text-sm tabular-nums text-muted-foreground md:table-cell">
                      {new Date(request.createdAt).toLocaleDateString('ar-SA', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        عرض {filteredRequests.length} من {maintenanceRequests.length} طلب
      </p>

      <RequestDetailSheet
        requestId={selectedRequestId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <CreateRequestDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />
    </div>
  )
}
