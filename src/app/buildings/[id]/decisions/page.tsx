'use client'

import { useState } from 'react'
import { Plus, Vote } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBody,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderTitle,
} from '@/components/ui/page-header'
import { PermissionButton } from '@/components/ui/permission-button'
import { useAppData } from '@/lib/app-data-context'
import { useUser, canCreateDecision, canVote } from '@/lib/user-context'
import { CreateDecisionDialog } from './create-decision-dialog'
import { DecisionDetailSheet } from './decision-detail-sheet'
import { DecisionCard } from './decision-card'

export default function DecisionsPage() {
  const { role, userId } = useUser()
  const { decisions, getDecisionsAwaitingVote } = useAppData()
  const userCanVote = canVote(role)

  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const openDecisions = decisions.filter((decision) => decision.status === 'open')
  const closedDecisions = decisions.filter((decision) =>
    ['approved', 'rejected', 'closed'].includes(decision.status)
  )
  const awaitingVote = userCanVote ? getDecisionsAwaitingVote(userId) : []

  function renderEmpty(message: string, showCreate = false) {
    return (
      <div className="page-shell px-4 py-8 text-center">
        <Vote className="mx-auto mb-3 h-12 w-12 text-muted-foreground/45" />
        <p className="text-base font-medium text-foreground">{message}</p>
        <p className="mt-1 text-sm text-muted-foreground">ستظهر هنا القرارات عند إنشائها</p>
        {showCreate && canCreateDecision(role) && (
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/8 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Plus className="h-4 w-4" />
            قرار جديد
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader>
        <PageHeaderBody>
          <PageHeaderEyebrow>مساحة القرارات</PageHeaderEyebrow>
          <PageHeaderTitle>القرارات والتصويت</PageHeaderTitle>
          <PageHeaderDescription>
            {openDecisions.length} قرارات مفتوحة
            {userCanVote && awaitingVote.length > 0 && ` · ${awaitingVote.length} بانتظار تصويتك`}
          </PageHeaderDescription>
        </PageHeaderBody>
        <PageHeaderActions>
          <PermissionButton
            hasPermission={canCreateDecision(role)}
            tooltipText="ليس لديك صلاحية لإنشاء قرارات"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" data-icon="inline-start" />
            قرار جديد
          </PermissionButton>
        </PageHeaderActions>
      </PageHeader>

      <Tabs defaultValue={0} className="space-y-4">
        <TabsList variant="line">
          <TabsTrigger value={0}>مفتوحة ({openDecisions.length})</TabsTrigger>
          <TabsTrigger value={1}>مُنتهية ({closedDecisions.length})</TabsTrigger>
          <TabsTrigger value={2}>الكل ({decisions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={0}>
          {openDecisions.length === 0 ? (
            renderEmpty('لا توجد قرارات مفتوحة حالياً', true)
          ) : (
            <div className="space-y-3">
              {openDecisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onClick={() => {
                    setSelectedDecisionId(decision.id)
                    setSheetOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value={1}>
          {closedDecisions.length === 0 ? (
            renderEmpty('لا توجد قرارات مُنتهية')
          ) : (
            <div className="space-y-3">
              {closedDecisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onClick={() => {
                    setSelectedDecisionId(decision.id)
                    setSheetOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value={2}>
          {decisions.length === 0 ? (
            renderEmpty('لا توجد قرارات')
          ) : (
            <div className="space-y-3">
              {decisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onClick={() => {
                    setSelectedDecisionId(decision.id)
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
