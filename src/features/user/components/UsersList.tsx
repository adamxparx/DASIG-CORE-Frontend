import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { UserResponse } from '../types/user.types';
import { formatRoleLabel } from '../utils/userDisplay';

export interface UserListItem extends UserResponse {
  organizationName: string | null;
}

interface UsersListProps {
  users: UserListItem[];
  selectedId: number | null;
  onSelect: (user: UserListItem) => void;
}

const isActiveStatus = (status: string) => status.toLowerCase() === 'active';

const UsersList = ({ users, selectedId, onSelect }: UsersListProps) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        User Accounts
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
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                Assigned Organization
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ border: 0, py: 6 }}>
                  <Typography align="center" color="text.secondary">
                    There are no existing accounts yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
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
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{formatRoleLabel(user.role)}</TableCell>
                    <TableCell>{user.organizationName ?? '—'}</TableCell>
                    <TableCell align="right">
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
    </Box>
  );
};

export default UsersList;
