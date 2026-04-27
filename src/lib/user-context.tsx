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

export {
  canCreateDecision,
  canManageAssociation,
  canManageMaintenance,
  canSeeContactDetails,
  canSeeOwnersList,
  canUploadDocuments,
  canVote,
} from '@/lib/permissions'

interface UserContextType {
  userId: string
  role: AssociationRoleType
  userName: string
  switchUser: (userId: string) => void
  switchableUsers: { userId: string; role: AssociationRoleType }[]
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ buildingId, children }: { buildingId: string; children: ReactNode }) {
  const buildingData = getBuildingData(buildingId)

  if (!buildingData) {
    throw new Error(`Unknown building id: ${buildingId}`)
  }

  const data = buildingData
  const switchableUsers = useMemo(() => {
    const seen = new Set<AssociationRoleType>()
    const result: { userId: string; role: AssociationRoleType }[] = []

    for (const roleRecord of data.associationRoles) {
      if (!seen.has(roleRecord.role)) {
        seen.add(roleRecord.role)
        result.push({ userId: roleRecord.userId, role: roleRecord.role })
      }
    }

    return result
  }, [data.associationRoles])

  const defaultUser = switchableUsers[0] || {
    userId: data.owners[0]?.id || '',
    role: 'owner' as const,
  }
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
