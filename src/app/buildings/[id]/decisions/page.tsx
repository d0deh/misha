'use client'

import { useState } from 'react'
import { Plus, Vote } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PermissionButton } from '@/components/ui/permission-button'
import { useAppData } from '@/lib/app-data-context'
import { useUser, canVote, canCreateDecision } from '@/lib/user-context'
import { CreateDecisionDialog } from './create-decision-dialog'
import { DecisionDetailSheet } from './decision-detail-sheet'
import { DecisionCard } from './decision-card'

export default function DecisionsPage() {
  const { role, userId } = useUser()
  const { decisions, getDecisionsAwaitingVote } = useAppData()
  const userCanVote = canVote(role)

  // Sheet state
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)

  const openDecisions = decisions.filter((d) => d.status === 'open')
  const closedDecisions = decisions.filter((d) =>
    ['approved', 'rejected', 'closed'].includes(d.status)
  )
  const awaitingVote = userCanVote ? getDecisionsAwaitingVote(userId) : []

  function renderEmpty(message: string) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white px-4 py-8 text-center">
        <Vote className="h-12 w-12 text-stone-300 mx-auto mb-3" />
        <p className="text-base font-medium text-stone-700">{message}</p>
        <p className="text-sm text-stone-600 mt-1">ستظهر هنا القرارات عند إنشائها</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <PermissionButton
          hasPermission={canCreateDecision(role)}
          tooltipText="ليس لديك صلاحية لإنشاء قرارات"
          size="sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" data-icon="inline-start" />
          قرار جديد
        </PermissionButton>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">القرارات والتصويت</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {openDecisions.length} قرارات مفتوحة
            {userCanVote && awaitingVote.length > 0 && ` · ${awaitingVote.length} بانتظار تصويتك`}
          </p>
        </div>
      </div>

      <Tabs defaultValue={0}>
        <TabsList variant="line">
          <TabsTrigger value={0}>مفتوحة ({openDecisions.length})</TabsTrigger>
          <TabsTrigger value={1}>مغلقة ({closedDecisions.length})</TabsTrigger>
          <TabsTrigger value={2}>الكل ({decisions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="mt-4">
          {openDecisions.length === 0
            ? renderEmpty('لا توجد قرارات مفتوحة حالياً')
            : (
              <div className="space-y-3">
                {openDecisions.map((d) => (
                  <DecisionCard
                    key={d.id}
                    decision={d}
                    onClick={() => {
                      setSelectedDecisionId(d.id)
                      setSheetOpen(true)
                    }}
                  />
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value={1} className="mt-4">
          {closedDecisions.length === 0
            ? renderEmpty('لا توجد قرارات مغلقة')
            : (
              <div className="space-y-3">
                {closedDecisions.map((d) => (
                  <DecisionCard
                    key={d.id}
                    decision={d}
                    onClick={() => {
                      setSelectedDecisionId(d.id)
                      setSheetOpen(true)
                    }}
                  />
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value={2} className="mt-4">
          {decisions.length === 0
            ? renderEmpty('لا توجد قرارات')
            : (
              <div className="space-y-3">
                {decisions.map((d) => (
                  <DecisionCard
                    key={d.id}
                    decision={d}
                    onClick={() => {
                      setSelectedDecisionId(d.id)
                      setSheetOpen(true)
                    }}
                  />
                ))}
              </div>
            )}
        </TabsContent>
      </Tabs>

      <CreateDecisionDialog open={createOpen} onOpenChange={setCreateOpen} />

      <DecisionDetailSheet
        decisionId={selectedDecisionId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
