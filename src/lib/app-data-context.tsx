'use client'

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActivityLog,
  Association,
  AssociationRole,
  AssociationRoleType,
  Building,
  Decision,
  Document,
  Fee,
  MaintenanceComment,
  MaintenanceRequest,
  Owner,
  OwnershipLink,
  Unit,
  Vote,
} from '@/lib/types'
import {
  getBuildingData,
  getOwnerById as lookupOwner,
  type BuildingDataset,
} from '@/lib/mock-data'
import {
  canCreateDecision,
  canManageAssociation,
  canManageMaintenance,
  canUploadDocuments,
  canVote,
} from '@/lib/permissions'
import { computeVoterWeights, computeWeightedResult, type VoterWeight } from '@/lib/vote-weights'

interface AppDataContextType {
  building: Building
  owners: Owner[]
  units: Unit[]
  ownershipLinks: OwnershipLink[]
  association: Association
  associationRoles: AssociationRole[]
  decisions: Decision[]
  votes: Vote[]
  maintenanceRequests: MaintenanceRequest[]
  documents: Document[]
  activityLog: ActivityLog[]
  comments: Record<string, MaintenanceComment[]>
  fees: Fee[]
  voterWeights: VoterWeight[]

  getDecisionVotes: (decisionId: string) => Vote[]
  getUserVoteForDecision: (userId: string, decisionId: string) => Vote | undefined
  getDecisionsAwaitingVote: (userId: string) => Decision[]
  getComments: (requestId: string) => MaintenanceComment[]

  addDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'status'>, actorId: string) => void
  addVote: (decisionId: string, voterId: string, option: Vote['option'], actorName: string) => void
  changeVote: (decisionId: string, voterId: string, newOption: Vote['option']) => void
  closeDecision: (decisionId: string, actorId: string) => void
  addMaintenanceRequest: (
    request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    actorId: string
  ) => void
  updateRequestStatus: (requestId: string, status: MaintenanceRequest['status'], actorId: string) => void
  assignVendor: (requestId: string, vendor: string) => void
  updateCosts: (requestId: string, costs: { costEstimate?: number; finalCost?: number }) => void
  addComment: (requestId: string, authorId: string, text: string) => void
  addDocument: (document: Omit<Document, 'id' | 'createdAt'>, actorId: string) => void
  updateBuilding: (
    updates: Partial<Pick<Building, 'name' | 'nationalAddress' | 'totalArea' | 'commonAreas'>>,
    actorId: string
  ) => void
}

const AppDataContext = createContext<AppDataContextType | null>(null)

function now() {
  return new Date().toISOString()
}

function numericIdSuffix(id: string) {
  return Number(id.match(/-(\d+)$/)?.[1] || 0)
}

function getInitialCounter(data: BuildingDataset) {
  const ids = [
    data.building.id,
    data.association.id,
    ...data.owners.map((owner) => owner.id),
    ...data.units.map((unit) => unit.id),
    ...data.ownershipLinks.map((link) => link.id),
    ...data.associationRoles.map((role) => role.id),
    ...data.decisions.map((decision) => decision.id),
    ...data.votes.map((vote) => vote.id),
    ...data.maintenanceRequests.map((request) => request.id),
    ...data.documents.map((document) => document.id),
    ...data.activityLog.map((entry) => entry.id),
    ...(data.fees || []).map((fee) => fee.id),
  ]

  return Math.max(200, ...ids.map(numericIdSuffix))
}

