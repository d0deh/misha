import type {
  Building,
  Unit,
  Owner,
  OwnershipLink,
  Association,
  AssociationRole,
  Decision,
  Vote,
  MaintenanceRequest,
  Document,
  ActivityLog,
  Fee,
} from './types'

// ===== BuildingDataset Interface =====
export interface BuildingDataset {
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
  fees?: Fee[]
}

// =============================================================================
// BUILDING 1 — برج الياسمين (Jeddah, 24 units)
// =============================================================================

const bld001Building: Building = {
  id: 'bld-001',
  name: 'برج الياسمين',
  type: 'tower',
  nationalAddress: 'RRRD2929 - حي الروضة، جدة 23434',
  totalArea: 4800,
  unitCount: 24,
  commonAreas: [
    'المواقف',
    'المصاعد',
    'السطح',
    'الممرات',
    'غرفة الحارس',
    'حديقة المدخل',
  ],
  status: 'active',
  createdAt: '2024-01-15',
}

const bld001Owners: Owner[] = [
  {
    id: 'own-001',
    fullName: 'عبدالله بن سعود الغامدي',
    phone: '0501234567',
    email: 'abdullah@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-002',
    fullName: 'فهد بن محمد العتيبي',
    phone: '0559876543',
    email: 'fahad@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-003',
    fullName: 'نورة بنت خالد الشهري',
    phone: '0543216789',
    email: 'noura@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-004',
    fullName: 'سلطان بن عبدالرحمن الدوسري',
    phone: '0567891234',
    email: 'sultan@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-005',
    fullName: 'منيرة بنت أحمد القحطاني',
    phone: '0578901234',
    email: 'muneera@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-006',
    fullName: 'خالد بن ناصر الحربي',
    phone: '0512345678',
    email: 'khaled@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-007',
    fullName: 'ريم بنت فيصل المالكي',
    phone: '0534567890',
    email: 'reem@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-008',
    fullName: 'ماجد بن عبدالعزيز الزهراني',
    phone: '0545678901',
    email: 'majed@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-009',
    fullName: 'هند بنت سعد البقمي',
    phone: '0556789012',
    email: 'hind@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-010',
    fullName: 'تركي بن حمد السبيعي',
    phone: '0567890123',
    email: 'turki@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-011',
    fullName: 'سارة بنت عمر العمري',
    phone: '0578901234',
    email: 'sarah@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-012',
    fullName: 'بندر بن يوسف الشمراني',
    phone: '0589012345',
    email: 'bandar@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
]

const bld001Units: Unit[] = Array.from({ length: 24 }, (_, i) => {
  const floor = Math.floor(i / 4) + 1
  const unitOnFloor = (i % 4) + 1
  const unitNumber = `${floor}0${unitOnFloor}`
  const areas = [120, 150, 130, 140]
  const area = areas[i % 4]
  const statuses: Unit['occupancyStatus'][] = [
    'owner-occupied',
    'occupied',
    'vacant',
  ]

  return {
    id: `unit-${String(i + 1).padStart(3, '0')}`,
    buildingId: 'bld-001',
    unitNumber,
    floor,
    area,
    ownershipSharePercentage: +(100 / 24).toFixed(2),
    occupancyStatus: i < 16 ? statuses[i % 3] : i < 20 ? 'occupied' : 'vacant',
    notes: i === 23 ? 'وحدة تحت التجديد' : undefined,
  }
})

const bld001OwnershipLinks: OwnershipLink[] = [
  ...bld001Owners.flatMap((owner, i) => {
    const unitIndices =
      i < 8 ? [i * 2, i * 2 + 1] : [16 + (i - 8) * 2, 16 + (i - 8) * 2 + 1]
    return unitIndices
      .filter((idx) => idx < 24)
      .map((idx, j) => ({
        id: `ol-${String(i * 2 + j + 1).padStart(3, '0')}`,
        ownerId: owner.id,
        unitId: bld001Units[idx].id,
        sharePercentage: 100,
        isPrimaryRepresentative: j === 0,
      }))
  }),
]

const bld001Association: Association = {
  id: 'assoc-001',
  buildingId: 'bld-001',
  name: 'جمعية ملاك برج الياسمين',
  registrationNumber: 'REGA-JED-2024-0847',
  status: 'active',
}

const bld001AssociationRoles: AssociationRole[] = [
  {
    id: 'role-001',
    userId: 'own-001',
    associationId: 'assoc-001',
    role: 'chairman',
  },
  {
    id: 'role-002',
    userId: 'own-002',
    associationId: 'assoc-001',
    role: 'vice_chairman',
  },
  {
    id: 'role-003',
    userId: 'own-003',
    associationId: 'assoc-001',
    role: 'board_member',
  },
  {
    id: 'role-004',
    userId: 'own-004',
    associationId: 'assoc-001',
    role: 'board_member',
  },
  {
    id: 'role-005',
    userId: 'own-005',
    associationId: 'assoc-001',
    role: 'manager',
  },
  ...bld001Owners.slice(5, -1).map((owner, i) => ({
    id: `role-${String(i + 6).padStart(3, '0')}`,
    userId: owner.id,
    associationId: 'assoc-001',
    role: 'owner' as const,
  })),
  {
    id: 'role-012',
    userId: 'own-012',
    associationId: 'assoc-001',
    role: 'resident',
  },
]

const bld001Decisions: Decision[] = [
  {
    id: 'dec-001',
    associationId: 'assoc-001',
    title: 'اعتماد ميزانية الصيانة السنوية',
    description:
      'التصويت على اعتماد ميزانية الصيانة للعام القادم بمبلغ ١٢٠,٠٠٠ ريال، تشمل صيانة المصاعد والمكيفات المركزية وأعمال النظافة والحراسة.',
    category: 'financial',
    createdBy: 'own-001',
    status: 'open',
    votingDeadline: '2026-04-15',
    createdAt: '2026-03-20',
  },
  {
    id: 'dec-002',
    associationId: 'assoc-001',
    title: 'تجديد عقد شركة الصيانة',
    description:
      'التصويت على تجديد عقد شركة الأمانة للصيانة لمدة سنة إضافية بنفس الشروط الحالية مع زيادة ٥٪ في قيمة العقد.',
    category: 'maintenance',
    createdBy: 'own-001',
    status: 'open',
    votingDeadline: '2026-04-10',
    createdAt: '2026-03-18',
  },
  {
    id: 'dec-003',
    associationId: 'assoc-001',
    title: 'تعديل النظام الأساسي للجمعية',
    description:
      'التصويت على تعديل المادة الثامنة من النظام الأساسي المتعلقة بنصاب الحضور في الجمعيات العمومية من ٥١٪ إلى ٤٠٪.',
    category: 'governance',
    createdBy: 'own-002',
    status: 'open',
    votingDeadline: '2026-04-20',
    createdAt: '2026-03-25',
  },
  {
    id: 'dec-004',
    associationId: 'assoc-001',
    title: 'تركيب كاميرات مراقبة إضافية',
    description:
      'تم التصويت على تركيب ٨ كاميرات مراقبة إضافية في المداخل والمواقف بتكلفة ١٥,٠٠٠ ريال.',
    category: 'general',
    createdBy: 'own-001',
    status: 'approved',
    votingDeadline: '2026-02-28',
    result: 'تمت الموافقة بأغلبية ٩ أصوات من أصل ١٢',
    createdAt: '2026-02-10',
  },
  {
    id: 'dec-005',
    associationId: 'assoc-001',
    title: 'إنشاء صالة رياضية في السطح',
    description:
      'تم التصويت على تحويل جزء من السطح إلى صالة رياضية مشتركة بتكلفة ٤٥,٠٠٠ ريال.',
    category: 'general',
    createdBy: 'own-003',
    status: 'rejected',
    votingDeadline: '2026-01-31',
    result: 'رُفض الاقتراح بأغلبية ٧ أصوات رفض مقابل ٥ موافقة',
    createdAt: '2026-01-15',
  },
]

const bld001Votes: Vote[] = [
  // Votes for dec-001 (open — partial)
  { id: 'v-001', decisionId: 'dec-001', voterId: 'own-002', option: 'approve', timestamp: '2026-03-21T10:00:00' },
  { id: 'v-002', decisionId: 'dec-001', voterId: 'own-003', option: 'approve', timestamp: '2026-03-21T11:30:00' },
  { id: 'v-003', decisionId: 'dec-001', voterId: 'own-006', option: 'reject', timestamp: '2026-03-22T09:00:00' },
  { id: 'v-004', decisionId: 'dec-001', voterId: 'own-007', option: 'approve', timestamp: '2026-03-22T14:00:00' },
  { id: 'v-005', decisionId: 'dec-001', voterId: 'own-010', option: 'abstain', timestamp: '2026-03-23T08:00:00' },

  // Votes for dec-002 (open — partial)
  { id: 'v-006', decisionId: 'dec-002', voterId: 'own-002', option: 'approve', timestamp: '2026-03-19T10:00:00' },
  { id: 'v-007', decisionId: 'dec-002', voterId: 'own-004', option: 'reject', timestamp: '2026-03-19T15:00:00' },
  { id: 'v-008', decisionId: 'dec-002', voterId: 'own-008', option: 'approve', timestamp: '2026-03-20T09:00:00' },

  // Votes for dec-003 (open — partial)
  { id: 'v-009', decisionId: 'dec-003', voterId: 'own-004', option: 'approve', timestamp: '2026-03-26T10:00:00' },
  { id: 'v-010', decisionId: 'dec-003', voterId: 'own-006', option: 'approve', timestamp: '2026-03-26T12:00:00' },

  // Votes for dec-004 (closed — approved)
  { id: 'v-011', decisionId: 'dec-004', voterId: 'own-001', option: 'approve', timestamp: '2026-02-12T10:00:00' },
  { id: 'v-012', decisionId: 'dec-004', voterId: 'own-002', option: 'approve', timestamp: '2026-02-12T11:00:00' },
  { id: 'v-013', decisionId: 'dec-004', voterId: 'own-003', option: 'approve', timestamp: '2026-02-13T09:00:00' },
  { id: 'v-014', decisionId: 'dec-004', voterId: 'own-004', option: 'approve', timestamp: '2026-02-13T10:00:00' },
  { id: 'v-015', decisionId: 'dec-004', voterId: 'own-005', option: 'approve', timestamp: '2026-02-14T08:00:00' },
  { id: 'v-016', decisionId: 'dec-004', voterId: 'own-006', option: 'reject', timestamp: '2026-02-14T09:00:00' },
  { id: 'v-017', decisionId: 'dec-004', voterId: 'own-007', option: 'approve', timestamp: '2026-02-15T10:00:00' },
  { id: 'v-018', decisionId: 'dec-004', voterId: 'own-008', option: 'approve', timestamp: '2026-02-15T11:00:00' },
  { id: 'v-019', decisionId: 'dec-004', voterId: 'own-009', option: 'reject', timestamp: '2026-02-16T09:00:00' },
  { id: 'v-020', decisionId: 'dec-004', voterId: 'own-010', option: 'approve', timestamp: '2026-02-16T10:00:00' },
  { id: 'v-021', decisionId: 'dec-004', voterId: 'own-011', option: 'approve', timestamp: '2026-02-17T09:00:00' },
  { id: 'v-022', decisionId: 'dec-004', voterId: 'own-012', option: 'reject', timestamp: '2026-02-17T10:00:00' },

  // Votes for dec-005 (closed — rejected)
  { id: 'v-023', decisionId: 'dec-005', voterId: 'own-001', option: 'reject', timestamp: '2026-01-18T10:00:00' },
  { id: 'v-024', decisionId: 'dec-005', voterId: 'own-002', option: 'approve', timestamp: '2026-01-18T11:00:00' },
  { id: 'v-025', decisionId: 'dec-005', voterId: 'own-003', option: 'approve', timestamp: '2026-01-19T09:00:00' },
  { id: 'v-026', decisionId: 'dec-005', voterId: 'own-004', option: 'reject', timestamp: '2026-01-19T10:00:00' },
  { id: 'v-027', decisionId: 'dec-005', voterId: 'own-005', option: 'reject', timestamp: '2026-01-20T08:00:00' },
  { id: 'v-028', decisionId: 'dec-005', voterId: 'own-006', option: 'reject', timestamp: '2026-01-20T09:00:00' },
  { id: 'v-029', decisionId: 'dec-005', voterId: 'own-007', option: 'approve', timestamp: '2026-01-21T10:00:00' },
  { id: 'v-030', decisionId: 'dec-005', voterId: 'own-008', option: 'reject', timestamp: '2026-01-21T11:00:00' },
  { id: 'v-031', decisionId: 'dec-005', voterId: 'own-009', option: 'approve', timestamp: '2026-01-22T09:00:00' },
  { id: 'v-032', decisionId: 'dec-005', voterId: 'own-010', option: 'reject', timestamp: '2026-01-22T10:00:00' },
  { id: 'v-033', decisionId: 'dec-005', voterId: 'own-011', option: 'approve', timestamp: '2026-01-23T09:00:00' },
  { id: 'v-034', decisionId: 'dec-005', voterId: 'own-012', option: 'reject', timestamp: '2026-01-23T10:00:00' },
]

const bld001MaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'mnt-001',
    buildingId: 'bld-001',
    type: 'general',
    priority: 'high',
    status: 'in_progress',
    title: 'تسرب مياه من سقف الطابق الثالث',
    description: 'لوحظ تسرب مائي في سقف الشقة ٣٠٢ بالقرب من المكيف المركزي، يزداد عند تشغيل التكييف',
    requesterId: 'own-003',
    assignedVendor: 'شركة أوتيس للمصاعد',
    costEstimate: 8500,
    createdAt: '2026-03-28',
    updatedAt: '2026-03-29',
  },
  {
    id: 'mnt-002',
    buildingId: 'bld-001',
    type: 'general',
    priority: 'urgent',
    status: 'new',
    title: 'عطل في نظام الإنذار بالطابق الأرضي',
    description: 'نظام إنذار الحريق في الطابق الأرضي يصدر إنذارات كاذبة متكررة منذ أسبوعين',
    requesterId: 'own-006',
    createdAt: '2026-03-30',
    updatedAt: '2026-03-30',
  },
  {
    id: 'mnt-003',
    buildingId: 'bld-001',
    unitId: 'unit-005',
    type: 'private',
    priority: 'medium',
    status: 'completed',
    title: 'كسر في بلاط مدخل المبنى',
    description: 'بلاط المدخل الرئيسي مكسور في ثلاث نقاط ويشكل خطراً على المشاة',
    requesterId: 'own-003',
    assignedVendor: 'مؤسسة الراشد للسباكة',
    costEstimate: 600,
    finalCost: 550,
    createdAt: '2026-03-10',
    updatedAt: '2026-03-15',
  },
  {
    id: 'mnt-004',
    buildingId: 'bld-001',
    type: 'general',
    priority: 'low',
    status: 'completed',
    title: 'صيانة دورية للمصاعد',
    description: 'موعد الصيانة الدورية الربع سنوية للمصعدين، تشمل فحص الحبال والفرامل والأبواب',
    requesterId: 'own-005',
    assignedVendor: 'شركة التبريد السعودية',
    costEstimate: 3000,
    finalCost: 3000,
    createdAt: '2026-03-01',
    updatedAt: '2026-03-05',
  },
  {
    id: 'mnt-005',
    buildingId: 'bld-001',
    type: 'general',
    priority: 'medium',
    status: 'in_progress',
    title: 'تعطل مضخة المياه الرئيسية',
    description: 'مضخة المياه الرئيسية للخزان العلوي معطلة منذ يومين، يتم الاعتماد على المضخة الاحتياطية',
    requesterId: 'own-007',
    assignedVendor: 'مؤسسة النور الكهربائية',
    costEstimate: 1200,
    createdAt: '2026-03-22',
    updatedAt: '2026-03-25',
  },
  {
    id: 'mnt-006',
    buildingId: 'bld-001',
    unitId: 'unit-010',
    type: 'private',
    priority: 'high',
    status: 'new',
    title: 'خلل في إضاءة الممرات',
    description: 'إضاءة الممرات في الطوابق ٢ و٣ و٤ لا تعمل بشكل صحيح، تومض باستمرار',
    requesterId: 'own-005',
    createdAt: '2026-03-29',
    updatedAt: '2026-03-29',
  },
  {
    id: 'mnt-007',
    buildingId: 'bld-001',
    type: 'general',
    priority: 'medium',
    status: 'cancelled',
    title: 'صيانة نظام التكييف المركزي',
    description: 'نظام التكييف المركزي يحتاج صيانة شاملة قبل فصل الصيف',
    requesterId: 'own-001',
    costEstimate: 45000,
    createdAt: '2026-02-15',
    updatedAt: '2026-03-01',
  },
  {
    id: 'mnt-008',
    buildingId: 'bld-001',
    unitId: 'unit-018',
    type: 'private',
    priority: 'low',
    status: 'new',
    title: 'إصلاح باب المواقف الآلي',
    description: 'باب المواقف الآلي لا يفتح بالريموت ويحتاج إعادة برمجة',
    requesterId: 'own-009',
    createdAt: '2026-03-27',
    updatedAt: '2026-03-27',
  },
]

