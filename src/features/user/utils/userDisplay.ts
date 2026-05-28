import type { AccountRole } from '../types/user.types';

const ROLE_LABELS: Record<AccountRole, string> = {
  DASIG_ADMIN: 'DASIG Admin',
  TBI_MANAGER: 'TBI Manager',
  STAFF: 'Staff',
};

export function formatRoleLabel(role: string): string {
  if (role in ROLE_LABELS) {
    return ROLE_LABELS[role as AccountRole];
  }
  return role;
}

export const ROLE_OPTIONS: { value: AccountRole; label: string }[] = [
  { value: 'DASIG_ADMIN', label: 'DASIG Admin' },
  { value: 'TBI_MANAGER', label: 'TBI Manager' },
  { value: 'STAFF', label: 'Staff' },
];

export function isActiveAccount(status: string): boolean {
  return status.toLowerCase() === 'active';
}
