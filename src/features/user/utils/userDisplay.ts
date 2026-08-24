import type { AccountRole } from '../types/user.types';

const ROLE_LABELS: Record<AccountRole, string> = {
  DASIG_ADMIN: 'DASIG Admin',
  TBI_MANAGER: 'Committee Lead',
  STAFF: 'Member',
};

export function formatRoleLabel(role: string): string {
  if (role in ROLE_LABELS) {
    return ROLE_LABELS[role as AccountRole];
  }
  return role;
}

export const ROLE_OPTIONS: { value: AccountRole; label: string }[] = [
  { value: 'DASIG_ADMIN', label: 'DASIG Admin' },
  { value: 'TBI_MANAGER', label: 'Committee Lead' },
  { value: 'STAFF', label: 'Member' },
];

export function isActiveAccount(status: string): boolean {
  return status.toLowerCase() === 'active';
}
