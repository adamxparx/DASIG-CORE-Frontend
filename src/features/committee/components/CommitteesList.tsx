import Add from '@mui/icons-material/Add';
import Refresh from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import type { CommitteeResponse } from '../types/committee.types';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import type { UserResponse } from '../../user/types/user.types';
import TablePaginationBar from '../../dashboard/shared/components/TablePaginationBar';
import SortableTableHeadCell from '../../dashboard/shared/components/SortableTableHeadCell';
import { useTableSort } from '../../dashboard/shared/hooks/useTableSort';

const PAGE_SIZE = 8;
const TABLE_FIXED_HEIGHT = 480;

interface CommitteesListProps {
  committees: CommitteeResponse[];
  selectedId: number | null;
  onSelect: (committee: CommitteeResponse) => void;
  organizations?: OrganizationResponse[];
  users?: UserResponse[];
  onRefresh: () => void;
  onCreate: () => void;
  isLoading?: boolean;
}

const isActiveStatus = (status: string) => status.toLowerCase() === 'active';

const CommitteesList = ({
  committees,
  selectedId,
  onSelect,
  organizations = [],
  users = [],
  onRefresh,
  onCreate,
  isLoading = false,
}: CommitteesListProps) => {
  const [page, setPage] = useState(1);

  const organizationMap = useMemo(() => {
    return new Map(organizations.map((org) => [org.id, org.name]));
  }, [organizations]);

  const userMap = useMemo(() => {
    return new Map(users.map((user) => [user.id, user.name]));
  }, [users]);

  const truncate = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
  };

  const getOrganizationNames = (committee: CommitteeResponse) => {
    if (!committee.organizationIds || committee.organizationIds.length === 0) {
      return '—';
    }
    const names = committee.organizationIds.map((id) => organizationMap.get(id) ?? `#${id}`);
    const joined = names.join(', ');
    return truncate(joined, 50);
  };

  const getCommitteeLeadNames = (committee: CommitteeResponse) => {
    if (!committee.committeeLeadIds || committee.committeeLeadIds.length === 0) {
      return '—';
    }
    const names = committee.committeeLeadIds.map((id) => userMap.get(id) ?? `#${id}`);
    const joined = names.join(', ');
    return truncate(joined, 50);
  };

  const compareCommittees = (a: CommitteeResponse, b: CommitteeResponse, key: string): number => {
    switch (key) {
      case 'name':
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
      case 'organization':
        return getOrganizationNames(a).localeCompare(getOrganizationNames(b), undefined, {
          sensitivity: 'base',
        });
      case 'leads':
        return getCommitteeLeadNames(a).localeCompare(getCommitteeLeadNames(b), undefined, {
          sensitivity: 'base',
        });
      case 'status':
        return a.status.localeCompare(b.status, undefined, { sensitivity: 'base' });
      case 'id':
      default:
        return a.id - b.id;
    }
  };

  const { sorted, sort, toggleSort } = useTableSort(committees, compareCommittees, 'id', 'desc');

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCommittees = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mb: 1.5 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Committees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update, and deactivate committees across the consortium.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={isLoading}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'divider', color: 'text.primary' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreate}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
          >
            Create Committee
          </Button>
        </Stack>
      </Stack>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          height: TABLE_FIXED_HEIGHT,
          overflowY: 'auto',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
              <SortableTableHeadCell label="Name" columnKey="name" sortKey={sort.key} direction={sort.direction} onSort={toggleSort} />
              <SortableTableHeadCell
                label="Organization"
                columnKey="organization"
                sortKey={sort.key}
                direction={sort.direction}
                onSort={toggleSort}
              />
              <SortableTableHeadCell
                label="Committee Leads"
                columnKey="leads"
                sortKey={sort.key}
                direction={sort.direction}
                onSort={toggleSort}
              />
              <SortableTableHeadCell label="Status" columnKey="status" sortKey={sort.key} direction={sort.direction} onSort={toggleSort} />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="rounded" height={20} width="60%" />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="rounded" height={20} width="50%" />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="rounded" height={20} width="50%" />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="rounded" height={20} width="40%" />
                  </TableCell>
                </TableRow>
              ))
            ) : committees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ border: 0, py: 6 }}>
                  <Typography align="center" color="text.secondary">
                    There are no existing committees yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedCommittees.map((committee) => {
                const isSelected = selectedId === committee.id;

                return (
                  <TableRow
                    key={committee.id}
                    hover
                    onClick={() => onSelect(committee)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'action.hover' : 'transparent',
                      outline: isSelected ? 2 : 'none',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                      '& td': {
                        borderBottom: 1,
                        borderColor: 'divider',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{committee.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getOrganizationNames(committee)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getCommitteeLeadNames(committee)}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: isActiveStatus(committee.status) ? 'success.main' : 'text.secondary',
                        }}
                      >
                        {committee.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePaginationBar total={committees.length} page={safePage} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </Box>
  );
};

export default CommitteesList;
