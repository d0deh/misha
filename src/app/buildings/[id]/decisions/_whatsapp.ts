import type { Decision } from '@/lib/types'
import type { VoterWeight } from '@/lib/vote-weights'
import { getVoterWeight } from '@/lib/vote-weights'
import type { Vote } from '@/lib/types'

export function getWhatsAppUrl(
  decision: Decision,
  decisionVotes: Vote[],
  voterWeights: VoterWeight[],
  buildingName: string
) {
  const statusLabel = decision.status === 'approved' ? 'موافقة' : 'مرفوض'
  const aW = Math.round(decisionVotes.filter(v => v.option === 'approve').reduce((s, v) => s + getVoterWeight(v.voterId, voterWeights), 0))
  const rW = Math.round(decisionVotes.filter(v => v.option === 'reject').reduce((s, v) => s + getVoterWeight(v.voterId, voterWeights), 0))
  const abW = Math.round(decisionVotes.filter(v => v.option === 'abstain').reduce((s, v) => s + getVoterWeight(v.voterId, voterWeights), 0))
  const date = new Date(decision.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })

  const message = `🏢 مِشاع — نتيجة تصويت

القرار: ${decision.title}
النتيجة: ${statusLabel}
التصويت: ${aW}٪ موافق · ${rW}٪ رافض · ${abW}٪ ممتنع
المبنى: ${buildingName}
التاريخ: ${date}`

  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
