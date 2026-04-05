'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Wrench } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  getStatusLabel,
  getPriorityLabel,
  getOwnerUnits,
} from '@/lib/mock-data'
import { useAppData } from '@/lib/app-data-context'
import { useUser, canManageMaintenance } from '@/lib/user-context'
import { cn } from '@/lib/utils'
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
    return new Set(userUnits.map((u) => u.id))
  }, [userId, ownershipLinks, units])

  const activeCount = maintenanceRequests.filter(
    (r) => r.status === 'new' || r.status === 'in_progress'
  ).length

  const filteredRequests = useMemo(() => {
    let base: MaintenanceRequest[]
    if (viewMode === 'mine') {
      base = maintenanceRequests.filter((req) => req.requesterId === userId)
    } else if (showManagement) {
      base = maintenanceRequests
    } else {
      base = maintenanceRequests.filter(
        (req) =>
          req.type === 'general' ||
          req.requesterId === userId ||
          (req.unitId !== undefined && userUnitIds.has(req.unitId))
      )
    }

    return base.filter((req) => {
      const matchesSearch = search === '' || req.title.includes(search)
      const matchesStatus =
        !statusFilter || statusFilter === 'all' || req.status === statusFilter
      const matchesPriority =
        !priorityFilter || priorityFilter === 'all' || req.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [search, statusFilter, priorityFilter, viewMode, userId, maintenanceRequests, showManagement, userUnitIds])

  function handleRowClick(req: MaintenanceRequest) {
    setSelectedRequestId(req.id)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button
          size="sm"
          onClick={() => setNewDialogOpen(true)}
          className="bg-teal-700 text-white hover:bg-teal-800"
        >
          <Plus className="h-4 w-4" />
          طلب صيانة جديد
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">الصيانة</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {activeCount} طلب نشط من أصل {maintenanceRequests.length}
          </p>
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-0.5 w-fit">
        <button
          onClick={() => setViewMode('mine')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            viewMode === 'mine'
              ? 'bg-white text-stone-900'
              : 'text-stone-600 hover:text-stone-900'
          )}
        >
          طلباتي
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            viewMode === 'all'
              ? 'bg-white text-stone-900'
              : 'text-stone-600 hover:text-stone-900'
          )}
        >
          كل الطلبات
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
          <Input
            placeholder="بحث بعنوان الطلب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 border-stone-200 focus-visible:ring-teal-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')} items={{ all: 'الكل', new: 'جديد', in_progress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي' }}>
          <SelectTrigger className="w-full sm:w-40 border-stone-200 focus:ring-teal-500">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="new">جديد</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? '')} items={{ all: 'الكل', urgent: 'عاجلة', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }}>
          <SelectTrigger className="w-full sm:w-40 border-stone-200 focus:ring-teal-500">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="urgent">عاجلة</SelectItem>
            <SelectItem value="high">عالية</SelectItem>
            <SelectItem value="medium">متوسطة</SelectItem>
            <SelectItem value="low">منخفضة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-100 hover:bg-stone-100">
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                العنوان
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">
                النوع
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                الأولوية
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                الحالة
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">
                مقدم الطلب
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">
                التاريخ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center align-middle">
                  <Wrench className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-stone-700">
                    لا توجد طلبات صيانة مطابقة
                  </p>
                  <p className="text-sm text-stone-600 mt-1">
                    حاول تغيير معايير البحث أو الفلاتر
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => {
                const requester = getOwnerById(req.requesterId, appData.owners)
                const pStyle = priorityStyles[req.priority]
                const sStyle = statusStyles[req.status]
                return (
                  <TableRow
                    key={req.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(req)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick(req) } }}
                    className="cursor-pointer hover:bg-teal-50/30 h-12 border-b border-stone-100"
                  >
                    <TableCell className="text-sm font-medium text-stone-900 max-w-48 truncate">
                      {req.title}
                      {req.requesterId === userId && (
                        <span className="text-xs text-teal-700 ms-1">·طلبك</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-stone-600 hidden md:table-cell">
                      {req.type === 'general' ? 'عام' : 'خاص'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                          pStyle.badge
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', pStyle.dot)} />
                        {getPriorityLabel(req.priority)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                          sStyle.badge
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', sStyle.dot)} />
                        {getStatusLabel(req.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-stone-700 hidden md:table-cell">
                      {requester?.fullName.split(' ').slice(0, 2).join(' ') || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-stone-600 tabular-nums hidden md:table-cell">
                      {new Date(req.createdAt).toLocaleDateString('ar-SA', {
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

      <p className="text-sm text-stone-600">
        عرض {filteredRequests.length} من {maintenanceRequests.length} طلب
      </p>

      {/* Extracted components */}
      <RequestDetailSheet
        requestId={selectedRequestId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <CreateRequestDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
      />
    </div>
  )
}