const bld001Documents: Document[] = [
  {
    id: 'doc-001',
    entityType: 'association',
    entityId: 'assoc-001',
    documentType: 'statute',
    title: 'النظام الأساسي لجمعية ملاك برج الياسمين',
    fileUrl: '/documents/statute.pdf',
    uploadedBy: 'own-001',
    createdAt: '2024-01-20',
  },
  {
    id: 'doc-002',
    entityType: 'association',
    entityId: 'assoc-001',
    documentType: 'minutes',
    title: 'محضر اجتماع الجمعية العمومية — يناير ٢٠٢٦',
    fileUrl: '/documents/minutes-q1-2026.pdf',
    uploadedBy: 'own-001',
    createdAt: '2026-01-30',
  },
  {
    id: 'doc-003',
    entityType: 'building',
    entityId: 'bld-001',
    documentType: 'invoice',
    title: 'فاتورة صيانة المصاعد — الربع الأول ٢٠٢٦',
    fileUrl: '/documents/board-minutes-mar-2026.pdf',
    uploadedBy: 'own-002',
    createdAt: '2026-03-15',
  },
  {
    id: 'doc-004',
    entityType: 'building',
    entityId: 'bld-001',
    documentType: 'contract',
    title: 'عقد صيانة المصاعد مع شركة الأمانة ٢٠٢٦',
    fileUrl: '/documents/elevator-invoice-feb-2026.pdf',
    uploadedBy: 'own-005',
    createdAt: '2026-02-28',
  },
  {
    id: 'doc-005',
    entityType: 'building',
    entityId: 'bld-001',
    documentType: 'report',
    title: 'تقرير حالة المبنى السنوي ٢٠٢٥',
    fileUrl: '/documents/cleaning-invoice-mar-2026.pdf',
    uploadedBy: 'own-005',
    createdAt: '2026-03-25',
  },
  {
    id: 'doc-006',
    entityType: 'building',
    entityId: 'bld-001',
    documentType: 'invoice',
    title: 'فاتورة كهرباء مارس ٢٠٢٦',
    fileUrl: '/documents/maintenance-contract.pdf',
    uploadedBy: 'own-001',
    createdAt: '2025-06-01',
  },
]

