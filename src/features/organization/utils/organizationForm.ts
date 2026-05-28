import type { OrganizationFormValues, OrganizationResponse } from '../types/organization.types';

export const emptyOrganizationForm: OrganizationFormValues = {
  name: '',
  address: '',
  contactNumber: '',
  contactEmail: '',
  description: '',
};

export function organizationToFormValues(org: OrganizationResponse): OrganizationFormValues {
  return {
    name: org.name,
    address: org.address,
    contactNumber: org.contactNumber ?? '',
    contactEmail: org.contactEmail,
    description: org.description ?? '',
  };
}

export function validateOrganizationForm(form: OrganizationFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!form.address.trim()) {
    errors.address = 'Address is required';
  }
  if (!form.contactEmail.trim()) {
    errors.contactEmail = 'Contact email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
    errors.contactEmail = 'Enter a valid email address';
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
