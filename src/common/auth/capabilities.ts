// rbac/capabilities.ts
export type Role =
  | 'guest'                 // <— add guest for unauthenticated visitors
  | 'admin'
  | 'doctor'
  | 'pharmacist'
  | 'cashier'
  | 'patient'
  | 'registration_clerk';

export type Resource =
  | 'Auth'                  // <— meta: login/register/logout UI
  | 'Profile'               // <— meta: /auth/profile ("me")
  | 'Users'
  | 'Patient'
  | 'MedicalRecord'
  | 'Record'
  | 'Prescription'
  | 'PrescriptionItem'
  | 'Medicine'
  | 'Service'
  | 'ServiceOnServiceItem'
  | 'ServiceItem'
  | 'Payment'
  | 'PaymentItem';

export type Action = 'read' | 'create' | 'update' | 'delete';

type CapabilityMatrix = {
  [R in Role]: Partial<{ [Res in Resource]?: Action[] }>;
};

const AUTHENTICATED_BASE: Partial<Record<Resource, Action[]>> = {
  Auth: ['read'],           // show logout button etc
  Profile: ['read', 'update'], // view & edit own profile
};

export const CAPABILITIES: CapabilityMatrix = {
  guest: {
    Auth: ['read', 'create'], // show login/register; allow posting login/register forms
    // no Profile access
  },

  admin: {
    ...AUTHENTICATED_BASE,
    Users: ['read'],
    Patient: ['read', 'create', 'update', 'delete'],
    MedicalRecord: ['read', 'create', 'update', 'delete'],
    Record: ['read', 'create', 'update', 'delete'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read', 'create', 'update', 'delete'],
    Service: ['read', 'create', 'update', 'delete'],
    ServiceOnServiceItem: ['read', 'create', 'update', 'delete'],
    ServiceItem: ['read', 'create', 'update', 'delete'],
    Payment: ['read', 'create', 'update', 'delete'],
    PaymentItem: ['read', 'create', 'update', 'delete'],
  },

  doctor: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],
    MedicalRecord: ['read', 'update'],
    Record: ['read', 'create', 'update', 'delete'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Service: ['read', 'create', 'update', 'delete'],
    ServiceOnServiceItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read'],
    ServiceItem: ['read'],
    Payment: ['read', 'create', 'update'],
    PaymentItem: ['read', 'update'],
  },

  pharmacist: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],
    MedicalRecord: ['read'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read', 'create', 'update', 'delete'],
    Payment: ['read'],
    PaymentItem: ['read'],
  },

  cashier: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],
    MedicalRecord: ['read'],
    Payment: ['read', 'create', 'update'],
    PaymentItem: ['read', 'create', 'update', 'delete'],
    Service: ['read', 'update'],
    ServiceItem: ['read'],
    ServiceOnServiceItem: ['read', 'create', 'update', 'delete'],
    Prescription: ['read', 'update'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read'],
  },

  registration_clerk: {
    ...AUTHENTICATED_BASE,
    Patient: ['read', 'create', 'update', 'delete'],
    MedicalRecord: ['read', 'create', 'update', 'delete'],
  },

  patient: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],        // (own) — enforce owner on the backend
    MedicalRecord: ['read'],  // (own)
    Prescription: ['read'],   // (own)
    Service: ['read'],        // (own)
    Payment: ['read'],        // (own)
  },
};

export function canDo(role: Role, resource: Resource, action: Action): boolean {
  return (CAPABILITIES[role]?.[resource] ?? []).includes(action);
}