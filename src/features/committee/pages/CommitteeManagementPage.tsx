import Alert from '@mui/material/Alert';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../lib/api/client';
import { routes } from '../../../routes';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import LocationToast from '../../dashboard/shared/components/LocationToast';
import { organizationService } from '../../organization/api/organizationService';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import { committeeService } from '../api/committeeService';
import type { CommitteeResponse } from '../types/committee.types';
import { userService } from '../../user/api/userService';
import type { UserResponse } from '../../user/types/user.types';
import CommitteesList from '../components/CommitteesList';

const CommitteeManagementPage = () => {
  const navigate = useNavigate();
  const [committees, setCommittees] = useState<CommitteeResponse[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <AdminPageLayout>
        <Alert severity="error">{error}</Alert>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <CommitteesList
        committees={committees}
        selectedId={null}
        isLoading={isLoading}
        onSelect={(committee) => navigate(`${routes.adminCommittees}/${committee.id}/edit`)}
        organizations={organizations}
        users={users}
        onRefresh={() => void loadPageData()}
        onCreate={() => navigate(`${routes.adminCommittees}/new`)}
      />

      <LocationToast />
    </AdminPageLayout>
  );
};

export default CommitteeManagementPage;