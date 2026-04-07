'use client'

import { useMemo, useState } from 'react'
import { Eye, FileText, Plus, Search } from 'lucide-react'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getDocumentTypeLabel, getOwnerById } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { DetailRow } from '@/components/ui/detail-section'
import { useAppData } from '@/lib/app-data-context'
import { useUser, canUploadDocuments } from '@/lib/user-context'
import { useToast } from '@/lib/use-toast'
import { PermissionButton } from '@/components/ui/permission-button'
import type { Document } from '@/lib/types'

const docTypeBadgeStyles: Record<string, { dot: string; badge: string }> = {
  statute: { dot: 'bg-primary', badge: 'border-primary/20 bg-primary/10 text-primary' },
  minutes: { dot: 'bg-violet-500', badge: 'border-violet-200 bg-violet-50 text-violet-700' },
  invoice: { dot: 'bg-warning', badge: 'border-warning/20 bg-warning/10 text-warning' },
  contract: { dot: 'bg-success', badge: 'border-success/20 bg-success/10 text-success' },
  report: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
  decision: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
  other: { dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground' },
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
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState<string>('other')
  const [uploadVisibility, setUploadVisibility] = useState<string>('everyone')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadFileName, setUploadFileName] = useState('مستند_جديد.pdf')
  const [viewDoc, setViewDoc] = useState<Document | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const hasUploadPermission = canUploadDocuments(role)

  const visibleDocuments = useMemo(() => {
    const isBoardOrManager = ['chairman', 'vice_chairman', 'board_member', 'manager'].includes(role)
    const isOwnerOrAbove = role !== 'resident'

    return documents.filter((document) => {
      const visibility = document.visibility || 'everyone'
      if (visibility === 'everyone') return true
      if (visibility === 'board_only') return isBoardOrManager
      if (visibility === 'owners_only') return isOwnerOrAbove
      return true
    })
  }, [documents, role])

  const filteredDocuments = useMemo(() => {
    return visibleDocuments.filter((document) => {
      const matchesSearch = search === '' || document.title.includes(search)
      const matchesType =
        !typeFilter || typeFilter === 'all' || document.documentType === typeFilter
      return matchesSearch && matchesType
    })
  }, [search, typeFilter, visibleDocuments])

  function handleUploadSubmit() {
    if (!uploadTitle.trim()) return

    addDocument(
      {
        title: uploadTitle.trim(),
        documentType: uploadType as Document['documentType'],
        entityType: 'building',
        entityId: building.id,
        fileUrl: `/documents/${uploadFileName}`,
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

  function handleViewDoc(document: Document) {
    setViewDoc(document)
    setViewOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader>
        <PageHeaderBody>
          <PageHeaderEyebrow>أرشيف المبنى</PageHeaderEyebrow>
          <PageHeaderTitle>المستندات</PageHeaderTitle>
          <PageHeaderDescription>{visibleDocuments.length} مستند</PageHeaderDescription>
        </PageHeaderBody>
        <PageHeaderActions>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger
              render={
                <PermissionButton
                  hasPermission={hasUploadPermission}
                  tooltipText="ليس لديك صلاحية رفع المستندات"
                  size="sm"
                >
                  <Plus className="h-4 w-4" data-icon="inline-start" />
                  رفع مستند جديد
                </PermissionButton>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>رفع مستند جديد</DialogTitle>
                <DialogDescription>أضف مستنداً جديداً للمبنى</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="doc-title">العنوان</Label>
                  <Input
                    id="doc-title"
                    value={uploadTitle}
                    onChange={(event) => setUploadTitle(event.target.value)}
                    placeholder="عنوان المستند..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>نوع المستند</Label>
                  <Select value={uploadType} onValueChange={(value) => setUploadType(value ?? 'other')}>
                    <SelectTrigger>
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
                  <Select
                    value={uploadVisibility}
                    onValueChange={(value) => setUploadVisibility(value ?? 'everyone')}
                  >
                    <SelectTrigger>
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
                    onChange={(event) => setUploadNotes(event.target.value)}
                    placeholder="ملاحظات اختيارية..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="doc-file">اسم الملف</Label>
                  <Input
                    id="doc-file"
                    dir="ltr"
                    value={uploadFileName}
                    onChange={(event) => setUploadFileName(event.target.value)}
                    placeholder="document.pdf"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUploadSubmit} disabled={!uploadTitle.trim()}>
                  رفع المستند
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeaderActions>
      </PageHeader>

      <div className="page-shell p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بعنوان المستند..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? '')}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="كل الأنواع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              <SelectItem value="statute">نظام أساسي</SelectItem>
              <SelectItem value="minutes">محضر اجتماع</SelectItem>
              <SelectItem value="invoice">فاتورة</SelectItem>
              <SelectItem value="contract">عقد</SelectItem>
              <SelectItem value="report">تقرير</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="data-table-shell">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/45 hover:bg-muted/45">
              <TableHead>العنوان</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead className="hidden md:table-cell">رفع بواسطة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center align-middle">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/45" />
                  <p className="text-base font-medium text-foreground">لا توجد مستندات مطابقة</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    حاول تغيير معايير البحث أو الفلاتر
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document) => {
                const uploader = getOwnerById(document.uploadedBy, owners)
                const style = docTypeBadgeStyles[document.documentType] || docTypeBadgeStyles.other

                return (
                  <TableRow key={document.id} className="h-12">
                    <TableCell className="text-sm font-medium text-foreground">
                      {document.title}
                    </TableCell>
                    <TableCell>
                      <span className={cn('status-pill', style.badge)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                        {getDocumentTypeLabel(document.documentType)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm text-foreground/85 md:table-cell">
                      {uploader?.fullName.split(' ').slice(0, 2).join(' ') || '—'}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">
                      {new Date(document.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewDoc(document)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
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

      <p className="text-sm text-muted-foreground">
        عرض {filteredDocuments.length} من {visibleDocuments.length} مستند
      </p>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          {viewDoc && (
            <>
              <DialogHeader>
                <DialogTitle>{viewDoc.title}</DialogTitle>
                <DialogDescription>تفاصيل المستند</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <DetailRow label="النوع" value={getDocumentTypeLabel(viewDoc.documentType)} />
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
                {viewDoc.fileSize && <DetailRow label="حجم الملف" value={viewDoc.fileSize} />}
                {viewDoc.notes && <DetailRow label="ملاحظات" value={viewDoc.notes} />}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
