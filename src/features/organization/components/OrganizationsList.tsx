import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { OrganizationResponse } from '../types/organization.types';
import TablePaginationBar, { TABLE_PAGE_SIZE } from '../../dashboard/shared/components/TablePaginationBar';

interface OrganizationsListProps {
  organizations: OrganizationResponse[];
  selectedId: number | null;
  onSelect: (organization: OrganizationResponse) => void;
}

const isActiveStatus = (status: string) => status.toLowerCase() === 'active';

const OrganizationsList = ({ organizations, selectedId, onSelect }: OrganizationsListProps) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(organizations.length / TABLE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedOrganizations = organizations.slice((safePage - 1) * TABLE_PAGE_SIZE, safePage * TABLE_PAGE_SIZE);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Organizations
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
              >
                Committee
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.length === 0 ? (
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
                    <TableCell>{org.name}</TableCell>
                    <TableCell>{org.committeeName ?? '—'}</TableCell>
                    <TableCell align="right">
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

      <TablePaginationBar total={organizations.length} page={safePage} onPageChange={setPage} />
    </Box>
  );
};

export default OrganizationsList;
