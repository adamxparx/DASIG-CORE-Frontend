import Alert from '@mui/material/Alert';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../lib/api/client';
import { routes } from '../../../routes';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import LocationToast from '../../dashboard/shared/components/LocationToast';
import { organizationService } from '../../organization/api/organizationService';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import { committeeService } from '../../committee/api/committeeService';
import type { CommitteeResponse } from '../../committee/types/committee.types';
import { userService } from '../api/userService';
import UsersList, { type UserListItem } from '../components/UsersList';
import type { UserResponse } from '../types/user.types';

function toUserListItem(user: UserResponse, organizations: OrganizationResponse[], committees: CommitteeResponse[]): UserListItem {
  const organization = organizations.find((org) => org.id === user.organizationId);
  const userCommittees = committees.filter((c) => (user.committeeIds ?? []).includes(c.id));
  return {
    ...user,
    organizationName: organization?.name ?? null,
    committeeNames: userCommittees.map((c) => c.name),
  };
}

function mapUsersToListItems(
  users: UserResponse[],
  organizations: OrganizationResponse[],
  committees: CommitteeResponse[],
): UserListItem[] {
  return users.map((user) => toUserListItem(user, organizations, committees));
}

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPageData = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const [orgData, committeeData, userData] = await Promise.all([
        organizationService.getAll(),
        committeeService.getAll(),
        userService.getAll(),
      ]);
      setUsers(mapUsersToListItems(userData, orgData, committeeData));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load user management data.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
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
      <UsersList
        users={users}
        selectedId={null}
        isLoading={isLoading}
        onSelect={(user) => navigate(`${routes.adminUsers}/${user.id}/edit`)}
        onRefresh={() => void loadPageData()}
        onCreate={() => navigate(`${routes.adminUsers}/new`)}
      />

      <LocationToast />
    </AdminPageLayout>
  );
};

export default UserManagementPage;