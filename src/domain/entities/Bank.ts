export interface Bank {
  id: string;
  userId: string;
  name: string;
  type: BankType;
  logoUrl: string | null;
  gstin: string | null;
  licenceNumber: string | null;
  contactEmail: string;
  contactPhone: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type BankType = "BANK" | "NBFC" | "HFC";

export interface UpdateBankData {
  name?: string;
  logoUrl?: string;
  contactPhone?: string;
  websiteUrl?: string;
  gstin?: string;
  licenceNumber?: string;
}

export class BankDomain {
  constructor(private readonly props: Bank) {}

  isAlreadyInactive(): boolean {
    return !this.props.isActive;
  }

  get id(): string {
    return this.props.id;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
}