export function AppDataProvider({ buildingId, children }: { buildingId: string; children: ReactNode }) {
  const buildingData = getBuildingData(buildingId)

  if (!buildingData) {
    throw new Error(`Unknown building id: ${buildingId}`)
  }

  const data = buildingData
  const counter = useRef(getInitialCounter(data))
  const nextId = (prefix: string) => `${prefix}-${++counter.current}`

  const voterWeights = useMemo(
    () =>
      computeVoterWeights(
        data.owners,
        data.units,
        data.ownershipLinks,
        data.associationRoles
      ),
    [data.associationRoles, data.owners, data.ownershipLinks, data.units]
  )
  const eligibleVoterCount = voterWeights.length

  const [building, setBuilding] = useState<Building>({ ...data.building })
  const [decisions, setDecisions] = useState<Decision[]>([...data.decisions])
  const [votes, setVotes] = useState<Vote[]>([...data.votes])
  const [maintenanceRequests, setMaintenance] = useState<MaintenanceRequest[]>([
    ...data.maintenanceRequests,
  ])
  const [documents, setDocuments] = useState<Document[]>([...data.documents])
  const [activityLog, setActivity] = useState<ActivityLog[]>([...data.activityLog])
  const [comments, setComments] = useState<Record<string, MaintenanceComment[]>>({})

  function getOwnerById(id: string) {
    return lookupOwner(id, data.owners)
  }

  function getActorRole(actorId: string): AssociationRoleType | undefined {
    return data.associationRoles.find((role) => role.userId === actorId)?.role
  }

  function actorCan(actorId: string, check: (role: AssociationRoleType) => boolean) {
    const role = getActorRole(actorId)
    return role ? check(role) : false
  }

  function addActivity(entry: Omit<ActivityLog, 'id' | 'timestamp'>) {
    setActivity((prev) => [
      { ...entry, id: `act-${++counter.current}`, timestamp: now() },
      ...prev,
    ])
  }

  function getDecisionVotes(decisionId: string) {
    return votes.filter((vote) => vote.decisionId === decisionId)
  }

  function getUserVoteForDecision(userId: string, decisionId: string) {
    return votes.find((vote) => vote.voterId === userId && vote.decisionId === decisionId)
  }

  function getDecisionsAwaitingVote(userId: string) {
    return decisions.filter(
      (decision) =>
        decision.status === 'open' &&
        !votes.some((vote) => vote.voterId === userId && vote.decisionId === decision.id)
    )
  }

  function getComments(requestId: string) {
    return comments[requestId] || []
  }

  function computeResult(decisionId: string, allVotes: Vote[]) {
    const decisionVotes = allVotes.filter((vote) => vote.decisionId === decisionId)
    const weighted = computeWeightedResult(decisionVotes, voterWeights)
    return {
      status: weighted.status as Decision['status'],
      result: weighted.resultText,
    }
  }

  function addDecision(
    decision: Omit<Decision, 'id' | 'createdAt' | 'status'>,
    actorId: string
  ) {
    if (!actorCan(actorId, canCreateDecision)) return

    const newDecision: Decision = {
      ...decision,
      id: nextId('dec'),
      status: 'open',
      createdAt: now(),
    }
    setDecisions((prev) => [newDecision, ...prev])

    const actor = getOwnerById(actorId)
    addActivity({
      actorId,
      action: 'create',
      entityType: 'decision',
      entityId: newDecision.id,
      descriptionAr: `أنشأ ${actor?.fullName || ''} قرار جديد: ${decision.title}`,
    })
  }

  function addVote(
    decisionId: string,
    voterId: string,
    option: Vote['option'],
    actorName: string
  ) {
    const decision = decisions.find((item) => item.id === decisionId)
    if (!decision || decision.status !== 'open') return
    if (!actorCan(voterId, canVote)) return
    if (votes.some((vote) => vote.decisionId === decisionId && vote.voterId === voterId)) return

    const newVote: Vote = {
      id: nextId('v'),
      decisionId,
      voterId,
      option,
      timestamp: now(),
    }

    setVotes((prev) => {
      if (prev.some((vote) => vote.decisionId === decisionId && vote.voterId === voterId)) {
        return prev
      }

      const updated = [...prev, newVote]
      const votersForDecision = new Set(
        updated.filter((vote) => vote.decisionId === decisionId).map((vote) => vote.voterId)
      )

      if (votersForDecision.size >= eligibleVoterCount) {
        const { status, result } = computeResult(decisionId, updated)
        setDecisions((prevDecisions) =>
          prevDecisions.map((item) =>
            item.id === decisionId ? { ...item, status, result } : item
          )
        )
      }

      return updated
    })

    const optionLabels: Record<Vote['option'], string> = {
      approve: 'بالموافقة',
      reject: 'بالرفض',
      abstain: 'بالامتناع',
    }
    addActivity({
      actorId: voterId,
      action: 'vote',
      entityType: 'decision',
      entityId: decisionId,
      descriptionAr: `صوّت ${actorName} ${optionLabels[option]} على: ${decision.title}`,
    })
  }

  function changeVote(decisionId: string, voterId: string, newOption: Vote['option']) {
    const decision = decisions.find((item) => item.id === decisionId)
    if (!decision || decision.status !== 'open') return

    setVotes((prev) =>
      prev.map((vote) =>
        vote.decisionId === decisionId && vote.voterId === voterId
          ? { ...vote, option: newOption, timestamp: now() }
          : vote
      )
    )
  }

  function closeDecision(decisionId: string, actorId: string) {
    if (!actorCan(actorId, canCreateDecision)) return

    const decision = decisions.find((item) => item.id === decisionId)
    if (!decision || decision.status !== 'open') return

    setVotes((currentVotes) => {
      const { status, result } = computeResult(decisionId, currentVotes)
      setDecisions((prev) =>
        prev.map((item) => (item.id === decisionId ? { ...item, status, result } : item))
      )
      return currentVotes
    })

    const actor = getOwnerById(actorId)
    addActivity({
      actorId,
      action: 'update',
      entityType: 'decision',
      entityId: decisionId,
      descriptionAr: `أغلق ${actor?.fullName || ''} التصويت على: ${decision.title}`,
    })
  }

  function addMaintenanceRequest(
    request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    actorId: string
  ) {
    const timestamp = now()
    const newRequest: MaintenanceRequest = {
      ...request,
      id: nextId('mnt'),
      status: 'new',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    setMaintenance((prev) => [newRequest, ...prev])

    const actor = getOwnerById(actorId)
    addActivity({
      actorId,
      action: 'create',
      entityType: 'maintenance',
      entityId: newRequest.id,
      descriptionAr: `أنشأ ${actor?.fullName || ''} طلب صيانة: ${request.title}`,
    })
  }

  function updateRequestStatus(
    requestId: string,
    status: MaintenanceRequest['status'],
    actorId: string
  ) {
    if (!actorCan(actorId, canManageMaintenance)) return

    const request = maintenanceRequests.find((item) => item.id === requestId)
    if (!request) return

    setMaintenance((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, status, updatedAt: now() } : item
      )
    )

    const statusLabels: Partial<Record<MaintenanceRequest['status'], string>> = {
      in_progress: 'بدأ التنفيذ',
      completed: 'اكتمل',
      cancelled: 'تم إلغاء',
    }
    addActivity({
      actorId,
      action: 'update',
      entityType: 'maintenance',
      entityId: requestId,
      descriptionAr: `${statusLabels[status] || status} طلب الصيانة: ${request.title}`,
    })
  }

  function assignVendor(requestId: string, vendor: string) {
    setMaintenance((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, assignedVendor: vendor, updatedAt: now() } : request
      )
    )
  }

  function updateCosts(requestId: string, costs: { costEstimate?: number; finalCost?: number }) {
    setMaintenance((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, ...costs, updatedAt: now() } : request
      )
    )
  }

  function addComment(requestId: string, authorId: string, text: string) {
    const comment: MaintenanceComment = {
      id: nextId('cmt'),
      requestId,
      authorId,
      text,
      timestamp: now(),
    }

    setComments((prev) => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), comment],
    }))
  }

  function addDocument(document: Omit<Document, 'id' | 'createdAt'>, actorId: string) {
    if (!actorCan(actorId, canUploadDocuments)) return

    const newDocument: Document = {
      ...document,
      id: nextId('doc'),
      createdAt: now(),
    }
    setDocuments((prev) => [newDocument, ...prev])

    const actor = getOwnerById(actorId)
    addActivity({
      actorId,
      action: 'upload',
      entityType: 'document',
      entityId: newDocument.id,
      descriptionAr: `رفع ${actor?.fullName || ''} مستند: ${document.title}`,
    })
  }

  function updateBuilding(
    updates: Partial<Pick<Building, 'name' | 'nationalAddress' | 'totalArea' | 'commonAreas'>>,
    actorId: string
  ) {
    if (!actorCan(actorId, canManageAssociation)) return

    setBuilding((prev) => ({ ...prev, ...updates }))

    const actor = getOwnerById(actorId)
    addActivity({
      actorId,
      action: 'update',
      entityType: 'building',
      entityId: building.id,
      descriptionAr: `حدّث ${actor?.fullName || ''} بيانات المبنى`,
    })
  }

  return (
    <AppDataContext.Provider
      value={{
        building,
        owners: data.owners,
        units: data.units,
        ownershipLinks: data.ownershipLinks,
        association: data.association,
        associationRoles: data.associationRoles,
        decisions,
        votes,
        maintenanceRequests,
        documents,
        activityLog,
        comments,
        fees: data.fees || [],
        voterWeights,
        getDecisionVotes,
        getUserVoteForDecision,
        getDecisionsAwaitingVote,
        getComments,
        addDecision,
        addVote,
        changeVote,
        closeDecision,
        addMaintenanceRequest,
        updateRequestStatus,
        assignVendor,
        updateCosts,
        addComment,
        addDocument,
        updateBuilding,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used within AppDataProvider')
  return context
}
