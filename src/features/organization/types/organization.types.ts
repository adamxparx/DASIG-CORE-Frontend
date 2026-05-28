export type OrganizationStatus = 'Active' | 'Inactive';

export interface OrganizationResponse {
  id: number;
  name: string;
  description: string | null;
  address: string;
  contactEmail: string;
  contactNumber: string | null;
  status: OrganizationStatus | string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  address: string;
  contactEmail: string;
  contactNumber?: string;
}

export interface UpdateOrganizationRequest {
  name: string;
  description?: string;
  address: string;
  contactEmail: string;
  contactNumber?: string;
}

export interface OrganizationFormValues {
  name: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  description: string;
}
