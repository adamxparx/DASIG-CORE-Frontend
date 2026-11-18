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
import { useState } from 'react';
import type { UserResponse } from '../types/user.types';
import { formatRoleLabel } from '../utils/userDisplay';
import TablePaginationBar from '../../dashboard/shared/components/TablePaginationBar';
import SortableTableHeadCell from '../../dashboard/shared/components/SortableTableHeadCell';
import { useTableSort } from '../../dashboard/shared/hooks/useTableSort';

const PAGE_SIZE = 8;
const TABLE_FIXED_HEIGHT = 480;

export interface UserListItem extends UserResponse {
  organizationName: string | null;
  committeeNames: string[];
}

interface UsersListProps {
  users: UserListItem[];
  selectedId: number | null;
  onSelect: (user: UserListItem) => void;
  onRefresh: () => void;
  onCreate: () => void;
  isLoading?: boolean;
}

const isActiveStatus = (status: string) => status.toLowerCase() === 'active';

const compareUsers = (a: UserListItem, b: UserListItem, key: string): number => {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
    case 'role':
      return formatRoleLabel(a.role).localeCompare(formatRoleLabel(b.role), undefined, {
        sensitivity: 'base',
      });
    case 'organization':
      return (a.organizationName ?? '').localeCompare(b.organizationName ?? '', undefined, {
        sensitivity: 'base',
      });
    case 'committees':
      return (a.committeeNames?.join(', ') ?? '').localeCompare(
        b.committeeNames?.join(', ') ?? '',
        undefined,
        { sensitivity: 'base' },
      );
    case 'status':
      return a.status.localeCompare(b.status, undefined, { sensitivity: 'base' });
    case 'id':
    default:
      return a.id - b.id;
  }
};

const UsersList = ({ users, selectedId, onSelect, onRefresh, onCreate, isLoading = false }: UsersListProps) => {
  const [page, setPage] = useState(1);
  const { sorted, sort, toggleSort } = useTableSort(users, compareUsers, 'id', 'desc');

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mb: 1.5 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            User Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update, and deactivate user accounts across the consortium.
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
            Create User
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
              <SortableTableHeadCell label="Role" columnKey="role" sortKey={sort.key} direction={sort.direction} onSort={toggleSort} />
              <SortableTableHeadCell
                label="Assigned Organization"
                columnKey="organization"
                sortKey={sort.key}
                direction={sort.direction}
                onSort={toggleSort}
              />
              <SortableTableHeadCell
                label="Committees"
                columnKey="committees"
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
                    <Skeleton variant="rounded" height={20} width="70%" />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="rounded" height={20} width="65%" />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="rounded" height={20} width="40%" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ border: 0, py: 6 }}>
                  <Typography align="center" color="text.secondary">
                    There are no existing accounts yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedUsers.map((user) => {
                const isSelected = selectedId === user.id;

                return (
                  <TableRow
                    key={user.id}
                    hover
                    onClick={() => onSelect(user)}
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
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{user.name}</TableCell>
                    <TableCell>{formatRoleLabel(user.role)}</TableCell>
                    <TableCell>{user.organizationName ?? '—'}</TableCell>
                    <TableCell>{user.committeeNames?.length > 0 ? user.committeeNames.join(', ') : '—'}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: isActiveStatus(user.status) ? 'success.main' : 'text.secondary',
                        }}
                      >
                        {user.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePaginationBar total={users.length} page={safePage} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </Box>
  );
};

export default UsersList;