const bld001ActivityLog: ActivityLog[] = [
  {
    id: 'act-001',
    actorId: 'own-006',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-002',
    descriptionAr: 'أنشأ خالد الحربي طلب صيانة: تسرب مياه في موقف السيارات',
    timestamp: '2026-03-30T14:30:00',
  },
  {
    id: 'act-002',
    actorId: 'own-005',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-006',
    descriptionAr: 'أنشأت منيرة القحطاني طلب صيانة: مشكلة في التكييف',
    timestamp: '2026-03-29T16:00:00',
  },
  {
    id: 'act-003',
    actorId: 'own-001',
    action: 'update',
    entityType: 'maintenance',
    entityId: 'mnt-001',
    descriptionAr: 'تم تعيين شركة أوتيس للمصاعد لإصلاح المصعد الرئيسي',
    timestamp: '2026-03-29T10:00:00',
  },
  {
    id: 'act-004',
    actorId: 'own-009',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-008',
    descriptionAr: 'أنشأت هند البقمي طلب صيانة: تغيير قفل الباب الرئيسي',
    timestamp: '2026-03-27T11:00:00',
  },
  {
    id: 'act-005',
    actorId: 'own-004',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-003',
    descriptionAr: 'صوّت سلطان الدوسري بالموافقة على: تعديل النظام الأساسي للجمعية',
    timestamp: '2026-03-26T10:00:00',
  },
  {
    id: 'act-006',
    actorId: 'own-006',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-003',
    descriptionAr: 'صوّت خالد الحربي بالموافقة على: تعديل النظام الأساسي للجمعية',
    timestamp: '2026-03-26T12:00:00',
  },
  {
    id: 'act-007',
    actorId: 'own-002',
    action: 'create',
    entityType: 'decision',
    entityId: 'dec-003',
    descriptionAr: 'أنشأ فهد العتيبي قرار جديد: تعديل النظام الأساسي للجمعية',
    timestamp: '2026-03-25T09:00:00',
  },
  {
    id: 'act-008',
    actorId: 'own-005',
    action: 'upload',
    entityType: 'document',
    entityId: 'doc-005',
    descriptionAr: 'رفعت منيرة القحطاني مستند: فاتورة شركة النظافة - مارس ٢٠٢٦',
    timestamp: '2026-03-25T08:00:00',
  },
  {
    id: 'act-009',
    actorId: 'own-007',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-005',
    descriptionAr: 'أنشأت ريم المالكي طلب صيانة: إصلاح إنارة الممرات',
    timestamp: '2026-03-22T15:00:00',
  },
  {
    id: 'act-010',
    actorId: 'own-010',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-001',
    descriptionAr: 'امتنع تركي السبيعي عن التصويت على: اعتماد ميزانية الصيانة السنوية',
    timestamp: '2026-03-23T08:00:00',
  },
  {
    id: 'act-011',
    actorId: 'own-006',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-001',
    descriptionAr: 'صوّت خالد الحربي بالرفض على: اعتماد ميزانية الصيانة السنوية',
    timestamp: '2026-03-22T09:00:00',
  },
  {
    id: 'act-012',
    actorId: 'own-001',
    action: 'create',
    entityType: 'decision',
    entityId: 'dec-001',
    descriptionAr: 'أنشأ عبدالله الغامدي قرار جديد: اعتماد ميزانية الصيانة السنوية',
    timestamp: '2026-03-20T09:00:00',
  },
  {
    id: 'act-013',
    actorId: 'own-008',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-002',
    descriptionAr: 'صوّت ماجد الزهراني بالموافقة على: تجديد عقد شركة الصيانة',
    timestamp: '2026-03-20T09:00:00',
  },
  {
    id: 'act-014',
    actorId: 'own-003',
    action: 'update',
    entityType: 'maintenance',
    entityId: 'mnt-003',
    descriptionAr: 'تم إكمال طلب الصيانة: إصلاح تسرب في الحمام',
    timestamp: '2026-03-15T14:00:00',
  },
  {
    id: 'act-015',
    actorId: 'own-002',
    action: 'upload',
    entityType: 'document',
    entityId: 'doc-003',
    descriptionAr: 'رفع فهد العتيبي مستند: محضر اجتماع مجلس الإدارة - مارس ٢٠٢٦',
    timestamp: '2026-03-15T10:00:00',
  },
  {
    id: 'act-016',
    actorId: 'own-001',
    action: 'create',
    entityType: 'decision',
    entityId: 'dec-002',
    descriptionAr: 'أنشأ عبدالله الغامدي قرار جديد: تجديد عقد شركة الصيانة',
    timestamp: '2026-03-18T09:00:00',
  },
]

