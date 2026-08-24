import type { CommitteeFormValues, CommitteeResponse } from '../types/committee.types';

export const emptyCommitteeForm: CommitteeFormValues = {
  name: '',
  description: '',
  organizationIds: [],
};

export function committeeToFormValues(committee: CommitteeResponse): CommitteeFormValues {
  return {
    name: committee.name,
    description: committee.description ?? '',
    organizationIds: committee.organizationIds ?? [],
  };
}

export function validateCommitteeForm(form: CommitteeFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) {
    errors.name = 'Committee name is required';
  }
  return errors;
}

export function formValuesToPayload(form: CommitteeFormValues) {
  return {
    name: form.name.trim(),
    ...(form.description.trim() ? { description: form.description.trim() } : {}),
    organizationIds: form.organizationIds,
  };
}

export function isActiveCommittee(status: string): boolean {
  return status.toLowerCase() === 'active';
}
