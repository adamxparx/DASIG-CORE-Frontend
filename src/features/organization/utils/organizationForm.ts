import type { OrganizationFormValues, OrganizationResponse } from '../types/organization.types';

export const emptyOrganizationForm: OrganizationFormValues = {
  name: '',
  address: '',
  contactNumber: '',
  contactEmail: '',
  description: '',
  committeeIds: [],
  committeeNames: [],
};

export function organizationToFormValues(org: OrganizationResponse): OrganizationFormValues {
  return {
    name: org.name,
    address: org.address,
    contactNumber: org.contactNumber ?? '',
    contactEmail: org.contactEmail,
    description: org.description ?? '',
    committeeIds: org.committeeIds ?? [],
    committeeNames: org.committeeNames ?? [],
  };
}

export function validateOrganizationForm(form: OrganizationFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  } else if (form.name.trim().length > 255) {
    errors.name = 'Name must not exceed 255 characters';
  }
  if (!form.address.trim()) {
    errors.address = 'Address is required';
  } else if (form.address.trim().length > 255) {
    errors.address = 'Address must not exceed 255 characters';
  }
  if (!form.contactEmail.trim()) {
    errors.contactEmail = 'Contact email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
    errors.contactEmail = 'Enter a valid email address';
  } else if (form.contactEmail.trim().length > 255) {
    errors.contactEmail = 'Contact email must not exceed 255 characters';
  }
  if (form.contactNumber.trim().length > 30) {
    errors.contactNumber = 'Contact number must not exceed 30 characters';
  }

  return errors;
}

export function formValuesToPayload(form: OrganizationFormValues) {
  return {
    name: form.name.trim(),
    address: form.address.trim(),
    contactEmail: form.contactEmail.trim(),
    ...(form.contactNumber.trim() ? { contactNumber: form.contactNumber.trim() } : {}),
    ...(form.description.trim() ? { description: form.description.trim() } : {}),
  };
}

export function isActiveOrganization(status: string): boolean {
  return status.toLowerCase() === 'active';
}