const bld001Fees: Fee[] = [
  { id: 'fee-001', ownerId: 'own-001', buildingId: 'bld-001', annualAmount: 13500, paidAmount: 13500, status: 'paid', lastPaymentDate: '2026-02-15' },
  { id: 'fee-002', ownerId: 'own-002', buildingId: 'bld-001', annualAmount: 14000, paidAmount: 14000, status: 'paid', lastPaymentDate: '2026-03-01' },
  { id: 'fee-003', ownerId: 'own-003', buildingId: 'bld-001', annualAmount: 12500, paidAmount: 12500, status: 'paid', lastPaymentDate: '2026-01-20' },
  { id: 'fee-004', ownerId: 'own-004', buildingId: 'bld-001', annualAmount: 13000, paidAmount: 13000, status: 'paid', lastPaymentDate: '2026-02-28' },
  { id: 'fee-005', ownerId: 'own-005', buildingId: 'bld-001', annualAmount: 14500, paidAmount: 14500, status: 'paid', lastPaymentDate: '2026-03-10' },
  { id: 'fee-006', ownerId: 'own-006', buildingId: 'bld-001', annualAmount: 13500, paidAmount: 13500, status: 'paid', lastPaymentDate: '2026-01-05' },
  { id: 'fee-007', ownerId: 'own-007', buildingId: 'bld-001', annualAmount: 14000, paidAmount: 14000, status: 'paid', lastPaymentDate: '2026-02-10' },
  { id: 'fee-008', ownerId: 'own-008', buildingId: 'bld-001', annualAmount: 12500, paidAmount: 7500, status: 'partial', lastPaymentDate: '2026-01-15' },
  { id: 'fee-009', ownerId: 'own-009', buildingId: 'bld-001', annualAmount: 13000, paidAmount: 8000, status: 'partial', lastPaymentDate: '2025-12-20' },
  { id: 'fee-010', ownerId: 'own-010', buildingId: 'bld-001', annualAmount: 14500, paidAmount: 5000, status: 'partial', lastPaymentDate: '2025-11-10' },
  { id: 'fee-011', ownerId: 'own-011', buildingId: 'bld-001', annualAmount: 13500, paidAmount: 0, status: 'unpaid' },
  { id: 'fee-012', ownerId: 'own-012', buildingId: 'bld-001', annualAmount: 14000, paidAmount: 0, status: 'unpaid' },
]

export const bld001Data: BuildingDataset = {
  building: bld001Building,
  owners: bld001Owners,
  units: bld001Units,
  ownershipLinks: bld001OwnershipLinks,
  association: bld001Association,
  associationRoles: bld001AssociationRoles,
  decisions: bld001Decisions,
  votes: bld001Votes,
  maintenanceRequests: bld001MaintenanceRequests,
  documents: bld001Documents,
  activityLog: bld001ActivityLog,
  fees: bld001Fees,
}

// =============================================================================
// BUILDING 2 — عمارة النخيل (Riyadh, 8 units)
// =============================================================================

const bld002Building: Building = {
  id: 'bld-002',
  name: 'عمارة النخيل',
  type: 'apartment',
  nationalAddress: 'RBBB4512 - حي العليا، الرياض 12211',
  totalArea: 960,
  unitCount: 8,
  commonAreas: ['المواقف', 'المدخل', 'الممرات', 'السطح'],
  status: 'active',
  createdAt: '2025-03-01',
}

