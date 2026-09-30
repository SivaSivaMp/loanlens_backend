import { CommissionSplitRule } from "@prisma/client";
import {
  BankAgreement,
  BankAgreementWithBank,
  CommissionSplitRuleListItem,
  CreateAgreementData,
  CreateSplitRuleData,
  ResolvedSplitRule,
  UpdateSplitRuleData,
} from "../entities/Agreement";
import { Bank } from "../entities/Bank";

export interface BankListItem extends Bank {
  productCount: number;
  agreement: {
    exists: boolean;
    isActive: boolean;
    agreedCommissionRate: number | null;
    agreementDate: Date | null;
  } | null;
}

export interface BankListFilters {
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedBanks {
  data: BankListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IAgreementRepository {
  // Bank listing (DSA perspective)
  listBanks(
    companyDsaId: string,
    filters: BankListFilters,
  ): Promise<PaginatedBanks>;

  // Bank agreements
  findAgreement(
    companyDsaId: string,
    bankId: string,
  ): Promise<BankAgreement | null>;
  findAgreementsByCompany(
    companyDsaId: string,
    isActive?: boolean,
  ): Promise<BankAgreementWithBank[]>;
  createAgreement(data: CreateAgreementData): Promise<BankAgreement>;
  toggleAgreement(
    companyDsaId: string,
    bankId: string,
    isActive: boolean,
  ): Promise<BankAgreement>;

  // Commission split rules
  findSplitRulesByCompany(
    companyDsaId: string,
  ): Promise<CommissionSplitRuleListItem[]>;
  findSplitRuleById(id: string): Promise<CommissionSplitRule | null>;
  createSplitRule(data: CreateSplitRuleData): Promise<CommissionSplitRule>;
  updateSplitRule(
    id: string,
    data: UpdateSplitRuleData,
  ): Promise<CommissionSplitRule>;
  deleteSplitRule(id: string): Promise<void>;

  // Split rule resolution (used in Week 4 application logging)
  resolveRule(
    companyDsaId: string,
    fieldAgentId: string,
    productId: string,
  ): Promise<ResolvedSplitRule>;
}
