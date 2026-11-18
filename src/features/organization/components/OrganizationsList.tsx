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
import type { OrganizationResponse } from '../types/organization.types';
import TablePaginationBar from '../../dashboard/shared/components/TablePaginationBar';
import SortableTableHeadCell from '../../dashboard/shared/components/SortableTableHeadCell';
import { useTableSort } from '../../dashboard/shared/hooks/useTableSort';

const PAGE_SIZE = 8;
const TABLE_FIXED_HEIGHT = 480;

interface OrganizationsListProps {
  organizations: OrganizationResponse[];
  selectedId: number | null;
  onSelect: (organization: OrganizationResponse) => void;
  onRefresh: () => void;
  onCreate: () => void;
  isLoading?: boolean;
}

const isActiveStatus = (status: string) => status.toLowerCase() === 'active';

const compareOrganizations = (a: OrganizationResponse, b: OrganizationResponse, key: string): number => {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
    case 'committees':
      return (a.committeeNames?.join(', ') ?? '').localeCompare(b.committeeNames?.join(', ') ?? '', undefined, {
        sensitivity: 'base',
      });
    case 'status':
      return a.status.localeCompare(b.status, undefined, { sensitivity: 'base' });
    case 'id':
    default:
      return a.id - b.id;
  }
};

const OrganizationsList = ({
  organizations,
  selectedId,
  onSelect,
  onRefresh,
  onCreate,
  isLoading = false,
}: OrganizationsListProps) => {
  const [page, setPage] = useState(1);
  const { sorted, sort, toggleSort } = useTableSort(organizations, compareOrganizations, 'id', 'desc');

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedOrganizations = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mb: 1.5 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Organizations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update, and deactivate organizations across the consortium.
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
            Create Organization
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
                label="Committee"
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
                    <Skeleton variant="rounded" height={20} width="40%" />
                  </TableCell>
                </TableRow>
              ))
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ border: 0, py: 6 }}>
                  <Typography align="center" color="text.secondary">
                    There are no existing organizations yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedOrganizations.map((org) => {
                const isSelected = selectedId === org.id;

                return (
                  <TableRow
                    key={org.id}
                    hover
                    onClick={() => onSelect(org)}
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
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{org.name}</TableCell>
                    <TableCell>{org.committeeNames.length > 0 ? org.committeeNames.join(', ') : '—'}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: isActiveStatus(org.status) ? 'success.main' : 'text.secondary',
                        }}
                      >
                        {org.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePaginationBar total={organizations.length} page={safePage} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </Box>
  );
};

export default OrganizationsList;