const bld002Owners: Owner[] = [
  {
    id: 'own-101',
    fullName: 'سعد بن عبدالله المطيري',
    phone: '0551112233',
    email: 'saad@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-102',
    fullName: 'لطيفة بنت حمد الراشد',
    phone: '0542223344',
    email: 'lateefa@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-103',
    fullName: 'عبدالعزيز بن صالح النفيسة',
    phone: '0563334455',
    email: 'abdulaziz@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-104',
    fullName: 'مها بنت فهد الجبرين',
    phone: '0574445566',
    email: 'maha@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
]

const bld002Units: Unit[] = Array.from({ length: 8 }, (_, i) => {
  const floor = Math.floor(i / 4) + 1
  const unitOnFloor = (i % 4) + 1
  const unitNumber = `${floor}0${unitOnFloor}`
  const areas = [80, 95, 85, 90]
  const area = areas[i % 4]
  const statuses: Unit['occupancyStatus'][] = [
    'owner-occupied',
    'occupied',
    'vacant',
  ]

  return {
    id: `unit-${String(i + 101).padStart(3, '0')}`,
    buildingId: 'bld-002',
    unitNumber,
    floor,
    area,
    ownershipSharePercentage: +(100 / 8).toFixed(2),
    occupancyStatus: statuses[i % 3],
  }
})

const bld002OwnershipLinks: OwnershipLink[] = bld002Owners.flatMap((owner, i) => {
  const unitIndices = [i * 2, i * 2 + 1]
  return unitIndices.map((idx, j) => ({
    id: `ol-${String(101 + i * 2 + j).padStart(3, '0')}`,
    ownerId: owner.id,
    unitId: bld002Units[idx].id,
    sharePercentage: 100,
    isPrimaryRepresentative: j === 0,
  }))
})

const bld002Association: Association = {
  id: 'assoc-002',
  buildingId: 'bld-002',
  name: 'جمعية ملاك عمارة النخيل',
  registrationNumber: 'REGA-RUH-2025-0312',
  status: 'active',
}

const bld002AssociationRoles: AssociationRole[] = [
  {
    id: 'role-101',
    userId: 'own-101',
    associationId: 'assoc-002',
    role: 'chairman',
  },
  {
    id: 'role-102',
    userId: 'own-102',
    associationId: 'assoc-002',
    role: 'manager',
  },
  {
    id: 'role-103',
    userId: 'own-103',
    associationId: 'assoc-002',
    role: 'owner',
  },
  {
    id: 'role-104',
    userId: 'own-104',
    associationId: 'assoc-002',
    role: 'owner',
  },
]

const bld002Decisions: Decision[] = [
  {
    id: 'dec-101',
    associationId: 'assoc-002',
    title: 'تركيب بوابة إلكترونية للمبنى',
    description:
      'التصويت على تركيب بوابة إلكترونية للمدخل الرئيسي بتكلفة تقديرية ١٥,٠٠٠ ريال لتعزيز أمن المبنى.',
    category: 'general',
    createdBy: 'own-101',
    status: 'open',
    votingDeadline: '2026-04-20',
    createdAt: '2026-03-25',
  },
  {
    id: 'dec-102',
    associationId: 'assoc-002',
    title: 'تجديد عقد الحراسة',
    description:
      'تم التصويت على تجديد عقد شركة الحماية الوطنية للحراسة لمدة سنة بمبلغ ٣٦,٠٠٠ ريال.',
    category: 'maintenance',
    createdBy: 'own-101',
    status: 'approved',
    votingDeadline: '2026-03-15',
    result: 'تمت الموافقة بأغلبية ٣ أصوات',
    createdAt: '2026-03-01',
  },
]

const bld002Votes: Vote[] = [
  // Votes for dec-101 (open — partial)
  { id: 'v-101', decisionId: 'dec-101', voterId: 'own-103', option: 'approve', timestamp: '2026-03-26T10:00:00' },

  // Votes for dec-102 (closed — approved)
  { id: 'v-102', decisionId: 'dec-102', voterId: 'own-101', option: 'approve', timestamp: '2026-03-05T10:00:00' },
  { id: 'v-103', decisionId: 'dec-102', voterId: 'own-103', option: 'approve', timestamp: '2026-03-06T09:00:00' },
  { id: 'v-104', decisionId: 'dec-102', voterId: 'own-104', option: 'approve', timestamp: '2026-03-07T11:00:00' },
  { id: 'v-105', decisionId: 'dec-102', voterId: 'own-102', option: 'reject', timestamp: '2026-03-08T14:00:00' },
]

const bld002MaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'mnt-101',
    buildingId: 'bld-002',
    type: 'general',
    priority: 'urgent',
    status: 'new',
    title: 'تسرب في السطح',
    description: 'تسرب مياه أمطار من السطح يؤثر على شقق الطابق الثاني.',
    requesterId: 'own-101',
    createdAt: '2026-03-28',
    updatedAt: '2026-03-28',
  },
  {
    id: 'mnt-102',
    buildingId: 'bld-002',
    type: 'general',
    priority: 'medium',
    status: 'in_progress',
    title: 'عطل في الإنارة الخارجية',
    description: 'إنارة المدخل والمواقف متوقفة عن العمل منذ أسبوع.',
    requesterId: 'own-102',
    assignedVendor: 'مؤسسة الضياء الكهربائية',
    costEstimate: 2500,
    createdAt: '2026-03-20',
    updatedAt: '2026-03-22',
  },
  {
    id: 'mnt-103',
    buildingId: 'bld-002',
    type: 'general',
    priority: 'low',
    status: 'completed',
    title: 'إصلاح باب المدخل الرئيسي',
    description: 'مفصلة الباب الرئيسي مكسورة وتحتاج استبدال.',
    requesterId: 'own-103',
    assignedVendor: 'مؤسسة الإتقان',
    costEstimate: 800,
    finalCost: 750,
    createdAt: '2026-03-05',
    updatedAt: '2026-03-10',
  },
]

const bld002Documents: Document[] = [
  {
    id: 'doc-101',
    entityType: 'association',
    entityId: 'assoc-002',
    documentType: 'statute',
    title: 'النظام الأساسي لجمعية ملاك عمارة النخيل',
    fileUrl: '/documents/bld002-statute.pdf',
    uploadedBy: 'own-101',
    createdAt: '2025-03-10',
  },
  {
    id: 'doc-102',
    entityType: 'association',
    entityId: 'assoc-002',
    documentType: 'minutes',
    title: 'محضر الجمعية العمومية التأسيسية',
    fileUrl: '/documents/bld002-founding-minutes.pdf',
    uploadedBy: 'own-101',
    createdAt: '2025-03-15',
  },
]

const bld002ActivityLog: ActivityLog[] = [
  {
    id: 'act-101',
    actorId: 'own-101',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-101',
    descriptionAr: 'أنشأ سعد المطيري طلب صيانة: تسرب في السطح',
    timestamp: '2026-03-28T09:00:00',
  },
  {
    id: 'act-102',
    actorId: 'own-103',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-101',
    descriptionAr: 'صوّت عبدالعزيز النفيسة بالموافقة على: تركيب بوابة إلكترونية للمبنى',
    timestamp: '2026-03-26T10:00:00',
  },
  {
    id: 'act-103',
    actorId: 'own-101',
    action: 'create',
    entityType: 'decision',
    entityId: 'dec-101',
    descriptionAr: 'أنشأ سعد المطيري قرار جديد: تركيب بوابة إلكترونية للمبنى',
    timestamp: '2026-03-25T08:00:00',
  },
  {
    id: 'act-104',
    actorId: 'own-102',
    action: 'update',
    entityType: 'maintenance',
    entityId: 'mnt-102',
    descriptionAr: 'تم تعيين مؤسسة الضياء الكهربائية لإصلاح الإنارة الخارجية',
    timestamp: '2026-03-22T11:00:00',
  },
  {
    id: 'act-105',
    actorId: 'own-102',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-102',
    descriptionAr: 'أنشأت لطيفة الراشد طلب صيانة: عطل في الإنارة الخارجية',
    timestamp: '2026-03-20T14:00:00',
  },
]

const bld002Fees: Fee[] = [
  { id: 'fee-101', ownerId: 'own-101', buildingId: 'bld-002', annualAmount: 8750, paidAmount: 8750, status: 'paid', lastPaymentDate: '2026-02-20' },
  { id: 'fee-102', ownerId: 'own-102', buildingId: 'bld-002', annualAmount: 9250, paidAmount: 9250, status: 'paid', lastPaymentDate: '2026-03-05' },
  { id: 'fee-103', ownerId: 'own-103', buildingId: 'bld-002', annualAmount: 8500, paidAmount: 4000, status: 'partial', lastPaymentDate: '2025-12-15' },
  { id: 'fee-104', ownerId: 'own-104', buildingId: 'bld-002', annualAmount: 9000, paidAmount: 0, status: 'unpaid' },
]

export const bld002Data: BuildingDataset = {
  building: bld002Building,
  owners: bld002Owners,
  units: bld002Units,
  ownershipLinks: bld002OwnershipLinks,
  association: bld002Association,
  associationRoles: bld002AssociationRoles,
  decisions: bld002Decisions,
  votes: bld002Votes,
  maintenanceRequests: bld002MaintenanceRequests,
  documents: bld002Documents,
  activityLog: bld002ActivityLog,
  fees: bld002Fees,
}

// =============================================================================
// BUILDING 3 — مجمع الورود السكني (Dammam, 36 units)
// =============================================================================

const bld003Building: Building = {
  id: 'bld-003',
  name: 'مجمع الورود السكني',
  type: 'compound',
  nationalAddress: 'DCCC7891 - حي الشاطئ، الدمام 31411',
  totalArea: 12000,
  unitCount: 36,
  commonAreas: [
    'المواقف',
    'المسابح',
    'الحدائق',
    'صالة الألعاب',
    'الممرات',
    'المصاعد',
    'غرفة الحارس',
    'ملعب الأطفال',
  ],
  status: 'active',
  createdAt: '2024-06-10',
}

