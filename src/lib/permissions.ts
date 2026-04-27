import type { AssociationRoleType } from '@/lib/types'

const CONTACT_ROLES: readonly AssociationRoleType[] = ['chairman', 'vice_chairman', 'manager']
const VOTING_ROLES: readonly AssociationRoleType[] = ['chairman', 'vice_chairman', 'board_member', 'owner']
const DECISION_CREATOR_ROLES: readonly AssociationRoleType[] = ['chairman', 'vice_chairman']
const MAINTENANCE_MANAGER_ROLES: readonly AssociationRoleType[] = ['chairman', 'vice_chairman', 'manager']
const ASSOCIATION_MANAGER_ROLES: readonly AssociationRoleType[] = ['chairman', 'vice_chairman']
const DOCUMENT_UPLOADER_ROLES: readonly AssociationRoleType[] = ['chairman', 'vice_chairman', 'manager']

export function canSeeContactDetails(role: AssociationRoleType): boolean {
  return CONTACT_ROLES.includes(role)
}

export function canSeeOwnersList(role: AssociationRoleType): boolean {
  return role !== 'resident'
}

export function canVote(role: AssociationRoleType): boolean {
  return VOTING_ROLES.includes(role)
}

export function canCreateDecision(role: AssociationRoleType): boolean {
  return DECISION_CREATOR_ROLES.includes(role)
}

export function canManageMaintenance(role: AssociationRoleType): boolean {
  return MAINTENANCE_MANAGER_ROLES.includes(role)
}

export function canManageAssociation(role: AssociationRoleType): boolean {
  return ASSOCIATION_MANAGER_ROLES.includes(role)
}

export function canUploadDocuments(role: AssociationRoleType): boolean {
  return DOCUMENT_UPLOADER_ROLES.includes(role)
}
