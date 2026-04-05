'use client'

import { useState, useMemo } from 'react'
import { Search, FileText, Eye, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getOwnerById, getDocumentTypeLabel } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { DetailRow } from '@/components/ui/detail-section'
import { useAppData } from '@/lib/app-data-context'
import { useUser, canUploadDocuments } from '@/lib/user-context'
import { useToast } from '@/lib/use-toast'
import { PermissionButton } from '@/components/ui/permission-button'
import type { Document } from '@/lib/types'

const docTypeBadgeStyles: Record<string, { dot: string; badge: string }> = {
  statute: { dot: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  minutes: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  invoice: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  contract: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  report: { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  decision: { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
  other: { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
}

const visibilityLabels: Record<string, string> = {
  everyone: 'الجميع',
  board_only: 'مجلس الإدارة فقط',
  owners_only: 'الملاك فقط',
}

export default function DocumentsPage() {
  const { userId, role } = useUser()
  const { building, owners, documents, addDocument } = useAppData()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState<string>('other')
  const [uploadVisibility, setUploadVisibility] = useState<string>('everyone')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadFileName, setUploadFileName] = useState('مستند_جديد.pdf')

  // View dialog state
  const [viewDoc, setViewDoc] = useState<Document | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const hasUploadPermission = canUploadDocuments(role)

  // Filter documents by visibility based on user role
  const visibleDocuments = useMemo(() => {
    const isBoardOrManager = ['chairman', 'vice_chairman', 'board_member', 'manager'].includes(role)
    const isOwnerOrAbove = role !== 'resident'

    return documents.filter((doc) => {
      const vis = doc.visibility || 'everyone'
      if (vis === 'everyone') return true
      if (vis === 'board_only') return isBoardOrManager
      if (vis === 'owners_only') return isOwnerOrAbove
      return true
    })
  }, [documents, role])

  const filteredDocuments = useMemo(() => {
    return visibleDocuments.filter((doc) => {
      const matchesSearch = search === '' || doc.title.includes(search)
      const matchesType =
        !typeFilter || typeFilter === 'all' || doc.documentType === typeFilter
      return matchesSearch && matchesType
    })
  }, [visibleDocuments, search, typeFilter])

  function handleUploadSubmit() {
    if (!uploadTitle.trim()) return
    addDocument(
      {
        title: uploadTitle.trim(),
        documentType: uploadType as Document['documentType'],
        entityType: 'building',
        entityId: building.id,
        fileUrl: '/documents/' + uploadFileName,
        uploadedBy: userId,
        visibility: uploadVisibility as Document['visibility'],
        notes: uploadNotes.trim() || undefined,
        fileSize: '1.2 MB',
      },
      userId
    )
    toast('تم رفع المستند بنجاح')
    setUploadOpen(false)
    setUploadTitle('')
    setUploadType('other')
    setUploadVisibility('everyone')
    setUploadNotes('')
    setUploadFileName('مستند_جديد.pdf')
  }

  function handleViewDoc(doc: Document) {
    setViewDoc(doc)
    setViewOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger
            render={
              <PermissionButton
                hasPermission={hasUploadPermission}
                tooltipText="ليس لديك صلاحية رفع المستندات"
                size="sm"
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" data-icon="inline-start" />
                رفع مستند جديد
              </PermissionButton>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>رفع مستند جديد</DialogTitle>
              <DialogDescription>أضف مستند جديد للمبنى</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="doc-title">العنوان</Label>
                <Input
                  id="doc-title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="عنوان المستند..."
                  className="border-stone-200 focus-visible:ring-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>نوع المستند</Label>
                <Select value={uploadType} onValueChange={(v) => setUploadType(v ?? 'other')} items={{ statute: 'نظام أساسي', minutes: 'محضر اجتماع', invoice: 'فاتورة', contract: 'عقد', report: 'تقرير', other: 'أخرى' }}>
                  <SelectTrigger className="border-stone-200 focus:ring-teal-500">
                    <SelectValue placeholder="اختر نوع المستند" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statute">نظام أساسي</SelectItem>
                    <SelectItem value="minutes">محضر اجتماع</SelectItem>
                    <SelectItem value="invoice">فاتورة</SelectItem>
                    <SelectItem value="contract">عقد</SelectItem>
                    <SelectItem value="report">تقرير</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>مستوى الوصول</Label>
                <Select value={uploadVisibility} onValueChange={(v) => setUploadVisibility(v ?? 'everyone')} items={{ everyone: 'الجميع', board_only: 'مجلس الإدارة فقط', owners_only: 'الملاك فقط' }}>
                  <SelectTrigger className="border-stone-200 focus:ring-teal-500">
                    <SelectValue placeholder="اختر مستوى الوصول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">الجميع</SelectItem>
                    <SelectItem value="board_only">مجلس الإدارة فقط</SelectItem>
                    <SelectItem value="owners_only">الملاك فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-notes">ملاحظات</Label>
                <Textarea
                  id="doc-notes"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                  className="border-stone-200 focus-visible:ring-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-file">اسم الملف</Label>
                <Input
                  id="doc-file"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="اسم الملف"
                  className="border-stone-200 focus-visible:ring-teal-500"
                  dir="ltr"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUploadSubmit}
                disabled={!uploadTitle.trim()}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                رفع المستند
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">المستندات</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {visibleDocuments.length} مستند
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
          <Input
            placeholder="بحث بعنوان المستند..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 border-stone-200 focus-visible:ring-teal-500"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? '')} items={{ all: 'الكل', statute: 'نظام أساسي', minutes: 'محضر اجتماع', invoice: 'فاتورة', contract: 'عقد', report: 'تقرير' }}>
          <SelectTrigger className="w-full sm:w-44 border-stone-200 focus:ring-teal-500">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="statute">نظام أساسي</SelectItem>
            <SelectItem value="minutes">محضر اجتماع</SelectItem>
            <SelectItem value="invoice">فاتورة</SelectItem>
            <SelectItem value="contract">عقد</SelectItem>
            <SelectItem value="report">تقرير</SelectItem>
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
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                النوع
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 hidden md:table-cell">
                رفع بواسطة
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10">
                التاريخ
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-stone-600 h-10 w-16">
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center align-middle">
                  <FileText className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-stone-700">
                    لا توجد مستندات مطابقة
                  </p>
                  <p className="text-sm text-stone-600 mt-1">
                    حاول تغيير معايير البحث أو الفلاتر
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => {
                const uploader = getOwnerById(doc.uploadedBy, owners)
                const style = docTypeBadgeStyles[doc.documentType] || docTypeBadgeStyles.other
                return (
                  <TableRow
                    key={doc.id}
                    className="h-12 border-b border-stone-100"
                  >
                    <TableCell className="text-sm font-medium text-stone-900">
                      {doc.title}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                          style.badge
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                        {getDocumentTypeLabel(doc.documentType)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-stone-700 hidden md:table-cell">
                      {uploader?.fullName.split(' ').slice(0, 2).join(' ') || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-stone-600 tabular-nums">
                      {new Date(doc.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewDoc(doc)}
                        className="text-stone-600 hover:text-stone-900"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="sr-only">عرض</span>
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-stone-600">
        عرض {filteredDocuments.length} من {visibleDocuments.length} مستند
      </p>

      {/* View document detail dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          {viewDoc && (
            <>
              <DialogHeader>
                <DialogTitle>{viewDoc.title}</DialogTitle>
                <DialogDescription>تفاصيل المستند</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <DetailRow
                  label="النوع"
                  value={getDocumentTypeLabel(viewDoc.documentType)}
                />
                <DetailRow
                  label="رفع بواسطة"
                  value={getOwnerById(viewDoc.uploadedBy, owners)?.fullName || '—'}
                />
                <DetailRow
                  label="التاريخ"
                  value={new Date(viewDoc.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
                <DetailRow
                  label="مستوى الوصول"
                  value={visibilityLabels[viewDoc.visibility || 'everyone']}
                />
                {viewDoc.fileSize && (
                  <DetailRow label="حجم الملف" value={viewDoc.fileSize} />
                )}
                {viewDoc.notes && (
                  <DetailRow label="ملاحظات" value={viewDoc.notes} />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