const bld003Owners: Owner[] = [
  {
    id: 'own-201',
    fullName: 'عادل بن محمد الشمري',
    phone: '0551001001',
    email: 'adel@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-202',
    fullName: 'نوف بنت سعد العنزي',
    phone: '0552002002',
    email: 'nouf@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-203',
    fullName: 'يوسف بن أحمد البلوي',
    phone: '0553003003',
    email: 'youssef@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-204',
    fullName: 'أمل بنت خالد الحارثي',
    phone: '0554004004',
    email: 'amal@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-205',
    fullName: 'فيصل بن عبدالله الرشيدي',
    phone: '0555005005',
    email: 'faisal@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-206',
    fullName: 'حصة بنت ناصر المري',
    phone: '0556006006',
    email: 'hessa@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-207',
    fullName: 'محمد بن تركي الشهراني',
    phone: '0557007007',
    email: 'mohammed@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-208',
    fullName: 'دلال بنت فهد العجمي',
    phone: '0558008008',
    email: 'dalal@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-209',
    fullName: 'أحمد بن سليمان اليامي',
    phone: '0559009009',
    email: 'ahmed@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-210',
    fullName: 'منال بنت عبدالرحمن الخالدي',
    phone: '0550100100',
    email: 'manal@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-211',
    fullName: 'حمد بن سعود الوادعي',
    phone: '0551101101',
    email: 'hamad@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
  {
    id: 'own-212',
    fullName: 'ليلى بنت محمد القرني',
    phone: '0552202202',
    email: 'layla@example.com',
    nationalIdPlaceholder: '10XXXXXXXX',
  },
]

const bld003Units: Unit[] = Array.from({ length: 36 }, (_, i) => {
  const floor = Math.floor(i / 6) + 1
  const unitOnFloor = (i % 6) + 1
  const unitNumber = `${floor}0${unitOnFloor}`
  const areas = [100, 120, 110, 130, 115, 105]
  const area = areas[i % 6]
  const statuses: Unit['occupancyStatus'][] = [
    'owner-occupied',
    'occupied',
    'vacant',
  ]

  return {
    id: `unit-${String(i + 201).padStart(3, '0')}`,
    buildingId: 'bld-003',
    unitNumber,
    floor,
    area,
    ownershipSharePercentage: +(100 / 36).toFixed(2),
    occupancyStatus: statuses[i % 3],
  }
})

const bld003OwnershipLinks: OwnershipLink[] = bld003Owners.flatMap((owner, i) => {
  const unitIndices = [i * 3, i * 3 + 1, i * 3 + 2]
  return unitIndices.map((idx, j) => ({
    id: `ol-${String(201 + i * 3 + j).padStart(3, '0')}`,
    ownerId: owner.id,
    unitId: bld003Units[idx].id,
    sharePercentage: 100,
    isPrimaryRepresentative: j === 0,
  }))
})

const bld003Association: Association = {
  id: 'assoc-003',
  buildingId: 'bld-003',
  name: 'جمعية ملاك مجمع الورود السكني',
  registrationNumber: 'REGA-DMM-2024-1105',
  status: 'active',
}

const bld003AssociationRoles: AssociationRole[] = [
  {
    id: 'role-201',
    userId: 'own-201',
    associationId: 'assoc-003',
    role: 'chairman',
  },
  {
    id: 'role-202',
    userId: 'own-202',
    associationId: 'assoc-003',
    role: 'vice_chairman',
  },
  {
    id: 'role-203',
    userId: 'own-203',
    associationId: 'assoc-003',
    role: 'board_member',
  },
  {
    id: 'role-204',
    userId: 'own-204',
    associationId: 'assoc-003',
    role: 'manager',
  },
  {
    id: 'role-205',
    userId: 'own-205',
    associationId: 'assoc-003',
    role: 'owner',
  },
  {
    id: 'role-206',
    userId: 'own-206',
    associationId: 'assoc-003',
    role: 'owner',
  },
  {
    id: 'role-207',
    userId: 'own-207',
    associationId: 'assoc-003',
    role: 'owner',
  },
  {
    id: 'role-208',
    userId: 'own-208',
    associationId: 'assoc-003',
    role: 'owner',
  },
  {
    id: 'role-209',
    userId: 'own-209',
    associationId: 'assoc-003',
    role: 'owner',
  },
  {
    id: 'role-210',
    userId: 'own-210',
    associationId: 'assoc-003',
    role: 'owner',
  },
  {
    id: 'role-211',
    userId: 'own-211',
    associationId: 'assoc-003',
    role: 'owner',
  },
  {
    id: 'role-212',
    userId: 'own-212',
    associationId: 'assoc-003',
    role: 'owner',
  },
]

const bld003Decisions: Decision[] = [
  {
    id: 'dec-201',
    associationId: 'assoc-003',
    title: 'تحسين المسطحات الخضراء',
    description:
      'التصويت على تحسين الحدائق والمسطحات الخضراء في المجمع بتكلفة ٨٠,٠٠٠ ريال تشمل تركيب نظام ري آلي وزراعة أشجار جديدة.',
    category: 'maintenance',
    createdBy: 'own-201',
    status: 'open',
    votingDeadline: '2026-04-25',
    createdAt: '2026-03-20',
  },
  {
    id: 'dec-202',
    associationId: 'assoc-003',
    title: 'إنشاء مسبح مشترك',
    description:
      'اقتراح إنشاء مسبح مشترك في المنطقة الخلفية من المجمع بتكلفة تقديرية ١٥٠,٠٠٠ ريال.',
    category: 'general',
    createdBy: 'own-202',
    status: 'open',
    votingDeadline: '2026-04-30',
    createdAt: '2026-03-22',
  },
  {
    id: 'dec-203',
    associationId: 'assoc-003',
    title: 'اعتماد لائحة المواقف',
    description:
      'تم التصويت على لائحة تنظيم المواقف تشمل تخصيص موقفين لكل وحدة ومنع وقوف الزوار في المواقف المخصصة.',
    category: 'governance',
    createdBy: 'own-201',
    status: 'rejected',
    votingDeadline: '2026-02-28',
    result: 'رُفض بأغلبية ٧ أصوات رفض مقابل ٤ موافقة',
    createdAt: '2026-02-10',
  },
]

const bld003Votes: Vote[] = [
  // Votes for dec-201 (open — partial, 5 votes)
  { id: 'v-201', decisionId: 'dec-201', voterId: 'own-201', option: 'approve', timestamp: '2026-03-21T10:00:00' },
  { id: 'v-202', decisionId: 'dec-201', voterId: 'own-203', option: 'approve', timestamp: '2026-03-21T14:00:00' },
  { id: 'v-203', decisionId: 'dec-201', voterId: 'own-205', option: 'reject', timestamp: '2026-03-22T09:00:00' },
  { id: 'v-204', decisionId: 'dec-201', voterId: 'own-208', option: 'approve', timestamp: '2026-03-22T16:00:00' },
  { id: 'v-205', decisionId: 'dec-201', voterId: 'own-210', option: 'abstain', timestamp: '2026-03-23T08:00:00' },

  // Votes for dec-202 (open — partial, 3 votes)
  { id: 'v-206', decisionId: 'dec-202', voterId: 'own-202', option: 'approve', timestamp: '2026-03-23T10:00:00' },
  { id: 'v-207', decisionId: 'dec-202', voterId: 'own-206', option: 'reject', timestamp: '2026-03-24T09:00:00' },
  { id: 'v-208', decisionId: 'dec-202', voterId: 'own-209', option: 'approve', timestamp: '2026-03-24T15:00:00' },

  // Votes for dec-203 (closed — rejected, all 11 non-chairman voters + chairman = 11 shown)
  { id: 'v-209', decisionId: 'dec-203', voterId: 'own-201', option: 'reject', timestamp: '2026-02-15T10:00:00' },
  { id: 'v-210', decisionId: 'dec-203', voterId: 'own-202', option: 'approve', timestamp: '2026-02-15T11:00:00' },
  { id: 'v-211', decisionId: 'dec-203', voterId: 'own-203', option: 'reject', timestamp: '2026-02-16T09:00:00' },
  { id: 'v-212', decisionId: 'dec-203', voterId: 'own-205', option: 'reject', timestamp: '2026-02-16T10:00:00' },
  { id: 'v-213', decisionId: 'dec-203', voterId: 'own-206', option: 'approve', timestamp: '2026-02-17T09:00:00' },
  { id: 'v-214', decisionId: 'dec-203', voterId: 'own-207', option: 'reject', timestamp: '2026-02-17T10:00:00' },
  { id: 'v-215', decisionId: 'dec-203', voterId: 'own-208', option: 'reject', timestamp: '2026-02-18T09:00:00' },
  { id: 'v-216', decisionId: 'dec-203', voterId: 'own-209', option: 'approve', timestamp: '2026-02-18T10:00:00' },
  { id: 'v-217', decisionId: 'dec-203', voterId: 'own-210', option: 'reject', timestamp: '2026-02-19T09:00:00' },
  { id: 'v-218', decisionId: 'dec-203', voterId: 'own-211', option: 'approve', timestamp: '2026-02-19T10:00:00' },
  { id: 'v-219', decisionId: 'dec-203', voterId: 'own-212', option: 'reject', timestamp: '2026-02-19T11:00:00' },
]

const bld003MaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'mnt-201',
    buildingId: 'bld-003',
    type: 'general',
    priority: 'high',
    status: 'in_progress',
    title: 'صيانة المسبح الرئيسي',
    description: 'المسبح يحتاج تنظيف شامل وإصلاح نظام الفلترة.',
    requesterId: 'own-201',
    assignedVendor: 'شركة الواحة للمسابح',
    costEstimate: 12000,
    createdAt: '2026-03-15',
    updatedAt: '2026-03-18',
  },
  {
    id: 'mnt-202',
    buildingId: 'bld-003',
    type: 'general',
    priority: 'urgent',
    status: 'new',
    title: 'عطل في بوابة المجمع الرئيسية',
    description: 'البوابة الإلكترونية الرئيسية لا تفتح وتحتاج إصلاح عاجل.',
    requesterId: 'own-205',
    createdAt: '2026-03-28',
    updatedAt: '2026-03-28',
  },
  {
    id: 'mnt-203',
    buildingId: 'bld-003',
    unitId: 'unit-205',
    type: 'private',
    priority: 'medium',
    status: 'completed',
    title: 'تسرب في المطبخ',
    description: 'تسرب مياه من أنبوب المطبخ في الوحدة ٢٠٥.',
    requesterId: 'own-202',
    assignedVendor: 'مؤسسة الراشد للسباكة',
    costEstimate: 1500,
    finalCost: 1400,
    createdAt: '2026-03-05',
    updatedAt: '2026-03-10',
  },
  {
    id: 'mnt-204',
    buildingId: 'bld-003',
    type: 'general',
    priority: 'low',
    status: 'new',
    title: 'صيانة ملعب الأطفال',
    description: 'بعض ألعاب الأطفال تحتاج صيانة واستبدال قطع تالفة.',
    requesterId: 'own-208',
    createdAt: '2026-03-25',
    updatedAt: '2026-03-25',
  },
  {
    id: 'mnt-205',
    buildingId: 'bld-003',
    type: 'general',
    priority: 'medium',
    status: 'in_progress',
    title: 'تقليم الأشجار وصيانة الحدائق',
    description: 'الأشجار في المدخل تحتاج تقليم والعشب يحتاج معالجة.',
    requesterId: 'own-204',
    assignedVendor: 'شركة الخضراء للحدائق',
    costEstimate: 8000,
    createdAt: '2026-03-10',
    updatedAt: '2026-03-14',
  },
]

