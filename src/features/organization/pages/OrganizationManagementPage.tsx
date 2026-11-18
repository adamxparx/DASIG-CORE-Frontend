import Alert from '@mui/material/Alert';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../lib/api/client';
import { routes } from '../../../routes';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import LocationToast from '../../dashboard/shared/components/LocationToast';
import { organizationService } from '../api/organizationService';
import OrganizationsList from '../components/OrganizationsList';
import type { OrganizationResponse } from '../types/organization.types';

const OrganizationManagementPage = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const data = await organizationService.getAll();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load organizations.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  if (error) {
    return (
      <AdminPageLayout>
        <Alert severity="error">{error}</Alert>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <OrganizationsList
        organizations={organizations}
        selectedId={null}
        isLoading={isLoading}
        onSelect={(organization) => navigate(`${routes.adminOrganizations}/${organization.id}/edit`)}
        onRefresh={() => void loadOrganizations()}
        onCreate={() => navigate(`${routes.adminOrganizations}/new`)}
      />

      <LocationToast />
    </AdminPageLayout>
  );
};

export default OrganizationManagementPage;