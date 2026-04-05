export interface Building {
  id: string
  name: string
  type: 'tower' | 'apartment' | 'compound' | 'mixed'
  nationalAddress: string
  totalArea: number
  unitCount: number
  commonAreas: string[]
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Unit {
  id: string
  buildingId: string
  unitNumber: string
  floor: number
  area: number
  ownershipSharePercentage: number
  occupancyStatus: 'vacant' | 'occupied' | 'owner-occupied'
  notes?: string
}

export interface Owner {
  id: string
  fullName: string
  phone: string
  email: string
  nationalIdPlaceholder: string
  avatarUrl?: string
}

export interface OwnershipLink {
  id: string
  ownerId: string
  unitId: string
  sharePercentage: number
  isPrimaryRepresentative: boolean
  documentRefs?: string[]
}

export interface Association {
  id: string
  buildingId: string
  name: string
  registrationNumber: string
  status: 'active' | 'suspended' | 'under_formation'
  statuteFileUrl?: string
}

export type AssociationRoleType =
  | 'chairman'
  | 'vice_chairman'
  | 'board_member'
  | 'manager'
  | 'owner'
  | 'resident'

export interface AssociationRole {
  id: string
  userId: string
  associationId: string
  role: AssociationRoleType
  permissions?: Record<string, boolean>
}

export interface Decision {
  id: string
  associationId: string
  title: string
  description: string
  category: 'financial' | 'maintenance' | 'governance' | 'general'
  createdBy: string
  status: 'draft' | 'open' | 'closed' | 'approved' | 'rejected'
  votingDeadline: string
  result?: string
  createdAt: string
}

export interface Vote {
  id: string
  decisionId: string
  voterId: string
  option: 'approve' | 'reject' | 'abstain'
  timestamp: string
}

export interface MaintenanceRequest {
  id: string
  buildingId: string
  unitId?: string
  type: 'general' | 'private'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  title: string
  description: string
  requesterId: string
  assignedVendor?: string
  costEstimate?: number
  finalCost?: number
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  entityType: string
  entityId: string
  documentType:
    | 'statute'
    | 'minutes'
    | 'decision'
    | 'invoice'
    | 'contract'
    | 'report'
    | 'other'
  title: string
  fileUrl: string
  uploadedBy: string
  createdAt: string
  visibility?: 'everyone' | 'board_only' | 'owners_only'
  fileSize?: string
  notes?: string
}

export interface MaintenanceComment {
  id: string
  requestId: string
  authorId: string
  text: string
  timestamp: string
}

export interface ActivityLog {
  id: string
  actorId: string
  action: string
  entityType: string
  entityId: string
  descriptionAr: string
  timestamp: string
}

export interface Fee {
  id: string
  ownerId: string
  buildingId: string
  annualAmount: number
  paidAmount: number
  status: 'paid' | 'partial' | 'unpaid'
  lastPaymentDate?: string
}