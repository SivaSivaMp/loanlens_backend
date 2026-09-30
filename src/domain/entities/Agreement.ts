//Bank Agreement

export interface BankAgreement {
  id: string;
  companyDsaId: string;
  bankId: string;
  agreedCommissionRate: number | null;
  isActive: boolean;
  agreementDate: Date;
  notes: string | null;
}

export interface BankAgreementWithBank extends BankAgreement {
  bank: {
    id: string;
    name: string;
    type: string;
    logoUrl: string | null;
  };
}

export interface CreateAgreementData {
  companyDsaId: string;
  bankId: string;
  agreedCommissionRate?: number;
  notes?: string;
}

//Commision split rule

export interface CommissionSplitRule {
  id: string;
  companyDsaId: string;
  fieldAgentId: string | null;
  productId: string | null;
  agentPercent: number;
  effectiveFrom: Date;
  isActive: boolean;
}

export interface CommissionSplitRuleListItem extends CommissionSplitRule {
  fieldAgentName: string | null;
  productName: string | null;
  isDefault: boolean; // true when both fieldAgentId and productId are null
}

export interface CreateSplitRuleData {
  companyDsaId: string;
  fieldAgentId?: string | null;
  productId?: string | null;
  agentPercent: number;
  effectiveFrom?: Date;
}

export interface UpdateSplitRuleData {
  agentPercent?: number;
  isActive?: boolean;
}

export interface ResolvedSplitRule {
  agentPercent: number;
  companyPercent: number;
  source: "product+agent" | "agent" | "product" | "default";
}

export class CommissionSplitRuleDomain {
  constructor(private readonly props: CommissionSplitRule) {}

  belongsToCompany(companyDsaId: string): boolean {
    return this.props.companyDsaId === companyDsaId;
  }

  get id(): string {
    return this.props.id;
  }
  get companyDsaId(): string {
    return this.props.companyDsaId;
  }
}
