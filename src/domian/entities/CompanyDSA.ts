export interface CompanyDSA {
  id: string;
  userId: string;
  companyName: string;
  gstin: string | null;
  companyCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyDSAWithTeamSummary extends CompanyDSA {
  teamSummary: {
    totalAgents: number;
    activeAgents: number;
    inactiveAgents: number;
  };
}

export interface UpdateCompanyData {
  companyName?: string;
  gstin?: string;
}
