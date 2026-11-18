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
import { organizationService } from '../../organization/api/organizationService';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import { committeeService } from '../../committee/api/committeeService';
import type { CommitteeResponse } from '../../committee/types/committee.types';
import { userService } from '../api/userService';
import type { UserResponse } from '../types/user.types';
import CreateUserAccountForm from '../components/CreateUserAccountForm';
import EditUserAccountForm from '../components/EditUserAccountForm';
import type { UserListItem } from '../components/UsersList';

interface UserFormPageProps {
  mode: 'create' | 'edit';
}

function toUserListItem(
  user: UserResponse,
  organizations: OrganizationResponse[],
  committees: CommitteeResponse[],
): UserListItem {
  const organization = organizations.find((org) => org.id === user.organizationId);
  const userCommittees = committees.filter((c) => (user.committeeIds ?? []).includes(c.id));
  return {
    ...user,
    organizationName: organization?.name ?? null,
    committeeNames: userCommittees.map((c) => c.name),
  };
}

const UserFormPage = ({ mode }: UserFormPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [committees, setCommittees] = useState<CommitteeResponse[]>([]);
  const [user, setUser] = useState<UserListItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orgData, committeeData] = await Promise.all([
        organizationService.getAll(),
        committeeService.getAll(),
      ]);
      setOrganizations(orgData);
      setCommittees(committeeData);

      if (mode === 'edit') {
        const userId = Number(id);
        if (!Number.isFinite(userId)) {
          setError('Invalid user identifier.');
          return;
        }
        const [userData, me] = await Promise.all([
          userService.getById(userId),
          userService.getCurrentUser(),
        ]);
        setUser(toUserListItem(userData, orgData, committeeData));
        setCurrentUserId(me.id);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the user form.');
    } finally {
      setIsLoading(false);
    }
  }, [id, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const goToList = (toast?: string) => navigate(routes.adminUsers, toast ? { state: { toast } } : undefined);

  if (isLoading) {
    return (
      <AdminFormPageShell
        title={mode === 'create' ? 'Create User Account' : 'Update User Account'}
        description={
          mode === 'create'
            ? 'Fill in the details below to set up a new user account.'
            : 'Modify the account details below and save your changes.'
        }
        breadcrumbItems={[
          { label: 'Users', href: routes.adminUsers },
          { label: mode === 'create' ? 'Create User' : 'Loading...' },
        ]}
        actions={
          <Skeleton variant="rounded" height={36} width={130} sx={{ borderRadius: 2 }} />
        }
      >
        <FormSkeleton fields={5} showTitle={false} />
      </AdminFormPageShell>
    );
  }

  if (error || (mode === 'edit' && !user)) {
    return (
      <AdminPageLayout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? 'User not found.'}
        </Alert>
        <Button variant="outlined" onClick={() => goToList()}>
          Back to Users
        </Button>
      </AdminPageLayout>
    );
  }

  if (mode === 'create') {
    return (
      <CreateUserAccountForm
        organizations={organizations}
        committees={committees}
        onCreated={() => goToList('User account created successfully.')}
      />
    );
  }

  const isSelf = user != null && currentUserId === user.id;

  return (
    <EditUserAccountForm
      key={user!.id}
      user={user!}
      organizations={organizations}
      committees={committees}
      isSelf={isSelf}
      onUpdated={() => goToList('User account updated successfully.')}
      onDeactivated={() => goToList('User account deactivated successfully.')}
      onActivated={() => goToList('User account activated successfully.')}
    />
  );
};

export default UserFormPage;