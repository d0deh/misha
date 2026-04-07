'use client'

import { Share2 } from 'lucide-react'
import {
  getCategoryLabel,
  getOwnerById,
  getStatusLabel,
  getVoteOptionLabel,
} from '@/lib/mock-data'
import { useAppData } from '@/lib/app-data-context'
import { getVotedAreaWeight } from '@/lib/vote-weights'
import { useToast } from '@/lib/use-toast'
import { useUser, canVote } from '@/lib/user-context'
import type { Decision } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  categoryBadge,
  categoryBorder,
  statusBadgeStyles,
  voteButtonOptions,
} from './_constants'
import { getWhatsAppUrl } from './_whatsapp'

interface DecisionCardProps {
  decision: Decision
  onClick: () => void
}

export function DecisionCard({ decision, onClick }: DecisionCardProps) {
  const { role, userId, userName } = useUser()
  const appData = useAppData()
  const { toast } = useToast()
  const userCanVote = canVote(role)

  const { getDecisionVotes, getUserVoteForDecision, owners, voterWeights } = appData

  const decisionVotes = getDecisionVotes(decision.id)
  const creator = getOwnerById(decision.createdBy, owners)
  const today = new Date()
  const deadline = new Date(decision.votingDeadline)
  const daysLeft = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  const isUrgent = daysLeft <= 3
  const votedAreaWeight = getVotedAreaWeight(decisionVotes, voterWeights)
  const voteProgress = Math.round(votedAreaWeight)
  const isOpen = decision.status === 'open'
  const statusBadge = statusBadgeStyles[decision.status] || statusBadgeStyles.closed
  const myVote = getUserVoteForDecision(userId, decision.id)

  function handleVote(option: 'approve' | 'reject' | 'abstain') {
    const existingVote = getUserVoteForDecision(userId, decision.id)

    if (existingVote) {
      if (existingVote.option === option) return
      appData.changeVote(decision.id, userId, option)
    } else {
      appData.addVote(decision.id, userId, option, userName)
    }

    toast('تم تسجيل تصويتك')
  }

  function renderCompactVoteButtons() {
    if (!isOpen || !userCanVote) return null

    return (
      <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3">
        {voteButtonOptions.map((option) => {
          const isActive = myVote?.option === option.key

          return (
            <button
              key={option.key}
              onClick={(event) => {
                event.stopPropagation()
                handleVote(option.key)
              }}
              className={cn(
                'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                isActive ? option.activeClass : option.inactiveClass
              )}
            >
              {option.label}
              {isActive && ' ✓'}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'page-shell w-full border-s-[3px] p-4 text-start transition-colors hover:bg-primary/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        categoryBorder[decision.category] || 'border-s-border'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-foreground">{decision.title}</p>
        <span
          className={cn(
            'status-pill shrink-0',
            categoryBadge[decision.category] || categoryBadge.general
          )}
        >
          {getCategoryLabel(decision.category)}
        </span>
      </div>

      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{decision.description}</p>

      <p className="mb-3 text-sm text-muted-foreground">
        أنشأه {creator?.fullName.split(' ').slice(0, 2).join(' ') || 'مجهول'}
      </p>

      {isOpen ? (
        <>
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                صوّت ملاك يمثلون {Math.round(votedAreaWeight)}٪ من المساحة ({decisionVotes.length}{' '}
                ملاك)
              </span>
              <span className="tabular-nums">{voteProgress}٪</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
              <div
                className="ms-auto h-full rounded-full bg-primary transition-all"
                style={{ width: `${voteProgress}%` }}
              />
            </div>
          </div>
          <p className={cn('text-xs', isUrgent ? 'font-medium text-warning' : 'text-muted-foreground')}>
            {daysLeft > 0 ? `${daysLeft} يوم متبقي` : 'انتهت المهلة'}
          </p>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-2">
            {decision.result && <p className="truncate text-xs text-muted-foreground">{decision.result}</p>}
            <span className={cn('status-pill shrink-0', statusBadge.badge)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusBadge.dot)} />
              {getStatusLabel(decision.status)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            لأغراض تنظيمية، وللإجراء الرسمي يرجى الرجوع إلى منصة ملاك
          </p>
          <a
            href={getWhatsAppUrl(decision, decisionVotes, voterWeights, appData.building.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#20BD5A]"
          >
            <Share2 className="h-3 w-3" />
            مشاركة عبر واتساب
          </a>
        </div>
      )}

      {userCanVote && isOpen && !myVote && (
        <p className="mt-2 border-t border-border/70 pt-2 text-xs font-medium text-warning">
          لم تصوّت بعد
        </p>
      )}
      {userCanVote && myVote && (
        <p className="mt-2 border-t border-border/70 pt-2 text-xs font-medium text-success">
          صوّتت: {getVoteOptionLabel(myVote.option)}
        </p>
      )}

      {renderCompactVoteButtons()}
    </button>
  )
}
