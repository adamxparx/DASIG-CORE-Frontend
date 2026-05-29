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
import { userService } from '../api/userService';
import CreateUserAccountForm from '../components/CreateUserAccountForm';
import EditUserAccountForm from '../components/EditUserAccountForm';
import UsersList, { type UserListItem } from '../components/UsersList';
import type { UserResponse } from '../types/user.types';

function toUserListItem(user: UserResponse, organizations: OrganizationResponse[]): UserListItem {
  const organization = organizations.find((org) => org.id === user.organizationId);
  return {
    ...user,
    organizationName: organization?.name ?? null,
  };
}

function mapUsersToListItems(
  users: UserResponse[],
  organizations: OrganizationResponse[],
): UserListItem[] {
  return users.map((user) => toUserListItem(user, organizations));
}

const UserManagementPage = () => {
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
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
      const [orgData, userData] = await Promise.all([
        organizationService.getAll(),
        userService.getAll(),
      ]);
      setOrganizations(orgData);
      setUsers(mapUsersToListItems(userData, orgData));
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
      setSelectedUser(toUserListItem(freshUser, organizations));
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
        <DashboardHeader title="User Management" subtitle="Create, Update, and Deactivate Users" />
        <Divider />

        <UsersList users={users} selectedId={selectedUser?.id ?? null} onSelect={handleSelect} />

        {isLoadingUser ? (
          <Stack sx={{ py: 6, alignItems: 'center' }}>
            <CircularProgress size={32} />
          </Stack>
        ) : selectedUser ? (
          <EditUserAccountForm
            key={selectedUser.id}
            user={selectedUser}
            organizations={organizations}
            onUpdated={handleUpdated}
            onDeactivated={handleDeactivated}
            onCancel={handleEditCancel}
          />
        ) : (
          <CreateUserAccountForm organizations={organizations} onCreated={handleCreated} />
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

export default UserManagementPage;
