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
import type { CommitteeResponse } from '../types/committee.types';
import { userService } from '../../user/api/userService';
import type { UserResponse } from '../../user/types/user.types';
import CreateCommitteeForm from '../components/CreateCommitteeForm';
import EditCommitteeForm from '../components/EditCommitteeForm';
import CommitteesList from '../components/CommitteesList';

const CommitteeManagementPage = () => {
  const [committees, setCommittees] = useState<CommitteeResponse[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadPageData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [committeeData, orgData, userData] = await Promise.all([
        committeeService.getAll(),
        organizationService.getAll(),
        userService.getAll(),
      ]);
      setCommittees(committeeData);
      setOrganizations(orgData);
      setUsers(userData);
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

        {selectedCommittee ? (
          <EditCommitteeForm
            key={selectedCommittee.id}
            committee={selectedCommittee}
            organizations={organizations}
            users={users}
            onUpdated={handleUpdated}
            onDeactivated={handleDeactivated}
            onCancel={handleEditCancel}
          />
        ) : (
          <CreateCommitteeForm organizations={organizations} users={users} onCreated={handleCreated} />
        )}

        <Divider />

        <CommitteesList
          committees={committees}
          selectedId={selectedCommittee?.id ?? null}
          onSelect={handleSelect}
          organizations={organizations}
        />
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
