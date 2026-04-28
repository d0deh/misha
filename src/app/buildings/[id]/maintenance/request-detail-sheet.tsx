'use client'

import { useRef, useState } from 'react'
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

  const vendorInputRef = useRef<HTMLInputElement>(null)
  const costEstimateInputRef = useRef<HTMLInputElement>(null)
  const finalCostInputRef = useRef<HTMLInputElement>(null)
  const [commentDraft, setCommentDraft] = useState({ requestId: '', text: '' })
  const commentText = commentDraft.requestId === (requestId || '') ? commentDraft.text : ''

  // Confirmation dialogs
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)

  // --- Status workflow ---

  function handleStartProgress(reqId: string) {
    appData.updateRequestStatus(reqId, 'in_progress', userId)
    toast('ØªÙ… Ø¨Ø¯Ø¡ Ø§Ù„ØªÙ†ÙÙŠØ°')
  }

  function handleComplete(reqId: string) {
    appData.updateRequestStatus(reqId, 'completed', userId)
    toast('ØªÙ… Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²')
  }

  function handleCancelRequest() {
    if (!requestId) return
    appData.updateRequestStatus(requestId, 'cancelled', userId)
    toast('ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø·Ù„Ø¨')
  }

  // --- Vendor & cost ---

  function handleSaveVendor(reqId: string) {
    const vendor = vendorInputRef.current?.value.trim() || ''
    if (!vendor) return
    appData.assignVendor(reqId, vendor)
    toast('ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ù‚Ø§ÙˆÙ„')
  }

  function handleSaveCostEstimate(reqId: string) {
    const val = parseFloat(costEstimateInputRef.current?.value || '')
    if (isNaN(val)) return
    appData.updateCosts(reqId, { costEstimate: val })
    toast('ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ù…Ù‚Ø¯Ø±Ø©')
  }

  function handleSaveFinalCost(reqId: string) {
    const val = parseFloat(finalCostInputRef.current?.value || '')
    if (isNaN(val)) return
    appData.updateCosts(reqId, { finalCost: val })
    toast('ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©')
  }

  // --- Comments ---

  function handleAddComment(reqId: string) {
    if (!commentText.trim()) return
    appData.addComment(reqId, userId, commentText.trim())
    toast('ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„ØªØ¹Ù„ÙŠÙ‚')
    setCommentDraft({ requestId: reqId, text: '' })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-hidden p-0">
          {selectedRequest && (
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                <div className="bg-shell p-5 pe-12 text-shell-foreground">
                  <SheetHeader className="p-0">
                    <SheetDescription className="text-shell-muted text-xs">
                      Ø¨ÙŠØ§Ù†Ø§Øª Ø·Ù„Ø¨ Ø§Ù„ØµÙŠØ§Ù†Ø©
                    </SheetDescription>
                    <SheetTitle className="text-lg font-medium text-shell-foreground">
                      {selectedRequest.title}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium border-white/20',
                        selectedRequest.priority === 'urgent' || selectedRequest.priority === 'high'
                          ? 'bg-destructive/15 text-destructive-foreground'
                          : 'bg-white/10 text-shell-muted'
                      )}
                    >
                      {getPriorityLabel(selectedRequest.priority)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-shell-muted">
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <DetailSection title="ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨">
                    <DetailRow
                      label="Ø§Ù„Ù†ÙˆØ¹"
                      value={selectedRequest.type === 'general' ? 'Ø¹Ø§Ù…' : 'Ø®Ø§Øµ'}
                    />
                    {selectedUnit && (
                      <DetailRow label="Ø§Ù„ÙˆØ­Ø¯Ø©" value={`Ø§Ù„ÙˆØ­Ø¯Ø© ${selectedUnit.unitNumber}`} />
                    )}
                    <DetailRow
                      label="Ù…Ù‚Ø¯Ù… Ø§Ù„Ø·Ù„Ø¨"
                      value={selectedRequester?.fullName || 'â€”'}
                    />
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Ø§Ù„ÙˆØµÙ</p>
                      <p className="text-base leading-relaxed text-foreground/85">
                        {selectedRequest.description}
                      </p>
                    </div>
                  </DetailSection>

                  {/* Comment thread â€” positioned prominently */}
                  <Separator className="bg-border" />
                  <DetailSection title="Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª">
                    {selectedComments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø¨Ø¹Ø¯</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedComments.map((c) => {
                          const author = getOwnerById(c.authorId, owners)
                          return (
                            <div key={c.id} className="rounded-xl border border-border/70 bg-muted/40 p-3">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {author?.fullName.split(' ').slice(0, 2).join(' ') || 'â€”'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(c.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/85">
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
                        onChange={(e) =>
                          setCommentDraft({ requestId: selectedRequest.id, text: e.target.value })
                        }
                        placeholder="Ø£Ø¶Ù ØªØ¹Ù„ÙŠÙ‚Ø§Ù‹..."
                        className="min-h-10 flex-1 border-border focus-visible:ring-ring"
                      />
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                        disabled={!commentText.trim()}
                        onClick={() => handleAddComment(selectedRequest.id)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Ø¥Ø±Ø³Ø§Ù„
                      </Button>
                    </div>
                  </DetailSection>

                  {/* Status workflow buttons */}
                  {(selectedRequest.status === 'new' || selectedRequest.status === 'in_progress') && (
                    <>
                      <Separator className="bg-border" />
                      <DetailSection title="Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª">
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.status === 'new' && (
                            <PermissionButton
                              hasPermission={showManagement}
                              tooltipText="Ù„Ù„Ø¥Ø¯Ø§Ø±Ø© ÙÙ‚Ø·"
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => handleStartProgress(selectedRequest.id)}
                            >
                              Ø¨Ø¯Ø¡ Ø§Ù„ØªÙ†ÙÙŠØ°
                            </PermissionButton>
                          )}
                          {selectedRequest.status === 'in_progress' && (
                            <PermissionButton
                              hasPermission={showManagement}
                              tooltipText="Ù„Ù„Ø¥Ø¯Ø§Ø±Ø© ÙÙ‚Ø·"
                              size="sm"
                              className="bg-success text-white hover:bg-success/90"
                              onClick={() => setConfirmCompleteOpen(true)}
                            >
                              ØªÙ… Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²
                            </PermissionButton>
                          )}
                          <PermissionButton
                            hasPermission={showManagement}
                            tooltipText="Ù„Ù„Ø¥Ø¯Ø§Ø±Ø© ÙÙ‚Ø·"
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirmCancelOpen(true)}
                          >
                            Ø¥Ù„ØºØ§Ø¡
                          </PermissionButton>
                        </div>
                      </DetailSection>
                    </>
                  )}

                  {/* Vendor & cost fields (management only) */}
                  {showManagement && (
                    <>
                      <Separator className="bg-border" />
                      <DetailSection title="Ø§Ù„ØªÙ†ÙÙŠØ°">
                        <div className="space-y-3">
                          <div>
                            <Label className="mb-1 text-sm text-muted-foreground">Ø§Ù„Ù…Ù‚Ø§ÙˆÙ„</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                key={`vendor-${selectedRequest.id}`}
                                ref={vendorInputRef}
                                defaultValue={selectedRequest.assignedVendor || ''}
                                placeholder="Ø§Ø³Ù… Ø§Ù„Ù…Ù‚Ø§ÙˆÙ„"
                                className="flex-1 border-border focus-visible:ring-ring"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveVendor(selectedRequest.id)}
                              >
                                Ø­ÙØ¸
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="mb-1 text-sm text-muted-foreground">Ø§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ù…Ù‚Ø¯Ø±Ø© (Ø±ÙŠØ§Ù„)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                key={`estimate-${selectedRequest.id}`}
                                ref={costEstimateInputRef}
                                defaultValue={
                                  selectedRequest.costEstimate != null
                                    ? String(selectedRequest.costEstimate)
                                    : ''
                                }
                                placeholder="0"
                                className="flex-1 border-border focus-visible:ring-ring"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveCostEstimate(selectedRequest.id)}
                              >
                                Ø­ÙØ¸
                              </Button>
                            </div>
                          </div>
                          {selectedRequest.status === 'completed' && (
                            <div>
                              <Label className="mb-1 text-sm text-muted-foreground">Ø§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© (Ø±ÙŠØ§Ù„)</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  key={`final-cost-${selectedRequest.id}`}
                                  ref={finalCostInputRef}
                                  defaultValue={
                                    selectedRequest.finalCost != null
                                      ? String(selectedRequest.finalCost)
                                      : ''
                                  }
                                  placeholder="0"
                                  className="flex-1 border-border focus-visible:ring-ring"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSaveFinalCost(selectedRequest.id)}
                                >
                                  Ø­ÙØ¸
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DetailSection>
                    </>
                  )}

                  <Separator className="bg-border" />
                  <DetailSection title="Ø§Ù„ØªÙˆØ§Ø±ÙŠØ®">
                    <DetailRow
                      label="ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡"
                      value={new Date(selectedRequest.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    />
                    <DetailRow
                      label="Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«"
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
        title="Ø¥ØªÙ…Ø§Ù… Ø·Ù„Ø¨ Ø§Ù„ØµÙŠØ§Ù†Ø©"
        description="Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ø£Ù† Ø§Ù„Ø¹Ù…Ù„ Ø§ÙƒØªÙ…Ù„ØŸ Ø³ÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø­Ø§Ù„Ø© Ø¥Ù„Ù‰ Ù…ÙƒØªÙ…Ù„."
        confirmLabel="ØªÙ… Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²"
        cancelLabel="ØªØ±Ø§Ø¬Ø¹"
        onConfirm={() => {
          if (requestId) handleComplete(requestId)
        }}
      />

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Ø¥Ù„ØºØ§Ø¡ Ø·Ù„Ø¨ Ø§Ù„ØµÙŠØ§Ù†Ø©"
        description="Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø¥Ù„ØºØ§Ø¡ Ù‡Ø°Ø§ Ø§Ù„Ø·Ù„Ø¨ØŸ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡."
        confirmLabel="Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø·Ù„Ø¨"
        cancelLabel="ØªØ±Ø§Ø¬Ø¹"
        variant="destructive"
        onConfirm={handleCancelRequest}
      />
    </>
  )
}
