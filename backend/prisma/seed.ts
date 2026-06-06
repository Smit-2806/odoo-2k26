import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local SQLite database...');

  // Clean database
  await prisma.auditLog.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.rfqItem.deleteMany({});
  await prisma.rfq.deleteMany({});
  await prisma.vendorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@vendorbridge.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const procurement = await prisma.user.create({
    data: {
      name: 'Rahul Mehta',
      email: 'officer@vendorbridge.com',
      password: passwordHash,
      role: 'PROCUREMENT',
    },
  });

  const finance = await prisma.user.create({
    data: {
      name: 'Priya Shah',
      email: 'finance@vendorbridge.com',
      password: passwordHash,
      role: 'FINANCE',
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      name: 'Infra Supplier',
      email: 'vendor@infra-supplies.com',
      password: passwordHash,
      role: 'VENDOR',
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      name: 'Tech Core User',
      email: 'vendor@tech-core.com',
      password: passwordHash,
      role: 'VENDOR',
    },
  });

  const vendorUser3 = await prisma.user.create({
    data: {
      name: 'OfficeNeed User',
      email: 'vendor@officeneed.com',
      password: passwordHash,
      role: 'VENDOR',
    },
  });

  const vendorUser4 = await prisma.user.create({
    data: {
      name: 'FastLog User',
      email: 'vendor@fastlog.com',
      password: passwordHash,
      role: 'VENDOR',
    },
  });

  const vendorUser5 = await prisma.user.create({
    data: {
      name: 'Green Services User',
      email: 'vendor@greenservices.com',
      password: passwordHash,
      role: 'VENDOR',
    },
  });

  // 2. Create Vendor Profiles
  const infraSupplies = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser1.id,
      companyName: 'Infra Supplies Pvt Ltd',
      taxId: '27AABCS1429Bz0',
      phone: '+91 98765 43210',
      address: '456, Industrial Estate, Surat',
      website: 'www.infrasupplies.com',
      status: 'APPROVED',
      businessFields: 'Furniture,Office Supplies',
    },
  });

  const techCore = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser2.id,
      companyName: 'Tech Core LTD',
      taxId: '27AABCS1430Bz1',
      phone: '+91 98765 43211',
      address: '101, Tech Park, Bangalore',
      website: 'www.techcore.com',
      status: 'APPROVED',
      businessFields: 'IT,Furniture',
    },
  });

  const officeNeed = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser3.id,
      companyName: 'OfficeNeed Co.',
      taxId: '27AABCS1431Bz2',
      phone: '+91 98765 43212',
      address: '789, Business Square, Ahmedabad',
      website: 'www.officeneed.com',
      status: 'APPROVED',
      businessFields: 'Office Supplies,Janitorial',
    },
  });

  const fastLog = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser4.id,
      companyName: 'FastLog Transport',
      taxId: '27AABCS1432Bz3',
      phone: '+91 98765 43213',
      address: '12, Logistics Lane, Surat',
      website: 'www.fastlog.com',
      status: 'BLOCKED',
      businessFields: 'Logistics',
    },
  });

  const greenServices = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser5.id,
      companyName: 'Green Services',
      taxId: '27AABCS1433Bz4',
      phone: '+91 98765 43214',
      address: '23, Eco Plaza, Mumbai',
      website: 'www.greenservices.com',
      status: 'PENDING',
      businessFields: 'Janitorial,Logistics',
    },
  });

  // 3. Create RFQs
  const rfq1 = await prisma.rfq.create({
    data: {
      title: 'Office Furniture Procurement Q2',
      description: 'Ergonomic chairs and standing desks for 3rd floor expansion.',
      category: 'Furniture',
      status: 'PUBLISHED',
      submissionDeadline: new Date('2026-06-15T23:59:59Z'),
      deliveryTerms: 'DDP - Delivered Duty Paid',
      paymentTerms: '20 days net',
      creatorId: procurement.id,
      items: {
        create: [
          { name: 'Ergonomic chair', quantity: 25, uom: 'NOS', description: 'Mesh back, adjustable lumbar support' },
          { name: 'Standing desk', quantity: 10, uom: 'NOS', description: 'Dual motor, 120x60cm wood top' },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  // 4. Create Quotations
  const quote1 = await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      vendorId: infraSupplies.id,
      status: 'APPROVED',
      validUntil: new Date('2026-07-01'),
      deliverySchedule: '10 days from PO release',
      paymentTerms: '20 days net',
      notes: 'Includes free delivery and assembly.',
      totalAmount: 200010.0,
      items: {
        create: [
          {
            rfqItemId: rfq1.items[0].id,
            unitPrice: 3500.0,
            totalPrice: 87500.0,
            notes: 'Infra Ergonomic Classic v2',
          },
          {
            rfqItemId: rfq1.items[1].id,
            unitPrice: 8200.0,
            totalPrice: 82000.0,
            notes: 'Infra Standing Desk Duo',
          },
        ],
      },
    },
  });

  const quote2 = await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      vendorId: techCore.id,
      status: 'UNDER_REVIEW',
      validUntil: new Date('2026-07-05'),
      deliverySchedule: '14 days from PO release',
      paymentTerms: '30 days net',
      notes: 'Premium commercial grade warranty included.',
      totalAmount: 212400.0,
      items: {
        create: [
          {
            rfqItemId: rfq1.items[0].id,
            unitPrice: 3800.0,
            totalPrice: 95000.0,
          },
          {
            rfqItemId: rfq1.items[1].id,
            unitPrice: 8500.0,
            totalPrice: 85000.0,
          },
        ],
      },
    },
  });

  // 5. Create Purchase Order
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-0001',
      rfqId: rfq1.id,
      quotationId: quote1.id,
      status: 'ACCEPTED',
      totalAmount: 200010.0,
      shippingAddress: '123 Business Park, Ahmedabad',
    },
  });

  // 6. Create Invoice
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-1024',
      purchaseOrderId: po1.id,
      status: 'SUBMITTED',
      amount: 200010.0,
      invoiceDate: new Date('2026-06-05'),
      dueDate: new Date('2026-07-05'),
      fileUrl: '/uploads/invoices/inv-2026-1024.pdf',
    },
  });

  // 7. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { category: 'VENDOR', message: 'Vendor profile created - FastLog Transport registered and pending verification', timestamp: new Date('2026-06-01T15:20:00Z'), user: 'System' },
      { category: 'RFQ', message: 'RFQ published - office furniture Procurement Q2 sent to assigned vendors', timestamp: new Date('2026-06-02T10:00:00Z'), user: 'Rahul Mehta' },
      { category: 'APPROVAL', message: 'Quotation selected - Infra Supplies Pvt Ltd selected for office furniture Q2', timestamp: new Date('2026-06-04T09:15:00Z'), user: 'Rahul Mehta' },
      { category: 'APPROVAL', message: 'Quotation approved - PO PO-2026-0001 generated for Infra Supplies Pvt Ltd', timestamp: new Date('2026-06-04T21:15:00Z'), user: 'Priya Shah' },
    ],
  });

  console.log('Local SQLite database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
