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
import type { CommitteeResponse } from '../types/committee.types';
import TablePaginationBar, { TABLE_PAGE_SIZE } from '../../dashboard/shared/components/TablePaginationBar';

interface CommitteesListProps {
  committees: CommitteeResponse[];
  selectedId: number | null;
  onSelect: (committee: CommitteeResponse) => void;
}

const isActiveStatus = (status: string) => status.toLowerCase() === 'active';

const CommitteesList = ({ committees, selectedId, onSelect }: CommitteesListProps) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(committees.length / TABLE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCommittees = committees.slice((safePage - 1) * TABLE_PAGE_SIZE, safePage * TABLE_PAGE_SIZE);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Committees
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
                align="right"
                sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {committees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ border: 0, py: 6 }}>
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
                    <TableCell>{committee.name}</TableCell>
                    <TableCell align="right">
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

      <TablePaginationBar total={committees.length} page={safePage} onPageChange={setPage} />
    </Box>
  );
};

export default CommitteesList;
