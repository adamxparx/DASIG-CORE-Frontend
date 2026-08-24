import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import DashboardHeader from '../../dashboard/shared/components/DashboardHeader';
import { organizationService } from '../../organization/api/organizationService';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import { committeeService } from '../api/committeeService';
import CreateCommitteeForm from '../components/CreateCommitteeForm';
import EditCommitteeForm from '../components/EditCommitteeForm';
import CommitteesList from '../components/CommitteesList';
import type { CommitteeResponse } from '../types/committee.types';

const CommitteeManagementPage = () => {
  const [committees, setCommittees] = useState<CommitteeResponse[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadPageData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [committeeData, orgData] = await Promise.all([
        committeeService.getAll(),
        organizationService.getAll(),
      ]);
      setCommittees(committeeData);
      setOrganizations(orgData);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load committee data.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleCreated = () => {
    setSelectedCommittee(null);
    void loadPageData(true);
    showToast('Committee created successfully.');
  };

  const handleSelect = (committee: CommitteeResponse) => {
    setSelectedCommittee(committee);
  };

  const handleEditCancel = () => {
    setSelectedCommittee(null);
  };

  const handleUpdated = () => {
    setSelectedCommittee(null);
    void loadPageData(true);
    showToast('Committee updated successfully.');
  };

  const handleDeactivated = () => {
    setSelectedCommittee(null);
    void loadPageData(true);
    showToast('Committee deactivated successfully.');
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
          title="Committee Management"
          subtitle="Create, Update, and Deactivate Committees"
        />
        <Divider />

        <CommitteesList
          committees={committees}
          selectedId={selectedCommittee?.id ?? null}
          onSelect={handleSelect}
        />

        {selectedCommittee ? (
          <EditCommitteeForm
            key={selectedCommittee.id}
            committee={selectedCommittee}
            organizations={organizations}
            onUpdated={handleUpdated}
            onDeactivated={handleDeactivated}
            onCancel={handleEditCancel}
          />
        ) : (
          <CreateCommitteeForm organizations={organizations} onCreated={handleCreated} />
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

export default CommitteeManagementPage;
