export type AccountRole = 'DASIG_ADMIN' | 'TBI_MANAGER' | 'STAFF';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: AccountRole | string;
  status: string;
  organizationId: number | null;
  committeeIds: number[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: AccountRole;
  organizationId?: number | null;
  committeeIds?: number[];
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: AccountRole;
  organizationId?: number | null;
  committeeIds?: number[];
}

export interface CreateUserFormValues {
  name: string;
  email: string;
  role: AccountRole | '';
  organizationId: number | '';
  committeeIds: number[];
}
