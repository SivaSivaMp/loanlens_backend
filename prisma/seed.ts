import { prisma } from "../src/infrastructure/database/prisma";
import bcrypt from "bcryptjs";

/**
 * Development seed — creates realistic data for all three B2B portals
 * and one customer portal user.
 *
 * Run: npm run db:seed
 */

async function main() {
  console.log("🌱 Seeding database...");

  const hash = (p: string) => bcrypt.hash(p, 12);

  // ─── 1. Bank Admin ─────────────────────────────────────────────────────────
  const bankUser = await prisma.user.upsert({
    where: { email: "admin@sbibank.com" },
    update: {},
    create: {
      email: "admin@sbibank.com",
      passwordHash: await hash("Password@123"),
      role: "BANK_ADMIN",
      emailVerified: true,
      isActive: true,
    },
  });

  const bank = await prisma.bank.upsert({
    where: { userId: bankUser.id },
    update: {},
    create: {
      userId: bankUser.id,
      name: "State Bank of India",
      type: "BANK",
      contactEmail: "admin@sbibank.com",
      contactPhone: "9800000001",
      isActive: true,
    },
  });

  // ─── 2. Company DSA Admin ─────────────────────────────────────────────────
  const dsaUser = await prisma.user.upsert({
    where: { email: "admin@finbridge.dsa" },
    update: {},
    create: {
      email: "admin@finbridge.dsa",
      passwordHash: await hash("Password@123"),
      role: "COMPANY_DSA",
      emailVerified: true,
      isActive: true,
    },
  });

  const dsa = await prisma.companyDSA.upsert({
    where: { userId: dsaUser.id },
    update: {},
    create: {
      userId: dsaUser.id,
      companyName: "FinBridge Advisory Pvt. Ltd.",
      companyCode: "FINBR001",
      gstin: "27AAAAA0000A1Z5",
      isActive: true,
    },
  });

  // ─── 3. Field Agent ───────────────────────────────────────────────────────
  const agentUser = await prisma.user.upsert({
    where: { email: "arjun.sharma@finbridge.dsa" },
    update: {},
    create: {
      email: "arjun.sharma@finbridge.dsa",
      passwordHash: await hash("Password@123"),
      role: "FIELD_AGENT",
      emailVerified: true,
      isActive: true,
    },
  });

  const agent = await prisma.fieldAgentDSA.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      companyDsaId: dsa.id,
      fullName: "Arjun Sharma",
      phone: "9876543210",
      isActive: true,
    },
  });

  const agentUser2 = await prisma.user.upsert({
    where: { email: "sivamp70@gmail.com" },
    update: {},
    create: {
      email: "sivamp70@gmail.com",
      passwordHash: await hash("Password@123"),
      role: "FIELD_AGENT",
      emailVerified: true,
      isActive: true,
    },
  });

  const agent2 = await prisma.fieldAgentDSA.upsert({
    where: { userId: agentUser2.id },
    update: {},
    create: {
      userId: agentUser2.id,
      companyDsaId: dsa.id,
      fullName: "Meera Nair",
      phone: "9876543211",
      isActive: true,
    },
  });

  const agentUser3 = await prisma.user.upsert({
    where: { email: "sivasivamp70@gmail.com" },
    update: {},
    create: {
      email: "sivasivamp70@gmail.com",
      passwordHash: await hash("Password@123"),
      role: "FIELD_AGENT",
      emailVerified: true,
      isActive: true,
    },
  });

  const agent3 = await prisma.fieldAgentDSA.upsert({
    where: { userId: agentUser2.id },
    update: {},
    create: {
      userId: agentUser2.id,
      companyDsaId: dsa.id,
      fullName: "Meera Nair",
      phone: "9876543211",
      isActive: true,
    },
  });

  // ─── 4. Bank-DSA Agreement ────────────────────────────────────────────────
  await prisma.companyBankAgreement.upsert({
    where: { companyDsaId_bankId: { companyDsaId: dsa.id, bankId: bank.id } },
    update: {},
    create: {
      companyDsaId: dsa.id,
      bankId: bank.id,
      agreedCommissionRate: 0.5,
      isActive: true,
    },
  });

  // ─── 5. Loan Products ─────────────────────────────────────────────────────
  const homeLoan = await prisma.loanProduct.create({
    data: {
      bankId: bank.id,
      name: "SBI MaxGain Home Loan",
      loanType: "HOME",
      status: "ACTIVE",
      rateType: "FLOATING",
      rateMin: 8.5,
      rateMax: 9.85,
      minAmount: 1500000,
      maxAmount: 75000000,
      minTenureMonths: 60,
      maxTenureMonths: 360,
      minMonthlyIncome: 30000,
      minAge: 21,
      maxAge: 70,
      acceptedEmployment: ["SALARIED", "SELF_EMPLOYED"],
      minEmploymentYears: 2,
      minCibilScore: 750,
      processingFeePercent: 0.35,
      commissionPercent: 0.5,
      commissionPayoutDays: 30,
      serviceableStates: ["Kerala", "Karnataka", "Tamil Nadu", "Maharashtra"],
      ltvPercent: 90,
    },
  });

  const personalLoan = await prisma.loanProduct.create({
    data: {
      bankId: bank.id,
      name: "SBI Express Personal Loan",
      loanType: "PERSONAL",
      status: "ACTIVE",
      rateType: "FIXED",
      rateMin: 11.0,
      rateMax: 14.5,
      minAmount: 50000,
      maxAmount: 2000000,
      minTenureMonths: 12,
      maxTenureMonths: 60,
      minMonthlyIncome: 20000,
      minAge: 21,
      maxAge: 58,
      acceptedEmployment: ["SALARIED"],
      minEmploymentYears: 1,
      minCibilScore: 720,
      processingFeePercent: 1.0,
      commissionPercent: 1.5,
      commissionPayoutDays: 15,
      serviceableStates: ["Kerala", "Karnataka", "Tamil Nadu"],
    },
  });

  // ─── 6. Commission Split Rule ─────────────────────────────────────────────
  await prisma.commissionSplitRule.create({
    data: {
      companyDsaId: dsa.id,
      agentPercent: 70, // Agent gets 70%, Company gets 30%
      isActive: true,
    },
  });

  // ─── 7. Portal User ───────────────────────────────────────────────────────
  await prisma.portalUser.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      fullName: "Priya Menon",
      phone: "9845123456",
      email: "customer@test.com",
      passwordHash: await hash("Password@123"),
      emailVerified: true,
      isActive: true,
    },
  });

  console.log("✅ Seed complete!");
  console.log("");
  console.log("📋 Test credentials:");
  console.log("  Bank Admin   → admin@sbibank.com       / Password@123");
  console.log("  Company DSA  → admin@finbridge.dsa     / Password@123");
  console.log("  Field Agent  → arjun.sharma@finbridge.dsa / Password@123");
  console.log("  Portal User  → customer@test.com       / Password@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
