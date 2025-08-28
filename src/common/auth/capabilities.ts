export type Role =
  | 'guest'
  | 'admin'
  | 'doctor'
  | 'pharmacist'
  | 'cashier'
  | 'patient'
  | 'registration_clerk';

export type Resource =
  | 'Auth'
  | 'Profile'
  | 'Users'
  | 'Patient'
  | 'MedicalRecord'
  | 'Record'
  | 'Prescription'
  | 'PrescriptionItem'
  | 'Medicine'
  | 'Service'                // instance: ordered service on a medical record
  | 'ServiceOnServiceItem'   // catalog mapping (join)
  | 'ServiceItem'            // catalog item
  | 'Payment'
  | 'PaymentItem';

export type Action = 'read' | 'create' | 'update' | 'delete';

type CapabilityMatrix = {
  [R in Role]: Partial<{ [Res in Resource]?: Action[] }>;
};

const AUTHENTICATED_BASE: Partial<Record<Resource, Action[]>> = {
  Auth: ['read'],
  Profile: ['read', 'update'], // (own)
};

export const CAPABILITIES: CapabilityMatrix = {
  guest: {
    Auth: ['read', 'create'], // login/register forms
  },

  admin: {
    ...AUTHENTICATED_BASE,
    Users: ['read', 'create', 'update', 'delete'],
    Patient: ['read', 'create', 'update', 'delete'],
    MedicalRecord: ['read', 'create', 'update', 'delete'],
    Record: ['read', 'create', 'update', 'delete'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read', 'create', 'update', 'delete'],            // catalog
    ServiceItem: ['read', 'create', 'update', 'delete'],         // catalog
    ServiceOnServiceItem: ['read', 'create', 'update', 'delete'],// catalog mapping
    Service: ['read', 'create', 'update', 'delete'],             // instances
    Payment: ['read', 'create', 'update', 'delete'],
    PaymentItem: ['read', 'create', 'update', 'delete'],
  },

  doctor: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],                                  // (scope: assigned/own patients)
    MedicalRecord: ['read', 'create', 'update'],        // open/update episodes (no delete)
    Record: ['read', 'create', 'update'],               // SOAP entries etc. (no delete)
    Prescription: ['read', 'create', 'update'],         // issue & edit until dispensed
    PrescriptionItem: ['read', 'create', 'update'],
    Service: ['read', 'create', 'update'],              // order/modify services for visit
    Medicine: ['read'],                                 // view catalog only
    ServiceItem: ['read'],                              // view catalog only
    Payment: ['read'],                                  // view billing status
    PaymentItem: ['read'],
  },

  pharmacist: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],
    MedicalRecord: ['read'],
    Prescription: ['read', 'update'],                   // mark dispensed, substitutions policy
    PrescriptionItem: ['read', 'update'],
    Medicine: ['read', 'create', 'update', 'delete'],   // manage inventory/catalog
    Payment: ['read'],
    PaymentItem: ['read'],
    // no Service/Record editing
  },

  cashier: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],
    MedicalRecord: ['read'],
    Payment: ['read', 'create', 'update'],              // create invoices, capture payments
    PaymentItem: ['read', 'create', 'update', 'delete'],
    Service: ['read'],                                  // to price/bundle on invoice
    Prescription: ['read'],
    PrescriptionItem: ['read'],
    // catalog edits removed:
    // ServiceItem: ['read'] could be added if needed for pricing visibility
  },

  registration_clerk: {
    ...AUTHENTICATED_BASE,
    Patient: ['read', 'create', 'update'],              // register/update demographics
    MedicalRecord: ['read', 'create', 'update'],        // open/assign episodes
    // no deletes to preserve audit trail
  },

  patient: {
    ...AUTHENTICATED_BASE,
    Patient: ['read'],        // (own)
    MedicalRecord: ['read'],  // (own)
    Prescription: ['read'],   // (own)
    Service: ['read'],        // (own)
    Payment: ['read'],        // (own)
  },
};

export function canDo(role: Role, resource: Resource, action: Action): boolean {
  return (CAPABILITIES[role]?.[resource] ?? []).includes(action);
}