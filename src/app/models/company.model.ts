/**
 * Represents a bus company in the system
 */
export interface Company {
  id: number;
  companyId:number;
  companyName: string;
  contactEmail: string;
  contactPerson:String;
  contactPhone: string;
  licenseNumber:String;
  address: string;
  status: CompanyStatus;
  active: boolean;
  busCount: number;
  routeCount: number;
  registrationDate: Date;
}

/**
 * Possible statuses for a company
 */
export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

/**
 * Company statistics for admin dashboard
 */
export interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  suspendedCompanies: number;
  totalBuses: number;
  totalRoutes: number;
}

/**
 * Data required to create a new company
 */
export interface CreateCompanyDto {
  name: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * Data for updating an existing company
 */
export interface UpdateCompanyDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: CompanyStatus;
}
