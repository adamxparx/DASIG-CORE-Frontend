import type { AccountRole, CreateUserFormValues, UserResponse } from '../types/user.types';

export const emptyUserForm: CreateUserFormValues = {
  name: '',
  email: '',
  role: '',
  organizationId: '',
};

export const requiresOrganization = (role: CreateUserFormValues['role']) =>
  role === 'TBI_MANAGER' || role === 'STAFF';

export function userToFormValues(user: UserResponse): CreateUserFormValues {
  return {
    name: user.name,
    email: user.email,
    role: user.role as AccountRole,
    organizationId: user.organizationId ?? '',
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

export function formValuesToUserPayload(form: CreateUserFormValues) {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role as AccountRole,
    ...(requiresOrganization(form.role)
      ? { organizationId: form.organizationId as number }
      : {}),
  };
}
