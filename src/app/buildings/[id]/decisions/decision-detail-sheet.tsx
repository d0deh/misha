'use client'

import { useState } from 'react'
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

  function handleVote(option: 'approve' | 'reject' | 'abstain') {
    if (!decisionId) return
    const existingVote = getUserVoteForDecision(userId, decisionId)
    if (existingVote) {
      if (existingVote.option === option) return
      appData.changeVote(decisionId, userId, option)
    } else {
      appData.addVote(decisionId, userId, option, userName)
    }
    toast('تم تسجيل تصويتك ✓')
  }

  function handleCloseDecision() {
    if (!decisionId) return
    appData.closeDecision(decisionId, userId)
    toast('تم إغلاق التصويت ✓')
  }

  function renderVoteButtons() {
    if (!selectedDecision || selectedDecision.status !== 'open' || !userCanVote) return null
    const myVote = getUserVoteForDecision(userId, selectedDecision.id)

    return (
      <div className="space-y-2">
        {voteButtonOptions.map((opt) => {
          const isActive = myVote?.option === opt.key
          return (
            <button
              key={opt.key}
              onClick={(e) => {
                e.stopPropagation()
                handleVote(opt.key)
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
                <div className="bg-teal-800 p-5 pe-12 text-white">
                  <SheetHeader className="p-0">
                    <SheetDescription className="text-teal-300 text-xs">
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
                    <p className="text-base text-stone-700 leading-relaxed">
                      {selectedDecision.description}
                    </p>
                  </DetailSection>

                  <Separator className="bg-stone-100" />

                  {/* Vote buttons in sheet — full-width */}
                  {userCanVote && selectedDecision.status === 'open' && (
                    <>
                      <DetailSection title="صوّت الآن">
                        {renderVoteButtons()}
                      </DetailSection>
                      <Separator className="bg-stone-100" />
                    </>
                  )}

                  <DetailSection title="التصويت">
                    {selectedVotes.length === 0 ? (
                      <p className="text-sm text-stone-600">لم يصوّت أحد بعد</p>
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
                                isMe && 'bg-teal-50/50 -mx-2 px-2 rounded'
                              )}
                            >
                              <span className="text-sm text-stone-700 flex-1">
                                {voter?.fullName.split(' ').slice(0, 2).join(' ') || 'مجهول'}
                                {isMe && <span className="text-xs text-teal-700 ms-1">(أنت)</span>}
                              </span>
                              <span className="text-xs text-stone-500 tabular-nums">{Math.round(getVoterWeight(vote.voterId, voterWeights) * 10) / 10}٪</span>
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

                  <div className="rounded-lg bg-stone-50 border border-stone-100 px-4 py-3">
                    <p className="text-sm text-stone-600">
                      <span className="font-medium text-emerald-700">{Math.round(approveWeight)}٪ موافق</span>
                      {' · '}
                      <span className="font-medium text-red-700">{Math.round(rejectWeight)}٪ رافض</span>
                      {' · '}
                      <span className="font-medium text-stone-600">{Math.round(abstainWeight)}٪ ممتنع</span>
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      ({approveCount} موافق · {rejectCount} رافض · {abstainCount} ممتنع من {voterWeights.length} مالك)
                    </p>
                  </div>

                  {selectedDecision.result && (
                    <>
                      <Separator className="bg-stone-100" />
                      <DetailSection title="النتيجة">
                        <p className="text-base text-stone-700">{selectedDecision.result}</p>
                        <p className="text-xs text-stone-500 mt-2">
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
                      <Separator className="bg-stone-100" />
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
                    <p className="text-xs text-stone-400 pt-2">
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
