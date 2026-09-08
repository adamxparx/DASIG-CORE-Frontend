import type { AccountRole, CreateUserFormValues, CreateUserRequest, UserResponse } from '../types/user.types';

export const emptyUserForm: CreateUserFormValues = {
  name: '',
  email: '',
  role: '',
  organizationId: '',
  committeeIds: [],
};

export const requiresOrganization = (role: CreateUserFormValues['role']) =>
  role === 'TBI_MANAGER' || role === 'STAFF';

export function userToFormValues(user: UserResponse): CreateUserFormValues {
  return {
    name: user.name,
    email: user.email,
    role: user.role as AccountRole,
    organizationId: user.organizationId ?? '',
    committeeIds: user.committeeIds ?? [],
  };
}

export function validateUserForm(form: CreateUserFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (!form.role) {
    errors.role = 'Role is required';
  }
  if (requiresOrganization(form.role) && form.organizationId === '') {
    errors.organizationId = 'Assigned organization is required for this role';
  }

  return errors;
}

export function formValuesToUserPayload(form: CreateUserFormValues): CreateUserRequest {
  const payload: CreateUserRequest = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role as AccountRole,
    ...(requiresOrganization(form.role)
      ? { organizationId: form.organizationId as number }
      : {}),
  };

  if (form.role === 'TBI_MANAGER' && form.committeeIds.length > 0) {
    payload.committeeIds = form.committeeIds;
  }

  return payload;
}
