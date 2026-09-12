import {
  CompanyDSA,
  CompanyDSAWithTeamSummary,
  UpdateCompanyData,
} from "../entities/CompanyDSA";

export interface ICompanyDSARepository {
  findByUserId(userId: string): Promise<CompanyDSA | null>;
  findById(id: string): Promise<CompanyDSA | null>;
  findByCompanyCode(code: string): Promise<CompanyDSA | null>;
  getWithTeamSummary(userId: string): Promise<CompanyDSAWithTeamSummary | null>;
  update(companyId: string, data: UpdateCompanyData): Promise<CompanyDSA>;
}
