'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Building,
  Decision,
  Vote,
  MaintenanceRequest,
  Document,
  ActivityLog,
  MaintenanceComment,
  Owner,
  Unit,
  OwnershipLink,
  Association,
  AssociationRole,
  Fee,
} from '@/lib/types'
import {
  getBuildingData,
  getOwnerById as lookupOwner,
  type BuildingDataset,
} from '@/lib/mock-data'
import { canVote } from '@/lib/user-context'
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

  // Queries
  getDecisionVotes: (decisionId: string) => Vote[]
  getUserVoteForDecision: (userId: string, decisionId: string) => Vote | undefined
  getDecisionsAwaitingVote: (userId: string) => Decision[]
  getComments: (requestId: string) => MaintenanceComment[]

  // Mutations
  addDecision: (d: Omit<Decision, 'id' | 'createdAt' | 'status'>, actorId: string) => void
  addVote: (decisionId: string, voterId: string, option: Vote['option'], actorName: string) => void
  changeVote: (decisionId: string, voterId: string, newOption: Vote['option']) => void
  closeDecision: (decisionId: string, actorId: string) => void
  addMaintenanceRequest: (r: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>, actorId: string) => void
  updateRequestStatus: (reqId: string, status: MaintenanceRequest['status'], actorId: string) => void
  assignVendor: (reqId: string, vendor: string) => void
  updateCosts: (reqId: string, costs: { costEstimate?: number; finalCost?: number }) => void
  addComment: (reqId: string, authorId: string, text: string) => void
  addDocument: (d: Omit<Document, 'id' | 'createdAt'>, actorId: string) => void
  updateBuilding: (updates: Partial<Pick<Building, 'name' | 'nationalAddress' | 'totalArea' | 'commonAreas'>>, actorId: string) => void
}

const AppDataContext = createContext<AppDataContextType | null>(null)

function now() {
  return new Date().toISOString()
}

