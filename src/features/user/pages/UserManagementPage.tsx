import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import DashboardHeader from '../../dashboard/shared/components/DashboardHeader';
import { organizationService } from '../../organization/api/organizationService';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import { committeeService } from '../../committee/api/committeeService';
import type { CommitteeResponse } from '../../committee/types/committee.types';
import { userService } from '../api/userService';
import CreateUserAccountForm from '../components/CreateUserAccountForm';
import EditUserAccountForm from '../components/EditUserAccountForm';
import UsersList, { type UserListItem } from '../components/UsersList';
import type { UserResponse } from '../types/user.types';
import { ManagementPageSkeleton } from '../../shared/components';

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
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [committees, setCommittees] = useState<CommitteeResponse[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
      setOrganizations(orgData);
      setCommittees(committeeData);
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleCreated = () => {
    setSelectedUser(null);
    void loadPageData(true);
  };

  const handleSelect = async (user: UserListItem) => {
    setIsLoadingUser(true);
    try {
      const freshUser = await userService.getById(user.id);
      setSelectedUser(toUserListItem(freshUser, organizations, committees));
    } catch {
      setSelectedUser(user);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleEditCancel = () => {
    setSelectedUser(null);
  };

  const handleUpdated = () => {
    setSelectedUser(null);
    void loadPageData(true);
    showToast('User account updated successfully.');
  };

  const handleDeactivated = () => {
    setSelectedUser(null);
    void loadPageData(true);
    showToast('User account deactivated successfully.');
  };

  if (isLoading) {
    return (
      <AdminPageLayout>
        <ManagementPageSkeleton
          formFields={5}
          tableColumns={5}
          tableRows={5}
        />
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
        <DashboardHeader title="User Management" subtitle="Create, Update, and Deactivate Users" />
        <Divider />

        {isLoadingUser ? (
          <Stack spacing={2.5} sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Stack key={index} spacing={1}>
                <Skeleton variant="rounded" height={16} width={140} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100' }} />
              </Stack>
            ))}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1 }}>
              <Skeleton variant="rounded" height={36} width={90} />
              <Skeleton variant="rounded" height={36} width={110} />
            </Stack>
          </Stack>
        ) : selectedUser ? (
          <EditUserAccountForm
            key={selectedUser.id}
            user={selectedUser}
            organizations={organizations}
            committees={committees}
            onUpdated={handleUpdated}
            onDeactivated={handleDeactivated}
            onCancel={handleEditCancel}
          />
        ) : (
          <CreateUserAccountForm organizations={organizations} committees={committees} onCreated={handleCreated} />
        )}

        <Divider />

        <UsersList users={users} selectedId={selectedUser?.id ?? null} onSelect={handleSelect} />
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

export default UserManagementPage;
