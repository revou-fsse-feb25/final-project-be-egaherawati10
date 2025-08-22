// src/common/auth/capabilities.ts

export type Role =
  | 'admin'
  | 'doctor'
  | 'pharmacist'
  | 'cashier'
  | 'patient'
  | 'registration_clerk';

export type Resource =
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

export const CAPABILITIES = {
  admin: {
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
    Patient: ['read'],
    MedicalRecord: ['read'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read', 'create', 'update', 'delete'],
    Payment: ['read'],
    PaymentItem: ['read'],
  },

  cashier: {
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
    Patient: ['read', 'create', 'update', 'delete'],
    MedicalRecord: ['read', 'create', 'update', 'delete'],
  },

  patient: {
    Patient: ['read'],        // their own
    MedicalRecord: ['read'],  // their own
    Prescription: ['read'],   // their own
    Service: ['read'],        // their own
    Payment: ['read'],        // their own
  },
} satisfies CapabilityMatrix;

export function canDo(role: Role, resource: Resource, action: Action): boolean {
  return (CAPABILITIES[role]?.[resource] ?? []).includes(action);
}