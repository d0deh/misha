'use client'

import { Share2 } from 'lucide-react'
import {
  getOwnerById,
  getCategoryLabel,
  getStatusLabel,
  getVoteOptionLabel,
} from '@/lib/mock-data'
import { useAppData } from '@/lib/app-data-context'
import { getVotedAreaWeight } from '@/lib/vote-weights'
import { useToast } from '@/lib/use-toast'
import { useUser, canVote } from '@/lib/user-context'
import type { Decision } from '@/lib/types'
import { cn } from '@/lib/utils'
import { categoryBadge, categoryBorder, statusBadgeStyles, voteButtonOptions } from './_constants'
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
  const sBadge = statusBadgeStyles[decision.status] || statusBadgeStyles.closed
  const myVote = getUserVoteForDecision(userId, decision.id)

  function handleVote(option: 'approve' | 'reject' | 'abstain') {
    const existingVote = getUserVoteForDecision(userId, decision.id)
    if (existingVote) {
      if (existingVote.option === option) return
      appData.changeVote(decision.id, userId, option)
    } else {
      appData.addVote(decision.id, userId, option, userName)
    }
    toast('تم تسجيل تصويتك ✓')
  }

  function renderCompactVoteButtons() {
    if (!isOpen || !userCanVote) return null

    return (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
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
                'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
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
    <button
      onClick={onClick}
      className={cn(
        'w-full text-start rounded-lg border border-stone-200 bg-white p-4 border-s-[3px] transition-colors hover:bg-teal-50/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
        categoryBorder[decision.category] || 'border-s-stone-300'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-medium text-stone-900 leading-snug">
          {decision.title}
        </p>
        <span
          className={cn(
            'inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium border shrink-0',
            categoryBadge[decision.category] || categoryBadge.general
          )}
        >
          {getCategoryLabel(decision.category)}
        </span>
      </div>

      <p className="text-sm text-stone-600 line-clamp-2 mb-2">
        {decision.description}
      </p>

      <p className="text-sm text-stone-600 mb-3">
        أنشأه {creator?.fullName.split(' ').slice(0, 2).join(' ') || 'مجهول'}
      </p>

      {isOpen ? (
        <>
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm text-stone-600 mb-1">
              <span>صوّت ملاك يمثلون {Math.round(votedAreaWeight)}٪ من المساحة ({decisionVotes.length} ملاك)</span>
              <span className="tabular-nums">{voteProgress}٪</span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-500 transition-all ms-auto"
                style={{ width: `${voteProgress}%` }}
              />
            </div>
          </div>
          <p className={cn('text-xs', isUrgent ? 'text-red-600 font-medium' : 'text-stone-600')}>
            {daysLeft > 0 ? `${daysLeft} يوم متبقي` : 'انتهت المهلة'}
          </p>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-2">
            {decision.result && (
              <p className="text-xs text-stone-600 truncate">{decision.result}</p>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0',
                sBadge.badge
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', sBadge.dot)} />
              {getStatusLabel(decision.status)}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            لأغراض تنظيمية — للإجراء الرسمي يُرجى الرجوع لمنصة ملاك
          </p>
          <a
            href={getWhatsAppUrl(decision, decisionVotes, voterWeights, appData.building.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#20BD5A] transition-colors mt-2"
          >
            <Share2 className="h-3 w-3" />
            مشاركة عبر واتساب
          </a>
        </div>
      )}

      {/* User vote status */}
      {userCanVote && isOpen && !myVote && (
        <p className="text-xs font-medium text-amber-700 mt-2 pt-2 border-t border-stone-100">
          لم تصوّت بعد
        </p>
      )}
      {userCanVote && myVote && (
        <p className="text-xs font-medium text-emerald-700 mt-2 pt-2 border-t border-stone-100">
          صوّتت: {getVoteOptionLabel(myVote.option)}
        </p>
      )}

      {/* Inline vote buttons on open decision cards */}
      {renderCompactVoteButtons()}
    </button>
  )
}
