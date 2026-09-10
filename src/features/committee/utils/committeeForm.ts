import type { CommitteeFormValues, CommitteeResponse } from '../types/committee.types';

export const emptyCommitteeForm: CommitteeFormValues = {
  name: '',
  description: '',
  organizationIds: [],
  committeeLeadIds: [],
};

export function committeeToFormValues(committee: CommitteeResponse): CommitteeFormValues {
  return {
    name: committee.name,
    description: committee.description ?? '',
    organizationIds: committee.organizationIds ?? [],
    committeeLeadIds: committee.committeeLeadIds ?? [],
  };
}

export function validateCommitteeForm(form: CommitteeFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) {
    errors.name = 'Committee name is required';
  } else if (form.name.trim().length > 255) {
    errors.name = 'Committee name must not exceed 255 characters';
  }
  return errors;
}

export function formValuesToPayload(form: CommitteeFormValues) {
  return {
    name: form.name.trim(),
    ...(form.description.trim() ? { description: form.description.trim() } : {}),
    organizationIds: form.organizationIds,
    committeeLeadIds: form.committeeLeadIds,
  };
}

export function isActiveCommittee(status: string): boolean {
  return status.toLowerCase() === 'active';
}