export function AppDataProvider({ buildingId, children }: { buildingId: string; children: ReactNode }) {
  const data = getBuildingData(buildingId)!
  const counter = useRef(200)
  const nextId = (prefix: string) => `${prefix}-${++counter.current}`

  // Compute area-based vote weights per Article 18.6
  const voterWeights = computeVoterWeights(
    data.owners, data.units, data.ownershipLinks, data.associationRoles
  )
  const eligibleVoterCount = voterWeights.length

  const [building, setBuilding] = useState<Building>({ ...data.building })
  const [decisions, setDecisions] = useState<Decision[]>([...data.decisions])
  const [votes, setVotes] = useState<Vote[]>([...data.votes])
  const [maintenanceRequests, setMaintenance] = useState<MaintenanceRequest[]>([...data.maintenanceRequests])
  const [documents, setDocuments] = useState<Document[]>([...data.documents])
  const [activityLog, setActivity] = useState<ActivityLog[]>([...data.activityLog])
  const [comments, setComments] = useState<Record<string, MaintenanceComment[]>>({})

  const getOwnerById = (id: string) => lookupOwner(id, data.owners)

  const addActivity = useCallback((entry: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    setActivity((prev) => [
      { ...entry, id: `act-${++counter.current}`, timestamp: now() },
      ...prev,
    ])
  }, [])

  // --- Queries ---

  const getDecisionVotes = useCallback(
    (decisionId: string) => votes.filter((v) => v.decisionId === decisionId),
    [votes]
  )

  const getUserVoteForDecision = useCallback(
    (userId: string, decisionId: string) =>
      votes.find((v) => v.voterId === userId && v.decisionId === decisionId),
    [votes]
  )

  const getDecisionsAwaitingVote = useCallback(
    (userId: string) =>
      decisions.filter(
        (d) => d.status === 'open' && !votes.some((v) => v.voterId === userId && v.decisionId === d.id)
      ),
    [decisions, votes]
  )

  const getComments = useCallback(
    (requestId: string) => comments[requestId] || [],
    [comments]
  )

  // --- Decision Mutations ---

  const addDecision = useCallback(
    (d: Omit<Decision, 'id' | 'createdAt' | 'status'>, actorId: string) => {
      const newDec: Decision = { ...d, id: nextId('dec'), status: 'open', createdAt: now() }
      setDecisions((prev) => [newDec, ...prev])
      const actor = getOwnerById(actorId)
      addActivity({
        actorId,
        action: 'create',
        entityType: 'decision',
        entityId: newDec.id,
        descriptionAr: `أنشأ ${actor?.fullName || ''} قرار جديد: ${d.title}`,
      })
    },
    [addActivity]
  )

  const computeResult = useCallback(
    (decisionId: string, allVotes: Vote[]) => {
      const dVotes = allVotes.filter((v) => v.decisionId === decisionId)
      const weighted = computeWeightedResult(dVotes, voterWeights)
      return {
        status: weighted.status as Decision['status'],
        result: weighted.resultText,
      }
    },
    [voterWeights]
  )

  const addVote = useCallback(
    (decisionId: string, voterId: string, option: Vote['option'], actorName: string) => {
      const newVote: Vote = { id: nextId('v'), decisionId, voterId, option, timestamp: now() }

      setVotes((prev) => {
        const updated = [...prev, newVote]

        // Check if all eligible voters have voted
        const decisionVoteCount = updated.filter((v) => v.decisionId === decisionId).length
        if (decisionVoteCount >= eligibleVoterCount) {
          const { status, result } = computeResult(decisionId, updated)
          setDecisions((dPrev) =>
            dPrev.map((d) => (d.id === decisionId ? { ...d, status, result } : d))
          )
        }
        return updated
      })

      const optionLabels: Record<string, string> = { approve: 'بالموافقة', reject: 'بالرفض', abstain: 'بالامتناع' }
      const decision = decisions.find((d) => d.id === decisionId)
      addActivity({
        actorId: voterId,
        action: 'vote',
        entityType: 'decision',
        entityId: decisionId,
        descriptionAr: `صوّت ${actorName} ${optionLabels[option]} على: ${decision?.title || ''}`,
      })
    },
    [decisions, addActivity, computeResult]
  )

  const changeVote = useCallback(
    (decisionId: string, voterId: string, newOption: Vote['option']) => {
      setVotes((prev) =>
        prev.map((v) =>
          v.decisionId === decisionId && v.voterId === voterId
            ? { ...v, option: newOption, timestamp: now() }
            : v
        )
      )
    },
    []
  )

  const closeDecision = useCallback(
    (decisionId: string, actorId: string) => {
      setVotes((currentVotes) => {
        const { status, result } = computeResult(decisionId, currentVotes)
        setDecisions((prev) =>
          prev.map((d) => (d.id === decisionId ? { ...d, status, result } : d))
        )
        return currentVotes
      })

      const actor = getOwnerById(actorId)
      const decision = decisions.find((d) => d.id === decisionId)
      addActivity({
        actorId,
        action: 'update',
        entityType: 'decision',
        entityId: decisionId,
        descriptionAr: `أغلق ${actor?.fullName || ''} التصويت على: ${decision?.title || ''}`,
      })
    },
    [decisions, addActivity, computeResult]
  )

  // --- Maintenance Mutations ---

  const addMaintenanceRequest = useCallback(
    (r: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>, actorId: string) => {
      const ts = now()
      const newReq: MaintenanceRequest = { ...r, id: nextId('mnt'), status: 'new', createdAt: ts, updatedAt: ts }
      setMaintenance((prev) => [newReq, ...prev])
      const actor = getOwnerById(actorId)
      addActivity({
        actorId,
        action: 'create',
        entityType: 'maintenance',
        entityId: newReq.id,
        descriptionAr: `أنشأ ${actor?.fullName || ''} طلب صيانة: ${r.title}`,
      })
    },
    [addActivity]
  )

  const updateRequestStatus = useCallback(
    (reqId: string, status: MaintenanceRequest['status'], actorId: string) => {
      setMaintenance((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status, updatedAt: now() } : r))
      )
      const actor = getOwnerById(actorId)
      const req = maintenanceRequests.find((r) => r.id === reqId)
      const statusLabels: Record<string, string> = {
        in_progress: 'بدأ التنفيذ',
        completed: 'اكتمل',
        cancelled: 'تم إلغاء',
      }
      addActivity({
        actorId,
        action: 'update',
        entityType: 'maintenance',
        entityId: reqId,
        descriptionAr: `${statusLabels[status] || status} طلب الصيانة: ${req?.title || ''}`,
      })
    },
    [maintenanceRequests, addActivity]
  )

  const assignVendor = useCallback(
    (reqId: string, vendor: string) => {
      setMaintenance((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, assignedVendor: vendor, updatedAt: now() } : r))
      )
    },
    []
  )

  const updateCosts = useCallback(
    (reqId: string, costs: { costEstimate?: number; finalCost?: number }) => {
      setMaintenance((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, ...costs, updatedAt: now() } : r))
      )
    },
    []
  )

  const addComment = useCallback(
    (reqId: string, authorId: string, text: string) => {
      const comment: MaintenanceComment = {
        id: nextId('cmt'),
        requestId: reqId,
        authorId,
        text,
        timestamp: now(),
      }
      setComments((prev) => ({
        ...prev,
        [reqId]: [...(prev[reqId] || []), comment],
      }))
    },
    []
  )

  // --- Document Mutations ---

  const addDocument = useCallback(
    (d: Omit<Document, 'id' | 'createdAt'>, actorId: string) => {
      const newDoc: Document = { ...d, id: nextId('doc'), createdAt: now() }
      setDocuments((prev) => [newDoc, ...prev])
      const actor = getOwnerById(actorId)
      addActivity({
        actorId,
        action: 'upload',
        entityType: 'document',
        entityId: newDoc.id,
        descriptionAr: `رفع ${actor?.fullName || ''} مستند: ${d.title}`,
      })
    },
    [addActivity]
  )

  // --- Building Mutation ---

  const updateBuilding = useCallback(
    (updates: Partial<Pick<Building, 'name' | 'nationalAddress' | 'totalArea' | 'commonAreas'>>, actorId: string) => {
      setBuilding((prev) => ({ ...prev, ...updates }))
      const actor = getOwnerById(actorId)
      addActivity({
        actorId,
        action: 'update',
        entityType: 'building',
        entityId: building.id,
        descriptionAr: `حدّث ${actor?.fullName || ''} بيانات المبنى`,
      })
    },
    [building.id, addActivity]
  )

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
