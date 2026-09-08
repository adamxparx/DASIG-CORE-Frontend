import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { UserResponse } from '../../user/types/user.types';

interface UserPickerDialogProps {
  open: boolean;
  users: UserResponse[];
  selectedIds: number[];
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
}

const UserPickerDialog = ({
  open,
  users,
  selectedIds,
  onClose,
  onConfirm,
}: UserPickerDialogProps) => {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState<number[]>(selectedIds);

  const filtered = search.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    : users;

  const handleOpen = () => {
    setLocalSelected(selectedIds);
    setSearch('');
  };

  const toggleUser = (id: number) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 3 },
        },
        transition: {
          onEnter: handleOpen,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Select Committee Leads</DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Box
          sx={{
            maxHeight: 320,
            overflowY: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
          }}
        >
          {filtered.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No users found.
            </Typography>
          ) : (
            filtered.map((user) => (
              <Box
                key={user.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localSelected.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0, py: 0.75 }}
                />
              </Box>
            ))
          )}
        </Box>

        {localSelected.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
            {localSelected.map((id) => {
              const user = users.find((u) => u.id === id);
              return (
                <Chip
                  key={id}
                  label={user?.name ?? `User #${id}`}
                  size="small"
                  onDelete={() => toggleUser(id)}
                  sx={{ borderRadius: 1.5, fontWeight: 500 }}
                />
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          Confirm ({localSelected.length} selected)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPickerDialog;