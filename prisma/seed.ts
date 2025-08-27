/* prisma/seed.ts */

import {
  PrismaClient,
  UserRole,
  UserStatus,
  Gender,
  PrescriptionStatus,
  ServiceStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentItemKind,
  Prisma,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

/** Decimal helper */
const d = (n: number | string) => new Prisma.Decimal(n);

/** Random date within last N days (default 10), keeping a believable order for visit→issue→paid */
function recentDate(daysBack = 10) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(past);
}

async function upsertUsers(password: string) {
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { status: UserStatus.active },
    create: {
      name: "Admin One",
      username: "admin",
      email: "admin@example.com",
      password: hash,
      role: UserRole.admin,
      status: UserStatus.active,
    },
  });

  // Doctors
  const drgreen = await prisma.user.upsert({
    where: { username: "drgreen" },
    update: { status: UserStatus.active },
    create: {
      name: "Dr. Green",
      username: "drgreen",
      email: "drgreen@example.com",
      password: hash,
      role: UserRole.doctor,
      status: UserStatus.active,
    },
  });
  const drbrown = await prisma.user.upsert({
    where: { username: "drbrown" },
    update: { status: UserStatus.active },
    create: {
      name: "Dr. Brown",
      username: "drbrown",
      email: "drbrown@example.com",
      password: hash,
      role: UserRole.doctor,
      status: UserStatus.active,
    },
  });

  // Pharmacists
  const pharm1 = await prisma.user.upsert({
    where: { username: "pharm1" },
    update: { status: UserStatus.active },
    create: {
      name: "Pharmacist A",
      username: "pharm1",
      email: "pharm1@example.com",
      password: hash,
      role: UserRole.pharmacist,
      status: UserStatus.active,
    },
  });
  const pharm2 = await prisma.user.upsert({
    where: { username: "pharm2" },
    update: { status: UserStatus.active },
    create: {
      name: "Pharmacist B",
      username: "pharm2",
      email: "pharm2@example.com",
      password: hash,
      role: UserRole.pharmacist,
      status: UserStatus.active,
    },
  });

  // Cashiers
  const cashier1 = await prisma.user.upsert({
    where: { username: "cashier1" },
    update: { status: UserStatus.active },
    create: {
      name: "Cashier One",
      username: "cashier1",
      email: "cashier1@example.com",
      password: hash,
      role: UserRole.cashier,
      status: UserStatus.active,
    },
  });
  const cashier2 = await prisma.user.upsert({
    where: { username: "cashier2" },
    update: { status: UserStatus.active },
    create: {
      name: "Cashier Two",
      username: "cashier2",
      email: "cashier2@example.com",
      password: hash,
      role: UserRole.cashier,
      status: UserStatus.active,
    },
  });

  // Clerks
  const clerk1 = await prisma.user.upsert({
    where: { username: "clerk1" },
    update: { status: UserStatus.active },
    create: {
      name: "Clerk Joy",
      username: "clerk1",
      email: "clerk1@example.com",
      password: hash,
      role: UserRole.registration_clerk,
      status: UserStatus.active,
    },
  });
  const clerk2 = await prisma.user.upsert({
    where: { username: "clerk2" },
    update: { status: UserStatus.active },
    create: {
      name: "Clerk May",
      username: "clerk2",
      email: "clerk2@example.com",
      password: hash,
      role: UserRole.registration_clerk,
      status: UserStatus.active,
    },
  });

  return {
    admin,
    doctors: [drgreen, drbrown],
    pharmacists: [pharm1, pharm2],
    cashiers: [cashier1, cashier2],
    clerks: [clerk1, clerk2],
  };
}

async function upsertCatalog() {
  // Medicines (unique on [name, dosage])
  const meds = await Promise.all([
    prisma.medicine.upsert({
      where: { name_dosage: { name: "Amoxicillin", dosage: "500mg" } },
      update: {
        type: "capsule",
        manufacturer: "Generic Labs",
        stock: 500,
        reorderLevel: 50,
        unit: "capsule",
        price: d(2500),
      },
      create: {
        name: "Amoxicillin",
        dosage: "500mg",
        type: "capsule",
        manufacturer: "Generic Labs",
        stock: 500,
        reorderLevel: 50,
        unit: "capsule",
        price: d(2500),
      },
    }),
    prisma.medicine.upsert({
      where: { name_dosage: { name: "Paracetamol", dosage: "500mg" } },
      update: {
        type: "tablet",
        manufacturer: "Pharma Indonesia",
        stock: 800,
        reorderLevel: 80,
        unit: "tablet",
        price: d(1500),
      },
      create: {
        name: "Paracetamol",
        dosage: "500mg",
        type: "tablet",
        manufacturer: "Pharma Indonesia",
        stock: 800,
        reorderLevel: 80,
        unit: "tablet",
        price: d(1500),
      },
    }),
    prisma.medicine.upsert({
      where: { name_dosage: { name: "Ibuprofen", dosage: "400mg" } },
      update: {
        type: "tablet",
        manufacturer: "HealWell",
        stock: 600,
        reorderLevel: 60,
        unit: "tablet",
        price: d(2000),
      },
      create: {
        name: "Ibuprofen",
        dosage: "400mg",
        type: "tablet",
        manufacturer: "HealWell",
        stock: 600,
        reorderLevel: 60,
        unit: "tablet",
        price: d(2000),
      },
    }),
    prisma.medicine.upsert({
      where: { name_dosage: { name: "Metformin", dosage: "500mg" } },
      update: {
        type: "tablet",
        manufacturer: "GlucoCare",
        stock: 400,
        reorderLevel: 40,
        unit: "tablet",
        price: d(3000),
      },
      create: {
        name: "Metformin",
        dosage: "500mg",
        type: "tablet",
        manufacturer: "GlucoCare",
        stock: 400,
        reorderLevel: 40,
        unit: "tablet",
        price: d(3000),
      },
    }),
    prisma.medicine.upsert({
      where: { name_dosage: { name: "Ranitidine", dosage: "150mg" } },
      update: {
        type: "tablet",
        manufacturer: "StomachCare",
        stock: 300,
        reorderLevel: 30,
        unit: "tablet",
        price: d(2200),
      },
      create: {
        name: "Ranitidine",
        dosage: "150mg",
        type: "tablet",
        manufacturer: "StomachCare",
        stock: 300,
        reorderLevel: 30,
        unit: "tablet",
        price: d(2200),
      },
    }),
    prisma.medicine.upsert({
      where: { name_dosage: { name: "Cough Syrup", dosage: "100ml" } },
      update: {
        type: "syrup",
        manufacturer: "CoughAway",
        stock: 200,
        reorderLevel: 20,
        unit: "bottle",
        price: d(12000),
      },
      create: {
        name: "Cough Syrup",
        dosage: "100ml",
        type: "syrup",
        manufacturer: "CoughAway",
        stock: 200,
        reorderLevel: 20,
        unit: "bottle",
        price: d(12000),
      },
    }),
  ]);

  // ServiceItems (unique on name)
  const services = await Promise.all([
    prisma.serviceItem.upsert({
      where: { name: "Doctor Consultation" },
      update: { price: d(50000) },
      create: { name: "Doctor Consultation", price: d(50000) },
    }),
    prisma.serviceItem.upsert({
      where: { name: "Blood Glucose Test" },
      update: { price: d(50000) },
      create: { name: "Blood Glucose Test", price: d(50000) },
    }),
    prisma.serviceItem.upsert({
      where: { name: "Complete Blood Count (CBC)" },
      update: { price: d(120000) },
      create: { name: "Complete Blood Count (CBC)", price: d(120000) },
    }),
    prisma.serviceItem.upsert({
      where: { name: "ECG (Electrocardiogram)" },
      update: { price: d(150000) },
      create: { name: "ECG (Electrocardiogram)", price: d(150000) },
    }),
    prisma.serviceItem.upsert({
      where: { name: "Ultrasound Abdomen" },
      update: { price: d(300000) },
      create: { name: "Ultrasound Abdomen", price: d(300000) },
    }),
    prisma.serviceItem.upsert({
      where: { name: "Chest X-Ray" },
      update: { price: d(200000) },
      create: { name: "Chest X-Ray", price: d(200000) },
    }),
  ]);

  return { meds, services };
}

async function upsertPatient(
  username: string,
  name: string,
  email: string,
  clerkId: number,
  gender: Gender,
  dob: string,
  phone: string,
  address: string,
  passwordHash: string
) {
  const user = await prisma.user.upsert({
    where: { username },
    update: { status: UserStatus.active, name, email },
    create: {
      name,
      username,
      email,
      password: passwordHash,
      role: UserRole.patient,
      status: UserStatus.active,
    },
  });

  const profile = await prisma.patientProfile.upsert({
    where: { userId: user.id },
    update: { dob: new Date(dob), gender, address, phone, clerkId },
    create: { userId: user.id, dob: new Date(dob), gender, address, phone, clerkId },
  });

  return { user, profile };
}

type RxSpec = { medicineName: string; dosage: string; qty: number };

async function createVisitBundleRealistic(args: {
  patientProfileId: number;
  doctorId: number;
  clerkId: number;
  adminId: number;
  diagnosis: string;
  subjective: string;
  objective: string;
  assessment: string;
  planning: string;
  serviceName: string;
  rx: RxSpec[]; // one or more items; qty is tablet/capsule count or ml-based unit count
}) {
  const {
    patientProfileId,
    doctorId,
    clerkId,
    adminId,
    diagnosis,
    subjective,
    objective,
    assessment,
    planning,
    serviceName,
    rx,
  } = args;

  // Lookup service item & medicines
  const serviceItem = await prisma.serviceItem.findUniqueOrThrow({
    where: { name: serviceName },
  });

  // Build detailed meds from catalog (unitPrice based on medicine catalog price)
  const rxDetailed = await Promise.all(
    rx.map(async (r) => {
      const med = await prisma.medicine.findFirstOrThrow({
        where: { name: r.medicineName, dosage: r.dosage },
      });
      return {
        med,
        quantity: r.qty,
        unitPrice: med.price,
        instructions:
          r.medicineName === "Cough Syrup" ? "10ml 3x daily after meals" : "After meals",
        rxDosageLabel:
          r.medicineName === "Cough Syrup"
            ? "10ml 3x daily"
            : `${r.dosage} ${r.qty >= 21 ? "3x daily" : "2-3x daily"}`,
      };
    })
  );

  // Make dates look realistic and ordered
  const visitDate = recentDate(14);
  const issuedAt = new Date(visitDate.getTime() + 60 * 60 * 1000); // +1h
  const paidAt = new Date(issuedAt.getTime() + 30 * 60 * 1000); // +30m

  // 1) Medical Record
  const medicalRecord = await prisma.medicalRecord.create({
    data: {
      patientId: patientProfileId,
      doctorId,
      clerkId,
      visitDate,
      diagnosis,
      notes: planning,
      createdById: adminId,
    },
  });

  // 2) SOAP note
  await prisma.record.create({
    data: {
      medicalRecordId: medicalRecord.id,
      patientId: patientProfileId,
      doctorId,
      subjective,
      objective,
      assessment,
      planning,
      createdById: doctorId,
    },
  });

  // 3) Prescription + items
  const prescription = await prisma.prescription.create({
    data: {
      medicalRecordId: medicalRecord.id,
      doctorId,
      patientId: patientProfileId,
      status: PrescriptionStatus.issued,
      dateIssued: issuedAt,
      notes: "Issued via seed",
      createdById: doctorId,
      items: {
        create: rxDetailed.map((x) => ({
          medicineId: x.med.id,
          dosage: x.rxDosageLabel,
          quantity: x.quantity,
          price: x.unitPrice, // per unit price
          instructions: x.instructions,
        })),
      },
    },
    include: { items: true },
  });

  // 4) Service + junction
  const service = await prisma.service.create({
    data: {
      patientId: patientProfileId,
      doctorId,
      medicalRecordId: medicalRecord.id,
      status: ServiceStatus.completed,
      serviceDate: issuedAt,
      createdById: doctorId,
      serviceItems: {
        create: [
          {
            serviceItemId: serviceItem.id,
            quantity: 1,
            unitPrice: serviceItem.price,
          },
        ],
      },
    },
    include: { serviceItems: true },
  });

  // 5) Payment (sum service junction price + each Rx line total)
  const serviceLine = service.serviceItems[0];
  const serviceAmt = serviceLine.unitPrice;
  const medsTotal = prescription.items
    .map((it) => it.price.mul(it.quantity))
    .reduce((acc, v) => acc.add(v), d(0));
  const grandTotal = serviceAmt.add(medsTotal);

  await prisma.payment.create({
    data: {
      medicalRecordId: medicalRecord.id,
      patientId: patientProfileId,
      status: PaymentStatus.paid,
      method: PaymentMethod.cash,
      issuedAt,
      paidAt,
      totalAmount: grandTotal,
      createdById: adminId,
      items: {
        create: [
          {
            kind: PaymentItemKind.service_item,
            description: serviceItem.name,
            amount: serviceAmt,
            serviceOnServiceItemId: serviceLine.id,
          },
          ...prescription.items.map((it) => ({
            kind: PaymentItemKind.prescription_item,
            description: `${rxDetailed.find((x) => x.med.id === it.medicineId)?.med.name} ${it.dosage}`,
            amount: it.price.mul(it.quantity),
            prescriptionItemId: it.id,
          })),
        ],
      },
    },
  });

  return { medicalRecord, prescription, service };
}

async function main() {
  // 1) Core accounts
  const { admin, doctors, clerks } = await upsertUsers("Password123!");

  // 2) Catalog
  await upsertCatalog();

  // 3) Patients (upsert)
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const [alice, budi, citra, dedi] = await Promise.all([
    upsertPatient(
      "alice",
      "Alice Rahmawati",
      "alice@example.com",
      clerks[0].id,
      Gender.female,
      "1992-05-20",
      "081234567890",
      "Jl. Merdeka Raya No. 10, Jakarta",
      passwordHash
    ),
    upsertPatient(
      "budi",
      "Budi Santoso",
      "budi@example.com",
      clerks[1].id,
      Gender.male,
      "1988-07-12",
      "081298765432",
      "Jl. Sudirman No. 45, Bandung",
      passwordHash
    ),
    upsertPatient(
      "citra",
      "Citra Dewi",
      "citra@example.com",
      clerks[0].id,
      Gender.female,
      "1995-11-30",
      "082134567891",
      "Jl. Thamrin No. 78, Surabaya",
      passwordHash
    ),
    upsertPatient(
      "dedi",
      "Dedi Kurniawan",
      "dedi@example.com",
      clerks[1].id,
      Gender.male,
      "1983-02-14",
      "083134567892",
      "Jl. Gatot Subroto No. 12, Medan",
      passwordHash
    ),
  ]);

  // 4) Create realistic visits (fresh each run)
  const doctorRR = (i: number) => doctors[i % doctors.length].id;
  const clerkRR = (i: number) => clerks[i % clerks.length].id;

  await createVisitBundleRealistic({
    patientProfileId: alice.profile.id,
    doctorId: doctorRR(0),
    clerkId: clerkRR(0),
    adminId: admin.id,
    diagnosis: "Acute pharyngitis",
    subjective: "Sore throat, fever 38.5°C, onset 2 days.",
    objective: "Tonsils enlarged, erythematous.",
    assessment: "Acute pharyngitis likely bacterial.",
    planning: "Antibiotics 7 days, paracetamol for fever, rest & fluids.",
    serviceName: "Complete Blood Count (CBC)",
    rx: [
      { medicineName: "Amoxicillin", dosage: "500mg", qty: 14 }, // 2x daily x 7d
      { medicineName: "Paracetamol", dosage: "500mg", qty: 15 }, // 3x daily x 5d
    ],
  });

  await createVisitBundleRealistic({
    patientProfileId: budi.profile.id,
    doctorId: doctorRR(1),
    clerkId: clerkRR(1),
    adminId: admin.id,
    diagnosis: "Type 2 Diabetes Mellitus",
    subjective: "Polyuria, polydipsia, weight stable.",
    objective: "Random glucose 220 mg/dL.",
    assessment: "Poor glycemic control.",
    planning: "Start/continue metformin; lifestyle modification; monitor glucose.",
    serviceName: "Blood Glucose Test",
    rx: [
      { medicineName: "Metformin", dosage: "500mg", qty: 60 }, // 2x daily x 30d
      { medicineName: "Paracetamol", dosage: "500mg", qty: 10 }, // PRN
    ],
  });

  await createVisitBundleRealistic({
    patientProfileId: citra.profile.id,
    doctorId: doctorRR(2),
    clerkId: clerkRR(0),
    adminId: admin.id,
    diagnosis: "Hypertension",
    subjective: "Occasional headache, no chest pain.",
    objective: "BP 150/95, Pulse 88.",
    assessment: "Stage 1-2 hypertension.",
    planning: "Lifestyle advice; analgesic PRN; ECG baseline.",
    serviceName: "ECG (Electrocardiogram)",
    rx: [
      { medicineName: "Ibuprofen", dosage: "400mg", qty: 15 }, // PRN headache
      { medicineName: "Paracetamol", dosage: "500mg", qty: 10 }, // PRN fever/pain
    ],
  });

  await createVisitBundleRealistic({
    patientProfileId: dedi.profile.id,
    doctorId: doctorRR(3),
    clerkId: clerkRR(1),
    adminId: admin.id,
    diagnosis: "Gastritis",
    subjective: "Epigastric pain, worsens before meals.",
    objective: "Mild epigastric tenderness.",
    assessment: "Likely gastritis.",
    planning: "Acid suppression; ultrasound if persistent.",
    serviceName: "Ultrasound Abdomen",
    rx: [
      { medicineName: "Ranitidine", dosage: "150mg", qty: 28 }, // 2x daily x 14d
      { medicineName: "Cough Syrup", dosage: "100ml", qty: 1 }, // symptomatic
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });