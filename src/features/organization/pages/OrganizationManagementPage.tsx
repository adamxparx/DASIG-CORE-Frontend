import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import DashboardHeader from '../../dashboard/shared/components/DashboardHeader';
import { organizationService } from '../api/organizationService';
import CreateOrganizationForm from '../components/CreateOrganizationForm';
import EditOrganizationForm from '../components/EditOrganizationForm';
import OrganizationsList from '../components/OrganizationsList';
import type { OrganizationResponse } from '../types/organization.types';

const OrganizationManagementPage = () => {
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleCreated = () => {
    setSelectedOrganization(null);
    void loadOrganizations(true);
    showToast('Organization created successfully.');
  };

  const handleSelect = (organization: OrganizationResponse) => {
    setSelectedOrganization(organization);
  };

  const handleEditCancel = () => {
    setSelectedOrganization(null);
  };

  const handleUpdated = () => {
    setSelectedOrganization(null);
    void loadOrganizations(true);
    showToast('Organization updated successfully.');
  };

  const handleDeactivated = () => {
    setSelectedOrganization(null);
    void loadOrganizations(true);
    showToast('Organization deactivated successfully.');
  };

  if (isLoading) {
    return (
      <AdminPageLayout>
        <Stack sx={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      </AdminPageLayout>
    );
  }

  if (error) {
    return (
      <AdminPageLayout>
        <Alert severity="error">{error}</Alert>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <Stack spacing={3}>
        <DashboardHeader
          title="Organization Management"
          subtitle="Create, Update, and Deactivate Organizations"
        />
        <Divider />

        <OrganizationsList
          organizations={organizations}
          selectedId={selectedOrganization?.id ?? null}
          onSelect={handleSelect}
        />

        {selectedOrganization ? (
          <EditOrganizationForm
            key={selectedOrganization.id}
            organization={selectedOrganization}
            onUpdated={handleUpdated}
            onDeactivated={handleDeactivated}
            onCancel={handleEditCancel}
          />
        ) : (
          <CreateOrganizationForm onCreated={handleCreated} />
        )}
      </Stack>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </AdminPageLayout>
  );
};

export default OrganizationManagementPage;
