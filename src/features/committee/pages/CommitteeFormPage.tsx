import Alert from '@mui/material/Alert';
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
import { userService } from '../../user/api/userService';
import type { UserResponse } from '../../user/types/user.types';
import { committeeService } from '../api/committeeService';
import type { CommitteeResponse } from '../types/committee.types';
import CreateCommitteeForm from '../components/CreateCommitteeForm';
import EditCommitteeForm from '../components/EditCommitteeForm';

interface CommitteeFormPageProps {
  mode: 'create' | 'edit';
}

const CommitteeFormPage = ({ mode }: CommitteeFormPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [committee, setCommittee] = useState<CommitteeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orgData, userData] = await Promise.all([
        organizationService.getAll(),
        userService.getAll(),
      ]);
      setOrganizations(orgData);
      setUsers(userData);

      if (mode === 'edit') {
        const committeeId = Number(id);
        if (!Number.isFinite(committeeId)) {
          setError('Invalid committee identifier.');
          return;
        }
        const allCommittees = await committeeService.getAll();
        const found = allCommittees.find((c) => c.id === committeeId);
        if (!found) {
          setError('Committee not found.');
          return;
        }
        setCommittee(found);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the committee form.');
    } finally {
      setIsLoading(false);
    }
  }, [id, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const goToList = (toast?: string) =>
    navigate(routes.adminCommittees, toast ? { state: { toast } } : undefined);

  if (isLoading) {
    return (
      <AdminFormPageShell
        title={mode === 'create' ? 'Create Committee' : 'Edit Committee'}
        description={
          mode === 'create'
            ? 'Fill in the details below to set up a new committee.'
            : 'Modify the committee details below and save your changes.'
        }
        breadcrumbItems={[
          { label: 'Committees', href: routes.adminCommittees },
          { label: mode === 'create' ? 'Create Committee' : 'Loading...' },
        ]}
        actions={
          <Skeleton variant="rounded" height={36} width={140} sx={{ borderRadius: 2 }} />
        }
      >
        <FormSkeleton fields={4} showTitle={false} />
      </AdminFormPageShell>
    );
  }

  if (error || (mode === 'edit' && !committee)) {
    return (
      <AdminPageLayout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? 'Committee not found.'}
        </Alert>
        <Button variant="outlined" onClick={() => goToList()}>
          Back to Committees
        </Button>
      </AdminPageLayout>
    );
  }

  if (mode === 'create') {
    return (
      <CreateCommitteeForm
        organizations={organizations}
        users={users}
        onCreated={() => goToList('Committee created successfully.')}
      />
    );
  }

  return (
    <EditCommitteeForm
      key={committee!.id}
      committee={committee!}
      organizations={organizations}
      users={users}
      onUpdated={() => goToList('Committee updated successfully.')}
      onDeactivated={() => goToList('Committee deactivated successfully.')}
      onActivated={() => goToList('Committee activated successfully.')}
    />
  );
};

export default CommitteeFormPage;