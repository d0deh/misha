'use client'

import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PermissionButton } from '@/components/ui/permission-button'
import {
  getOwnerById,
  getStatusLabel,
  getPriorityLabel,
  getUnitById,
} from '@/lib/mock-data'
import { useAppData } from '@/lib/app-data-context'
import { useToast } from '@/lib/use-toast'
import { useUser, canManageMaintenance } from '@/lib/user-context'
import { formatRelativeTime } from '@/lib/relative-time'
import { cn } from '@/lib/utils'
import { DetailSection, DetailRow } from '@/components/ui/detail-section'
import { statusStyles } from './_constants'

interface RequestDetailSheetProps {
  requestId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDetailSheet({ requestId, open, onOpenChange }: RequestDetailSheetProps) {
  const { role, userId } = useUser()
  const appData = useAppData()
  const { toast } = useToast()
  const showManagement = canManageMaintenance(role)

  const { maintenanceRequests, units, owners } = appData

  // Find the request from context
  const selectedRequest = requestId
    ? maintenanceRequests.find((r) => r.id === requestId) ?? null
    : null

  const selectedRequester = selectedRequest
    ? getOwnerById(selectedRequest.requesterId, owners)
    : undefined
  const selectedUnit = selectedRequest?.unitId
    ? getUnitById(selectedRequest.unitId, units)
    : undefined

  const selectedComments = requestId ? appData.getComments(requestId) : []

  // Draft states
  const [vendorDraft, setVendorDraft] = useState('')
  const [costEstimateDraft, setCostEstimateDraft] = useState('')
  const [finalCostDraft, setFinalCostDraft] = useState('')
  const [commentText, setCommentText] = useState('')

  // Confirmation dialogs
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)

