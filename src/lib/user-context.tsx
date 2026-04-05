'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AssociationRoleType } from '@/lib/types'
import { getBuildingData, getOwnerById, getOwnerRole } from '@/lib/mock-data'

interface UserContextType {
  userId: string
  role: AssociationRoleType
  userName: string
  switchUser: (userId: string) => void
  switchableUsers: { userId: string; role: AssociationRoleType }[]
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ buildingId, children }: { buildingId: string; children: ReactNode }) {
  const data = getBuildingData(buildingId)!

  // Build switchable users for this building — one per distinct role
  const switchableUsers = useMemo(() => {
    const seen = new Set<AssociationRoleType>()
    const result: { userId: string; role: AssociationRoleType }[] = []
    for (const r of data.associationRoles) {
      if (!seen.has(r.role)) {
        seen.add(r.role)
        result.push({ userId: r.userId, role: r.role })
      }
    }
    return result
  }, [data.associationRoles])

  const defaultUser = switchableUsers[0] || { userId: data.owners[0]?.id || '', role: 'owner' as const }
  const [state, setState] = useState({ userId: defaultUser.userId, role: defaultUser.role })

  function switchUser(userId: string) {
    const roleRecord = getOwnerRole(userId, data.associationRoles)
    if (roleRecord) {
      setState({ userId, role: roleRecord.role })
    }
  }

  const owner = getOwnerById(state.userId, data.owners)

  return (
    <UserContext.Provider
      value={{
        userId: state.userId,
        role: state.role,
        userName: owner?.fullName || '',
        switchUser,
        switchableUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}

// ─── Permission helpers ───

export function canSeeContactDetails(role: AssociationRoleType): boolean {
  return ['chairman', 'vice_chairman', 'manager'].includes(role)
}

export function canSeeOwnersList(role: AssociationRoleType): boolean {
  return role !== 'resident'
}

export function canVote(role: AssociationRoleType): boolean {
  return ['chairman', 'vice_chairman', 'board_member', 'owner'].includes(role)
}

export function canCreateDecision(role: AssociationRoleType): boolean {
  return ['chairman', 'vice_chairman'].includes(role)
}

export function canManageMaintenance(role: AssociationRoleType): boolean {
  return ['chairman', 'vice_chairman', 'manager'].includes(role)
}

export function canManageAssociation(role: AssociationRoleType): boolean {
  return ['chairman', 'vice_chairman'].includes(role)
}

export function canUploadDocuments(role: AssociationRoleType): boolean {
  return ['chairman', 'vice_chairman', 'manager'].includes(role)
}
