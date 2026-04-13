'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getOwnerUnits } from '@/lib/mock-data'
import { useAppData } from '@/lib/app-data-context'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'

interface CreateRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  const { userId, role } = useUser()
  const appData = useAppData()
  const { toast } = useToast()

  const { units, ownershipLinks, building } = appData

  const isResident = role === 'resident'
  const userUnits = useMemo(
    () => getOwnerUnits(userId, ownershipLinks, units),
    [userId, ownershipLinks, units]
  )

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      // Reset form when opening
      setNewTitle('')
      setNewDescription('')
      setNewLocation(userUnits.length > 0 ? userUnits[0].id : 'common')
      setNewPriority('medium')
    }
    onOpenChange(nextOpen)
  }

  function handleCreateRequest() {
    if (!newTitle.trim() || !newDescription.trim()) return

    const isCommon = newLocation === 'common'
    appData.addMaintenanceRequest(
      {
        buildingId: building.id,
        unitId: isCommon ? undefined : newLocation,
        type: isCommon ? 'general' : 'private',
        priority: newPriority,
        title: newTitle.trim(),
        description: newDescription.trim(),
        requesterId: userId,
      },
      userId
    )
    toast('تم إنشاء طلب الصيانة')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>طلب صيانة جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>العنوان</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="عنوان الطلب"
              className="border-slate-200 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label>الوصف</Label>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="وصف تفصيلي للمشكلة"
              className="border-slate-200 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label>الموقع</Label>
            {(() => {
              const locationUnits = isResident ? userUnits : units
              const items = {
                ...(isResident ? {} : { common: 'المرافق المشتركة' }),
                ...Object.fromEntries(locationUnits.map((u) => [u.id, `الوحدة ${u.unitNumber}`])),
              }
              return (
                <Select value={newLocation} onValueChange={(v) => setNewLocation(v ?? '')} items={items}>
                  <SelectTrigger className="border-slate-200 focus:ring-ring">
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    {!isResident && <SelectItem value="common">المرافق المشتركة</SelectItem>}
                    {locationUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        الوحدة {u.unitNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            })()}
          </div>
          <div className="space-y-1.5">
            <Label>الأولوية</Label>
            <Select value={newPriority} onValueChange={(v) => setNewPriority(v as typeof newPriority)} items={{ urgent: 'عاجلة', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }}>
              <SelectTrigger className="border-slate-200 focus:ring-ring">
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">عاجلة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!newTitle.trim() || !newDescription.trim()}
            onClick={handleCreateRequest}
          >
            إنشاء الطلب
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
