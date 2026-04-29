import type {
  Association,
  AssociationRoleType,
  Building,
  Decision,
  Document,
  MaintenanceRequest,
  Unit,
  Vote,
} from './types'

export const roleLabels = {
  chairman: 'رئيس الجمعية',
  vice_chairman: 'نائب الرئيس',
  board_member: 'عضو مجلس إدارة',
  manager: 'مدير العقار',
  owner: 'مالك',
  resident: 'مقيم',
} as const satisfies Record<AssociationRoleType, string>

export const buildingStatusLabels = {
  active: 'نشط',
  inactive: 'غير نشط',
} as const satisfies Record<Building['status'], string>

export const associationStatusLabels = {
  active: 'نشط',
  suspended: 'موقوف',
  under_formation: 'تحت التأسيس',
} as const satisfies Record<Association['status'], string>

export const decisionStatusLabels = {
  draft: 'مسودة',
  open: 'مفتوح',
  closed: 'مغلق',
  approved: 'معتمد',
  rejected: 'مرفوض',
} as const satisfies Record<Decision['status'], string>

export const maintenanceStatusLabels = {
  new: 'جديد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
} as const satisfies Record<MaintenanceRequest['status'], string>

export const occupancyStatusLabels = {
  vacant: 'شاغرة',
  occupied: 'مؤجرة',
  'owner-occupied': 'مالك مقيم',
} as const satisfies Record<Unit['occupancyStatus'], string>

export const priorityLabels = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
} as const satisfies Record<MaintenanceRequest['priority'], string>

export const decisionCategoryLabels = {
  financial: 'مالية',
  maintenance: 'صيانة',
  governance: 'حوكمة',
  general: 'عامة',
} as const satisfies Record<Decision['category'], string>

export const documentTypeLabels = {
  statute: 'نظام أساسي',
  minutes: 'محضر اجتماع',
  decision: 'قرار',
  invoice: 'فاتورة',
  contract: 'عقد',
  report: 'تقرير',
  other: 'أخرى',
} as const satisfies Record<Document['documentType'], string>

export const documentVisibilityLabels = {
  everyone: 'الجميع',
  board_only: 'مجلس الإدارة فقط',
  owners_only: 'الملاك فقط',
} as const satisfies Record<NonNullable<Document['visibility']>, string>

export const voteOptionLabels = {
  approve: 'موافق',
  reject: 'رافض',
  abstain: 'ممتنع',
} as const satisfies Record<Vote['option'], string>

export const unitStatusFilterItems = {
  all: 'كل الحالات',
  ...occupancyStatusLabels,
} as const

export const maintenanceStatusFilterItems = {
  all: 'كل الحالات',
  ...maintenanceStatusLabels,
} as const

export const priorityFilterItems = {
  all: 'كل الأولويات',
  ...priorityLabels,
} as const

export const documentTypeFilterItems = {
  all: 'كل الأنواع',
  statute: documentTypeLabels.statute,
  minutes: documentTypeLabels.minutes,
  invoice: documentTypeLabels.invoice,
  contract: documentTypeLabels.contract,
  report: documentTypeLabels.report,
} as const