const bld003Documents: Document[] = [
  {
    id: 'doc-201',
    entityType: 'association',
    entityId: 'assoc-003',
    documentType: 'statute',
    title: 'النظام الأساسي لجمعية ملاك مجمع الورود السكني',
    fileUrl: '/documents/bld003-statute.pdf',
    uploadedBy: 'own-201',
    createdAt: '2024-06-20',
  },
  {
    id: 'doc-202',
    entityType: 'association',
    entityId: 'assoc-003',
    documentType: 'minutes',
    title: 'محضر الجمعية العمومية - الربع الرابع ٢٠٢٥',
    fileUrl: '/documents/bld003-minutes-q4-2025.pdf',
    uploadedBy: 'own-201',
    createdAt: '2025-12-20',
  },
  {
    id: 'doc-203',
    entityType: 'building',
    entityId: 'bld-003',
    documentType: 'invoice',
    title: 'فاتورة صيانة المسابح - مارس ٢٠٢٦',
    fileUrl: '/documents/bld003-pool-invoice-mar-2026.pdf',
    uploadedBy: 'own-204',
    createdAt: '2026-03-18',
  },
  {
    id: 'doc-204',
    entityType: 'building',
    entityId: 'bld-003',
    documentType: 'contract',
    title: 'عقد شركة الخضراء لصيانة الحدائق',
    fileUrl: '/documents/bld003-garden-contract.pdf',
    uploadedBy: 'own-201',
    createdAt: '2025-09-01',
  },
]

const bld003ActivityLog: ActivityLog[] = [
  {
    id: 'act-201',
    actorId: 'own-205',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-202',
    descriptionAr: 'أنشأ فيصل الرشيدي طلب صيانة: عطل في بوابة المجمع الرئيسية',
    timestamp: '2026-03-28T10:00:00',
  },
  {
    id: 'act-202',
    actorId: 'own-208',
    action: 'create',
    entityType: 'maintenance',
    entityId: 'mnt-204',
    descriptionAr: 'أنشأت دلال العجمي طلب صيانة: صيانة ملعب الأطفال',
    timestamp: '2026-03-25T14:00:00',
  },
  {
    id: 'act-203',
    actorId: 'own-209',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-202',
    descriptionAr: 'صوّت أحمد اليامي بالموافقة على: إنشاء مسبح مشترك',
    timestamp: '2026-03-24T15:00:00',
  },
  {
    id: 'act-204',
    actorId: 'own-206',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-202',
    descriptionAr: 'صوّتت حصة المري بالرفض على: إنشاء مسبح مشترك',
    timestamp: '2026-03-24T09:00:00',
  },
  {
    id: 'act-205',
    actorId: 'own-210',
    action: 'vote',
    entityType: 'decision',
    entityId: 'dec-201',
    descriptionAr: 'امتنعت منال الخالدي عن التصويت على: تحسين المسطحات الخضراء',
    timestamp: '2026-03-23T08:00:00',
  },
  {
    id: 'act-206',
    actorId: 'own-202',
    action: 'create',
    entityType: 'decision',
    entityId: 'dec-202',
    descriptionAr: 'أنشأت نوف العنزي قرار جديد: إنشاء مسبح مشترك',
    timestamp: '2026-03-22T09:00:00',
  },
  {
    id: 'act-207',
    actorId: 'own-201',
    action: 'create',
    entityType: 'decision',
    entityId: 'dec-201',
    descriptionAr: 'أنشأ عادل الشمري قرار جديد: تحسين المسطحات الخضراء',
    timestamp: '2026-03-20T09:00:00',
  },
  {
    id: 'act-208',
    actorId: 'own-204',
    action: 'upload',
    entityType: 'document',
    entityId: 'doc-203',
    descriptionAr: 'رفعت أمل الحارثي مستند: فاتورة صيانة المسابح - مارس ٢٠٢٦',
    timestamp: '2026-03-18T11:00:00',
  },
]

