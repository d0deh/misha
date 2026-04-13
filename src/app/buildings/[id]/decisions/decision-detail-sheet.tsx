'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DetailSection } from '@/components/ui/detail-section'
import { getOwnerById, getCategoryLabel, getStatusLabel } from '@/lib/mock-data'
import { useAppData } from '@/lib/app-data-context'
import { getVoterWeight } from '@/lib/vote-weights'
import { useToast } from '@/lib/use-toast'
import { useUser, canVote } from '@/lib/user-context'
import { formatRelativeTime } from '@/lib/relative-time'
import { cn } from '@/lib/utils'
import { categoryBadge, voteOptionStyles, voteButtonOptions } from './_constants'
import { getWhatsAppUrl } from './_whatsapp'

interface DecisionDetailSheetProps {
  decisionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DecisionDetailSheet({ decisionId, open, onOpenChange }: DecisionDetailSheetProps) {
  const { role, userId, userName } = useUser()
  const appData = useAppData()
  const { toast } = useToast()
  const userCanVote = canVote(role)

  const { decisions, getDecisionVotes, getUserVoteForDecision, owners, voterWeights } = appData

  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [pendingVote, setPendingVote] = useState<'approve' | 'reject' | 'abstain' | null>(null)
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedDecision = decisions.find((d) => d.id === decisionId)
  const selectedVotes = selectedDecision
    ? getDecisionVotes(selectedDecision.id)
    : []
  const approveCount = selectedVotes.filter((v) => v.option === 'approve').length
  const rejectCount = selectedVotes.filter((v) => v.option === 'reject').length
  const abstainCount = selectedVotes.filter((v) => v.option === 'abstain').length
  const approveWeight = selectedVotes.filter(v => v.option === 'approve').reduce((s, v) => s + getVoterWeight(v.voterId, voterWeights), 0)
  const rejectWeight = selectedVotes.filter(v => v.option === 'reject').reduce((s, v) => s + getVoterWeight(v.voterId, voterWeights), 0)
  const abstainWeight = selectedVotes.filter(v => v.option === 'abstain').reduce((s, v) => s + getVoterWeight(v.voterId, voterWeights), 0)

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
    }
  }, [])

  // Reset pending vote when sheet closes or decision changes
  useEffect(() => {
    setPendingVote(null)
    if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
  }, [decisionId, open])

  function confirmVote(option: 'approve' | 'reject' | 'abstain') {
    if (!decisionId) return
    if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
    setPendingVote(null)

    const existingVote = getUserVoteForDecision(userId, decisionId)
    if (existingVote) {
      if (existingVote.option === option) return
      appData.changeVote(decisionId, userId, option)
      toast('تم تعديل تصويتك')
    } else {
      appData.addVote(decisionId, userId, option, userName)
      toast('تم تسجيل تصويتك')
    }
  }

  function handleVoteClick(option: 'approve' | 'reject' | 'abstain') {
    if (pendingVote === option) {
      confirmVote(option)
      return
    }
    if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
    setPendingVote(option)
    pendingTimeout.current = setTimeout(() => setPendingVote(null), 5000)
  }

  function handleCloseDecision() {
    if (!decisionId) return
    appData.closeDecision(decisionId, userId)
    toast('تم إغلاق التصويت')
  }

  function renderVoteButtons() {
    if (!selectedDecision || selectedDecision.status !== 'open' || !userCanVote) return null
    const myVote = getUserVoteForDecision(userId, selectedDecision.id)
    const pendingOption = pendingVote ? voteButtonOptions.find((o) => o.key === pendingVote) : null

    return (
      <div className="space-y-2">
        {voteButtonOptions.map((opt) => {
          const isActive = myVote?.option === opt.key
          return (
            <button
              key={opt.key}
              onClick={(e) => {
                e.stopPropagation()
                handleVoteClick(opt.key)
              }}
              className={cn(
                'w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                isActive ? opt.activeClass : opt.inactiveClass
              )}
            >
              {opt.label}
              {isActive && ' ✓'}
            </button>
          )
        })}

        {/* Inline confirmation strip */}
        <div
          className={cn(
            'grid transition-all duration-200 ease-out',
            pendingVote ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5">
              <span className="text-sm text-foreground">
                تأكيد التصويت: <span className="font-medium">{pendingOption?.label}؟</span>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (pendingVote) confirmVote(pendingVote)
                  }}
                  className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  تأكيد
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
                    setPendingVote(null)
                  }}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-hidden p-0">
          {selectedDecision && (
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                <div className="bg-shell p-5 pe-12 text-white">
                  <SheetHeader className="p-0">
                    <SheetDescription className="text-shell-muted text-xs">
                      تفاصيل القرار
                    </SheetDescription>
                    <SheetTitle className="text-white text-lg font-bold">
                      {selectedDecision.title}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border border-white/20',
                        categoryBadge[selectedDecision.category]
                          ? 'bg-white/10 text-white/80'
                          : 'bg-white/10 text-white/70'
                      )}
                    >
                      {getCategoryLabel(selectedDecision.category)}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border border-white/20 px-2 py-0.5 text-xs font-medium',
                        selectedDecision.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : selectedDecision.status === 'rejected'
                          ? 'bg-red-500/20 text-red-200'
                          : 'bg-white/10 text-white/70'
                      )}
                    >
                      {getStatusLabel(selectedDecision.status)}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <DetailSection title="الوصف">
                    <p className="text-base text-slate-700 leading-relaxed">
                      {selectedDecision.description}
                    </p>
                  </DetailSection>

                  <Separator className="bg-slate-100" />

                  {/* Vote buttons in sheet — full-width */}
                  {userCanVote && selectedDecision.status === 'open' && (
                    <>
                      <DetailSection title="صوّت الآن">
                        {renderVoteButtons()}
                      </DetailSection>
                      <Separator className="bg-slate-100" />
                    </>
                  )}

                  <DetailSection title="التصويت">
                    {selectedVotes.length === 0 ? (
                      <p className="text-sm text-slate-600">لم يصوّت أحد بعد</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedVotes.map((vote) => {
                          const voter = getOwnerById(vote.voterId, owners)
                          const vStyle = voteOptionStyles[vote.option]
                          const isMe = vote.voterId === userId
                          return (
                            <div
                              key={vote.id}
                              className={cn(
                                'flex items-center gap-3 py-1.5',
                                isMe && 'bg-primary/5 -mx-2 px-2 rounded'
                              )}
                            >
                              <span className="text-sm text-slate-700 flex-1">
                                {voter?.fullName.split(' ').slice(0, 2).join(' ') || 'مجهول'}
                                {isMe && <span className="text-xs text-primary ms-1">(أنت)</span>}
                              </span>
                              <span className="text-xs text-slate-500 tabular-nums">{Math.round(getVoterWeight(vote.voterId, voterWeights) * 10) / 10}٪</span>
                              <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', vStyle.text)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', vStyle.dot)} />
                                {vStyle.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </DetailSection>

                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-emerald-700">{Math.round(approveWeight)}٪ موافق</span>
                      {' · '}
                      <span className="font-medium text-red-700">{Math.round(rejectWeight)}٪ رافض</span>
                      {' · '}
                      <span className="font-medium text-slate-600">{Math.round(abstainWeight)}٪ ممتنع</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      ({approveCount} موافق · {rejectCount} رافض · {abstainCount} ممتنع من {voterWeights.length} مالك)
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      الحد الأدنى للموافقة: ٧٥٪ من مساحة المصوّتين
                    </p>
                  </div>

                  {selectedDecision.result && (
                    <>
                      <Separator className="bg-slate-100" />
                      <DetailSection title="النتيجة">
                        <p className="text-base text-slate-700">{selectedDecision.result}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          لأغراض تنظيمية — للإجراء الرسمي يُرجى الرجوع لمنصة ملاك
                        </p>
                        <a
                          href={getWhatsAppUrl(selectedDecision, selectedVotes, voterWeights, appData.building.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20BD5A] transition-colors mt-3"
                        >
                          <Share2 className="h-4 w-4" />
                          مشاركة عبر واتساب
                        </a>
                      </DetailSection>
                    </>
                  )}

                  {/* Close voting button — chairman or vice chairman */}
                  {['chairman', 'vice_chairman'].includes(role) && selectedDecision.status === 'open' && (
                    <>
                      <Separator className="bg-slate-100" />
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => setCloseConfirmOpen(true)}
                      >
                        إغلاق التصويت
                      </Button>
                    </>
                  )}

                  {/* Created at timestamp */}
                  {selectedDecision.createdAt && (
                    <p className="text-xs text-slate-400 pt-2">
                      أُنشئ {formatRelativeTime(selectedDecision.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Close Voting Confirm Dialog */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title="إغلاق التصويت"
        description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء"
        variant="destructive"
        confirmLabel="إغلاق التصويت"
        onConfirm={handleCloseDecision}
      />
    </>
  )
}
