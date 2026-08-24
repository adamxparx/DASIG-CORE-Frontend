export type OrganizationStatus = 'Active' | 'Inactive';

export interface OrganizationResponse {
  id: number;
  name: string;
  description: string | null;
  address: string;
  contactEmail: string;
  contactNumber: string | null;
  status: OrganizationStatus | string;
  committeeId: number | null;
  committeeName: string | null;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  address: string;
  contactEmail: string;
  contactNumber?: string;
  committeeId?: number | null;
}

export interface UpdateOrganizationRequest {
  name: string;
  description?: string;
  address: string;
  contactEmail: string;
  contactNumber?: string;
  committeeId?: number | null;
}

export interface OrganizationFormValues {
  name: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  description: string;
  committeeId: number | null;
  committeeName: string;
}
