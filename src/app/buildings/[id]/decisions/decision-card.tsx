'use client'

import { useState, useRef, useEffect } from 'react'
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
import { getWhatsAppUrl, getOpenDecisionWhatsAppUrl } from './_whatsapp'

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

  const [pendingVote, setPendingVote] = useState<'approve' | 'reject' | 'abstain' | null>(null)
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
    }
  }, [])

  function confirmVote(option: 'approve' | 'reject' | 'abstain') {
    if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
    setPendingVote(null)

    const existingVote = getUserVoteForDecision(userId, decision.id)
    if (existingVote) {
      if (existingVote.option === option) return
      appData.changeVote(decision.id, userId, option)
      toast('ØªÙ… ØªØ¹Ø¯ÙŠÙ„ ØªØµÙˆÙŠØªÙƒ')
    } else {
      appData.addVote(decision.id, userId, option, userName)
      toast('ØªÙ… ØªØ³Ø¬ÙŠÙ„ ØªØµÙˆÙŠØªÙƒ')
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

  function renderCompactVoteButtons() {
    if (!isOpen || !userCanVote) return null

    const pendingOption = pendingVote ? voteButtonOptions.find((o) => o.key === pendingVote) : null

    return (
      <div className="mt-3 border-t border-border/70 pt-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {voteButtonOptions.map((option) => {
            const isActive = myVote?.option === option.key

            return (
              <button
                key={option.key}
                onClick={(event) => {
                  event.stopPropagation()
                  handleVoteClick(option.key)
                }}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                  isActive ? option.activeClass : option.inactiveClass
                )}
              >
                {option.label}
                {isActive && ' âœ“'}
              </button>
            )
          })}
        </div>

        {/* Inline confirmation strip */}
        <div
          className={cn(
            'grid transition-all duration-200 ease-out',
            pendingVote ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5">
              <span className="text-sm text-foreground">
                ØªØ£ÙƒÙŠØ¯ Ø§Ù„ØªØµÙˆÙŠØª: <span className="font-medium">{pendingOption?.label}ØŸ</span>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    if (pendingVote) confirmVote(pendingVote)
                  }}
                  className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  ØªØ£ÙƒÙŠØ¯
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    if (pendingTimeout.current) clearTimeout(pendingTimeout.current)
                    setPendingVote(null)
                  }}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ø¥Ù„ØºØ§Ø¡
                </button>
              </div>
            </div>
          </div>
        </div>
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
        Ø£Ù†Ø´Ø£Ù‡ {creator?.fullName.split(' ').slice(0, 2).join(' ') || 'Ù…Ø¬Ù‡ÙˆÙ„'}
      </p>

      {isOpen ? (
        <>
          <div className="mb-3">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-base font-medium tabular-nums text-foreground">
                {voteProgress}Ùª
                <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                  Ù…Ù† Ø§Ù„Ù…Ø³Ø§Ø­Ø© Ù…ÙÙ…Ø«ÙŽÙ‘Ù„Ø©
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {decisionVotes.length} Ù…Ù„Ø§Ùƒ ØµÙˆÙ‘ØªÙˆØ§
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/80">
              <div
                className="ms-auto h-full rounded-full bg-primary transition-all"
                style={{ width: `${voteProgress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs',
                isUrgent
                  ? 'rounded-md bg-warning/10 px-2 py-1 font-medium text-warning'
                  : 'text-muted-foreground'
              )}>
                {daysLeft > 0 ? `${daysLeft} ÙŠÙˆÙ… Ù…ØªØ¨Ù‚ÙŠ` : 'Ø§Ù†ØªÙ‡Øª Ø§Ù„Ù…Ù‡Ù„Ø©'}
              </span>
              {userCanVote && !myVote && (
                <span className="text-xs font-medium text-warning">Â· Ù„Ù… ØªØµÙˆÙ‘Øª Ø¨Ø¹Ø¯</span>
              )}
              {myVote && (
                <span className="text-xs font-medium text-success">Â· ØµÙˆÙ‘ØªØª: {getVoteOptionLabel(myVote.option)}</span>
              )}
            </div>
            <a
              href={getOpenDecisionWhatsAppUrl(decision, appData.building.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#20BD5A]"
            >
              <Share2 className="h-3 w-3" />
              ØªØ°ÙƒÙŠØ± Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨
            </a>
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className={cn('status-pill shrink-0', statusBadge.badge)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusBadge.dot)} />
              {getStatusLabel(decision.status)}
            </span>
          </div>
          {decision.result && (
            <p className={cn(
              'mt-1.5 text-sm',
              decision.status === 'approved' ? 'text-success' : decision.status === 'rejected' ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {decision.result}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Ù„Ø£ØºØ±Ø§Ø¶ ØªÙ†Ø¸ÙŠÙ…ÙŠØ©ØŒ ÙˆÙ„Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø±Ø³Ù…ÙŠ ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø±Ø¬ÙˆØ¹ Ø¥Ù„Ù‰ Ù…Ù†ØµØ© Ù…Ù„Ø§Ùƒ
          </p>
          <a
            href={getWhatsAppUrl(decision, decisionVotes, voterWeights, appData.building.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#20BD5A]"
          >
            <Share2 className="h-3 w-3" />
            Ù…Ø´Ø§Ø±ÙƒØ© Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨
          </a>
        </div>
      )}

      {userCanVote && !isOpen && myVote && (
        <p className="mt-2 border-t border-border/70 pt-2 text-xs font-medium text-success">
          ØµÙˆÙ‘ØªØª: {getVoteOptionLabel(myVote.option)}
        </p>
      )}

      {renderCompactVoteButtons()}
    </button>
  )
}