  // Sync draft values when requestId changes
  useEffect(() => {
    if (selectedRequest) {
      setVendorDraft(selectedRequest.assignedVendor || '')
      setCostEstimateDraft(selectedRequest.costEstimate != null ? String(selectedRequest.costEstimate) : '')
      setFinalCostDraft(selectedRequest.finalCost != null ? String(selectedRequest.finalCost) : '')
      setCommentText('')
    }
  }, [requestId]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Status workflow ---

  function handleStartProgress(reqId: string) {
    appData.updateRequestStatus(reqId, 'in_progress', userId)
    toast('تم بدء التنفيذ')
  }

  function handleComplete(reqId: string) {
    appData.updateRequestStatus(reqId, 'completed', userId)
    toast('تم الإنجاز')
  }

  function handleCancelRequest() {
    if (!requestId) return
    appData.updateRequestStatus(requestId, 'cancelled', userId)
    toast('تم إلغاء الطلب')
  }

  // --- Vendor & cost ---

  function handleSaveVendor(reqId: string) {
    appData.assignVendor(reqId, vendorDraft.trim())
    toast('تم حفظ المقاول')
  }

  function handleSaveCostEstimate(reqId: string) {
    const val = parseFloat(costEstimateDraft)
    if (isNaN(val)) return
    appData.updateCosts(reqId, { costEstimate: val })
    toast('تم حفظ التكلفة المقدرة')
  }

  function handleSaveFinalCost(reqId: string) {
    const val = parseFloat(finalCostDraft)
    if (isNaN(val)) return
    appData.updateCosts(reqId, { finalCost: val })
    toast('تم حفظ التكلفة النهائية')
  }

  // --- Comments ---

  function handleAddComment(reqId: string) {
    if (!commentText.trim()) return
    appData.addComment(reqId, userId, commentText.trim())
    toast('تم إضافة التعليق')
    setCommentText('')
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-hidden p-0">
          {selectedRequest && (
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                <div className="bg-shell p-5 pe-12 text-white">
                  <SheetHeader className="p-0">
                    <SheetDescription className="text-shell-muted text-xs">
                      بيانات طلب الصيانة
                    </SheetDescription>
                    <SheetTitle className="text-white text-lg font-bold">
                      {selectedRequest.title}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium border-white/20',
                        selectedRequest.priority === 'urgent' || selectedRequest.priority === 'high'
                          ? 'bg-red-500/20 text-red-200'
                          : 'bg-white/10 text-white/70'
                      )}
                    >
                      {getPriorityLabel(selectedRequest.priority)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70">
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <DetailSection title="تفاصيل الطلب">
                    <DetailRow
                      label="النوع"
                      value={selectedRequest.type === 'general' ? 'عام' : 'خاص'}
                    />
                    {selectedUnit && (
                      <DetailRow label="الوحدة" value={`الوحدة ${selectedUnit.unitNumber}`} />
                    )}
                    <DetailRow
                      label="مقدم الطلب"
                      value={selectedRequester?.fullName || '—'}
                    />
                    <div>
                      <p className="text-sm text-slate-600 mb-1">الوصف</p>
                      <p className="text-base text-slate-700 leading-relaxed">
                        {selectedRequest.description}
                      </p>
                    </div>
                  </DetailSection>

                  {/* Comment thread — positioned prominently */}
                  <Separator className="bg-slate-100" />
                  <DetailSection title="التعليقات">
                    {selectedComments.length === 0 ? (
                      <p className="text-sm text-slate-500">لا توجد تعليقات بعد</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedComments.map((c) => {
                          const author = getOwnerById(c.authorId, owners)
                          return (
                            <div key={c.id} className="rounded-lg bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-800">
                                  {author?.fullName.split(' ').slice(0, 2).join(' ') || '—'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatRelativeTime(c.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {c.text}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div className="flex items-end gap-2 mt-3">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="أضف تعليقاً..."
                        className="flex-1 min-h-10 border-slate-200 focus-visible:ring-ring"
                      />
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                        disabled={!commentText.trim()}
                        onClick={() => handleAddComment(selectedRequest.id)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        إرسال
                      </Button>
                    </div>
                  </DetailSection>

                  {/* Status workflow buttons */}
                  {(selectedRequest.status === 'new' || selectedRequest.status === 'in_progress') && (
                    <>
                      <Separator className="bg-slate-100" />
                      <DetailSection title="إجراءات">
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.status === 'new' && (
                            <PermissionButton
                              hasPermission={showManagement}
                              tooltipText="للإدارة فقط"
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => handleStartProgress(selectedRequest.id)}
                            >
                              بدء التنفيذ
                            </PermissionButton>
                          )}
                          {selectedRequest.status === 'in_progress' && (
                            <PermissionButton
                              hasPermission={showManagement}
                              tooltipText="للإدارة فقط"
                              size="sm"
                              className="bg-success text-white hover:bg-success/90"
                              onClick={() => setConfirmCompleteOpen(true)}
                            >
                              تم الإنجاز
                            </PermissionButton>
                          )}
                          <PermissionButton
                            hasPermission={showManagement}
                            tooltipText="للإدارة فقط"
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirmCancelOpen(true)}
                          >
                            إلغاء
                          </PermissionButton>
                        </div>
                      </DetailSection>
                    </>
                  )}

                  {/* Vendor & cost fields (management only) */}
                  {showManagement && (
                    <>
                      <Separator className="bg-slate-100" />
                      <DetailSection title="التنفيذ">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-slate-600 mb-1">المقاول</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={vendorDraft}
                                onChange={(e) => setVendorDraft(e.target.value)}
                                placeholder="اسم المقاول"
                                className="flex-1 border-slate-200 focus-visible:ring-ring"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveVendor(selectedRequest.id)}
                                disabled={!vendorDraft.trim()}
                              >
                                حفظ
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-slate-600 mb-1">التكلفة المقدرة (ريال)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={costEstimateDraft}
                                onChange={(e) => setCostEstimateDraft(e.target.value)}
                                placeholder="0"
                                className="flex-1 border-slate-200 focus-visible:ring-ring"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveCostEstimate(selectedRequest.id)}
                                disabled={!costEstimateDraft}
                              >
                                حفظ
                              </Button>
                            </div>
                          </div>
                          {selectedRequest.status === 'completed' && (
                            <div>
                              <Label className="text-sm text-slate-600 mb-1">التكلفة النهائية (ريال)</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={finalCostDraft}
                                  onChange={(e) => setFinalCostDraft(e.target.value)}
                                  placeholder="0"
                                  className="flex-1 border-slate-200 focus-visible:ring-ring"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSaveFinalCost(selectedRequest.id)}
                                  disabled={!finalCostDraft}
                                >
                                  حفظ
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DetailSection>
                    </>
                  )}

                  <Separator className="bg-slate-100" />
                  <DetailSection title="التواريخ">
                    <DetailRow
                      label="تاريخ الإنشاء"
                      value={new Date(selectedRequest.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    />
                    <DetailRow
                      label="آخر تحديث"
                      value={new Date(selectedRequest.updatedAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    />
                  </DetailSection>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Mark complete confirmation dialog */}
      <ConfirmDialog
        open={confirmCompleteOpen}
        onOpenChange={setConfirmCompleteOpen}
        title="إتمام طلب الصيانة"
        description="هل أنت متأكد أن العمل اكتمل؟ سيتم تحديث الحالة إلى مكتمل."
        confirmLabel="تم الإنجاز"
        cancelLabel="تراجع"
        onConfirm={() => {
          if (requestId) handleComplete(requestId)
        }}
      />

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="إلغاء طلب الصيانة"
        description="هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="إلغاء الطلب"
        cancelLabel="تراجع"
        variant="destructive"
        onConfirm={handleCancelRequest}
      />
    </>
  )
}
