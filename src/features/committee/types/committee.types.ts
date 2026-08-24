export type CommitteeStatus = 'Active' | 'Inactive';

export interface CommitteeResponse {
  id: number;
  name: string;
  description: string | null;
  status: CommitteeStatus | string;
  organizationIds: number[];
}

export interface CreateCommitteeRequest {
  name: string;
  description?: string;
  organizationIds: number[];
}

export interface UpdateCommitteeRequest {
  name: string;
  description?: string;
  organizationIds: number[];
}

export interface CommitteeFormValues {
  name: string;
  description: string;
  organizationIds: number[];
}
