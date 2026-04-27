'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/lib/app-data-context'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'

interface CreateDecisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDecisionDialog({ open, onOpenChange }: CreateDecisionDialogProps) {
  const { userId } = useUser()
  const appData = useAppData()
  const { toast } = useToast()

  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState<'financial' | 'maintenance' | 'governance' | 'general'>('general')
  const [formDeadline, setFormDeadline] = useState('')
  const [formErrors, setFormErrors] = useState<{ title?: boolean; description?: boolean }>({})

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  function resetForm() {
    setFormTitle('')
    setFormDescription('')
    setFormCategory('general')
    setFormDeadline('')
    setFormErrors({})
  }

  function handleCreateSubmit() {
    const errors: { title?: boolean; description?: boolean } = {}
    if (!formTitle.trim()) errors.title = true
    if (!formDescription.trim()) errors.description = true
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    appData.addDecision(
      {
        associationId: appData.association.id,
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        createdBy: userId,
        votingDeadline: formDeadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      },
      userId
    )

    toast('تم إنشاء القرار بنجاح ✓')
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>قرار جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="dec-title">عنوان القرار</Label>
            <Input
              id="dec-title"
              value={formTitle}
              onChange={(e) => {
                setFormTitle(e.target.value)
                if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: false }))
              }}
              placeholder="مثال: اعتماد ميزانية الصيانة"
            />
            {formErrors.title && (
              <p className="text-xs text-destructive">هذا الحقل مطلوب</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="dec-desc">الوصف</Label>
            <Textarea
              id="dec-desc"
              value={formDescription}
              onChange={(e) => {
                setFormDescription(e.target.value)
                if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: false }))
              }}
              placeholder="اشرح تفاصيل القرار المطروح للتصويت..."
              rows={3}
            />
            {formErrors.description && (
              <p className="text-xs text-destructive">هذا الحقل مطلوب</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>التصنيف</Label>
            <Select value={formCategory} onValueChange={(v) => setFormCategory(v as typeof formCategory)} items={{ financial: 'مالية', maintenance: 'صيانة', governance: 'حوكمة', general: 'عامة' }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">مالية</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
                <SelectItem value="governance">حوكمة</SelectItem>
                <SelectItem value="general">عامة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="dec-deadline">آخر موعد للتصويت</Label>
            <Input
              id="dec-deadline"
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
              min={todayStr}
            />
          </div>

        </div>

        <DialogFooter>
          <Button onClick={handleCreateSubmit}>
            إنشاء القرار
          </Button>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false) }}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
