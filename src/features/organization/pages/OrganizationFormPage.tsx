import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../../lib/api/client';
import { routes } from '../../../routes';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import AdminFormPageShell from '../../dashboard/shared/components/AdminFormPageShell';
import { FormSkeleton } from '../../shared/components';
import { organizationService } from '../api/organizationService';
import type { OrganizationResponse } from '../types/organization.types';
import CreateOrganizationForm from '../components/CreateOrganizationForm';
import EditOrganizationForm from '../components/EditOrganizationForm';

interface OrganizationFormPageProps {
  mode: 'create' | 'edit';
}

const OrganizationFormPage = ({ mode }: OrganizationFormPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (mode !== 'edit') {
      return;
    }
    setIsLoading(true);
    try {
      const organizationId = Number(id);
      if (!Number.isFinite(organizationId)) {
        setError('Invalid organization identifier.');
        return;
      }
      const data = await organizationService.getById(organizationId);
      setOrganization(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the organization.');
    } finally {
      setIsLoading(false);
    }
  }, [id, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const goToList = (toast?: string) =>
    navigate(routes.adminOrganizations, toast ? { state: { toast } } : undefined);

  if (isLoading) {
    return (
      <AdminFormPageShell
        title={mode === 'create' ? 'Create Organization' : 'Edit Organization'}
        description={
          mode === 'create'
            ? 'Fill in the details below to register a new organization.'
            : 'Modify the organization details below and save your changes.'
        }
        breadcrumbItems={[
          { label: 'Organizations', href: routes.adminOrganizations },
          { label: mode === 'create' ? 'Create Organization' : 'Loading...' },
        ]}
        actions={
          <Skeleton variant="rounded" height={36} width={140} sx={{ borderRadius: 2 }} />
        }
      >
        <FormSkeleton fields={6} showTitle={false} />
      </AdminFormPageShell>
    );
  }

  if (error || (mode === 'edit' && !organization)) {
    return (
      <AdminPageLayout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? 'Organization not found.'}
        </Alert>
        <Button variant="outlined" onClick={() => goToList()}>
          Back to Organizations
        </Button>
      </AdminPageLayout>
    );
  }

  if (mode === 'create') {
    return (
      <CreateOrganizationForm
        onCreated={() => goToList('Organization created successfully.')}
      />
    );
  }

  return (
    <EditOrganizationForm
      key={organization!.id}
      organization={organization!}
      onUpdated={() => goToList('Organization updated successfully.')}
      onDeactivated={() => goToList('Organization deactivated successfully.')}
      onActivated={() => goToList('Organization activated successfully.')}
    />
  );
};

export default OrganizationFormPage;