const bld003Fees: Fee[] = [
  { id: 'fee-201', ownerId: 'own-201', buildingId: 'bld-003', annualAmount: 16500, paidAmount: 16500, status: 'paid', lastPaymentDate: '2026-02-10' },
  { id: 'fee-202', ownerId: 'own-202', buildingId: 'bld-003', annualAmount: 17500, paidAmount: 17500, status: 'paid', lastPaymentDate: '2026-03-01' },
  { id: 'fee-203', ownerId: 'own-203', buildingId: 'bld-003', annualAmount: 16000, paidAmount: 16000, status: 'paid', lastPaymentDate: '2026-01-25' },
  { id: 'fee-204', ownerId: 'own-204', buildingId: 'bld-003', annualAmount: 17000, paidAmount: 17000, status: 'paid', lastPaymentDate: '2026-02-28' },
  { id: 'fee-205', ownerId: 'own-205', buildingId: 'bld-003', annualAmount: 16500, paidAmount: 16500, status: 'paid', lastPaymentDate: '2026-03-15' },
  { id: 'fee-206', ownerId: 'own-206', buildingId: 'bld-003', annualAmount: 17500, paidAmount: 17500, status: 'paid', lastPaymentDate: '2026-01-10' },
  { id: 'fee-207', ownerId: 'own-207', buildingId: 'bld-003', annualAmount: 16000, paidAmount: 16000, status: 'paid', lastPaymentDate: '2026-02-05' },
  { id: 'fee-208', ownerId: 'own-208', buildingId: 'bld-003', annualAmount: 17000, paidAmount: 9000, status: 'partial', lastPaymentDate: '2026-01-20' },
  { id: 'fee-209', ownerId: 'own-209', buildingId: 'bld-003', annualAmount: 16500, paidAmount: 8000, status: 'partial', lastPaymentDate: '2025-12-10' },
  { id: 'fee-210', ownerId: 'own-210', buildingId: 'bld-003', annualAmount: 17500, paidAmount: 6000, status: 'partial', lastPaymentDate: '2025-11-20' },
  { id: 'fee-211', ownerId: 'own-211', buildingId: 'bld-003', annualAmount: 16000, paidAmount: 0, status: 'unpaid' },
  { id: 'fee-212', ownerId: 'own-212', buildingId: 'bld-003', annualAmount: 17000, paidAmount: 0, status: 'unpaid' },
]

export const bld003Data: BuildingDataset = {
  building: bld003Building,
  owners: bld003Owners,
  units: bld003Units,
  ownershipLinks: bld003OwnershipLinks,
  association: bld003Association,
  associationRoles: bld003AssociationRoles,
  decisions: bld003Decisions,
  votes: bld003Votes,
  maintenanceRequests: bld003MaintenanceRequests,
  documents: bld003Documents,
  activityLog: bld003ActivityLog,
  fees: bld003Fees,
}

// =============================================================================
// Building Registry & Lookup
// =============================================================================

export const buildingRegistry: Record<string, BuildingDataset> = {
  'bld-001': bld001Data,
  'bld-002': bld002Data,
  'bld-003': bld003Data,
}

export const buildings: Building[] = [
  bld001Data.building,
  bld002Data.building,
  bld003Data.building,
]

export function getBuildingData(id: string): BuildingDataset | undefined {
  return buildingRegistry[id]
}

// =============================================================================
// Backward-Compatible Exports (from bld001Data)
// =============================================================================

export const building = bld001Data.building
export const owners = bld001Data.owners
export const units = bld001Data.units
export const ownershipLinks = bld001Data.ownershipLinks
export const association = bld001Data.association
export const associationRoles = bld001Data.associationRoles
export const decisions = bld001Data.decisions
export const votes = bld001Data.votes
export const maintenanceRequests = bld001Data.maintenanceRequests
export const documents = bld001Data.documents
export const activityLog = bld001Data.activityLog

// =============================================================================
// Helper Functions
// =============================================================================

export function getOwnerById(id: string, ownerList: Owner[] = bld001Data.owners): Owner | undefined {
  return ownerList.find((o) => o.id === id)
}

export function getUnitById(id: string, unitList: Unit[] = bld001Data.units): Unit | undefined {
  return unitList.find((u) => u.id === id)
}

export function getOwnerUnits(ownerId: string, links: OwnershipLink[] = bld001Data.ownershipLinks, unitList: Unit[] = bld001Data.units): Unit[] {
  const ownerLinks = links.filter((l) => l.ownerId === ownerId)
  return ownerLinks.map((l) => unitList.find((u) => u.id === l.unitId)).filter((u): u is Unit => u !== undefined)
}

export function getUnitOwner(unitId: string, links: OwnershipLink[] = bld001Data.ownershipLinks, ownerList: Owner[] = bld001Data.owners): Owner | undefined {
  const link = links.find((l) => l.unitId === unitId)
  return link ? ownerList.find((o) => o.id === link.ownerId) : undefined
}

export function getOwnerRole(ownerId: string, roleList: AssociationRole[] = bld001Data.associationRoles): AssociationRole | undefined {
  return roleList.find((r) => r.userId === ownerId)
}

export function getDecisionVotes(decisionId: string, voteList: Vote[] = bld001Data.votes): Vote[] {
  return voteList.filter((v) => v.decisionId === decisionId)
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    chairman: 'رئيس الجمعية',
    vice_chairman: 'نائب الرئيس',
    board_member: 'عضو مجلس إدارة',
    manager: 'مدير العقار',
    owner: 'مالك',
    resident: 'مقيم',
  }
  return labels[role] || role
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    suspended: 'موقوف',
    under_formation: 'تحت التأسيس',
    draft: 'مسودة',
    open: 'مفتوح',
    closed: 'مغلق',
    approved: 'معتمد',
    rejected: 'مرفوض',
    new: 'جديد',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    vacant: 'شاغرة',
    occupied: 'مؤجرة',
    'owner-occupied': 'مالك مقيم',
  }
  return labels[status] || status
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  }
  return labels[priority] || priority
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    financial: 'مالية',
    maintenance: 'صيانة',
    governance: 'حوكمة',
    general: 'عامة',
  }
  return labels[category] || category
}

export function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    statute: 'نظام أساسي',
    minutes: 'محضر اجتماع',
    decision: 'قرار',
    invoice: 'فاتورة',
    contract: 'عقد',
    report: 'تقرير',
    other: 'أخرى',
  }
  return labels[type] || type
}

// ===== User-Scoped Helpers =====

export function getUserUnitIds(userId: string, links: OwnershipLink[] = bld001Data.ownershipLinks): string[] {
  return links.filter((l) => l.ownerId === userId).map((l) => l.unitId)
}

export function getUserMaintenanceRequests(userId: string, requests: MaintenanceRequest[] = bld001Data.maintenanceRequests): MaintenanceRequest[] {
  return requests.filter((r) => r.requesterId === userId)
}

export function getUserVoteForDecision(userId: string, decisionId: string, voteList: Vote[] = bld001Data.votes): Vote | undefined {
  return voteList.find((v) => v.voterId === userId && v.decisionId === decisionId)
}

export function getDecisionsAwaitingVote(userId: string, decisionList: Decision[] = bld001Data.decisions, voteList: Vote[] = bld001Data.votes): Decision[] {
  return decisionList.filter((d) => {
    if (d.status !== 'open') return false
    return !voteList.some((v) => v.voterId === userId && v.decisionId === d.id)
  })
}

export function getVoteOptionLabel(option: string): string {
  const labels: Record<string, string> = {
    approve: 'موافق',
    reject: 'رافض',
    abstain: 'ممتنع',
  }
  return labels[option] || option
}
