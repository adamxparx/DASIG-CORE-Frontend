import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
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
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { OrganizationResponse } from '../../organization/types/organization.types';

interface OrganizationPickerDialogProps {
  open: boolean;
  organizations: OrganizationResponse[];
  selectedIds: number[];
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
}

const OrganizationPickerDialog = ({
  open,
  organizations,
  selectedIds,
  onClose,
  onConfirm,
}: OrganizationPickerDialogProps) => {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState<number[]>(selectedIds);

  const activeOrgs = organizations.filter((o) => o.status.toLowerCase() === 'active');

  const filtered = search.trim()
    ? activeOrgs.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    : activeOrgs;

  const handleOpen = () => {
    setLocalSelected(selectedIds);
    setSearch('');
  };

  const toggleOrg = (id: number) => {
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
      TransitionProps={{ onEnter: handleOpen }}
      slotProps={{
        paper: {
          sx: { borderRadius: 3 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Select Organizations</DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search organizations..."
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
              No organizations found.
            </Typography>
          ) : (
            filtered.map((org) => (
              <Box
                key={org.id}
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
                      checked={localSelected.includes(org.id)}
                      onChange={() => toggleOrg(org.id)}
                      size="small"
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BusinessOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">{org.name}</Typography>
                    </Stack>
                  }
                  sx={{ width: '100%', m: 0, py: 0.75 }}
                />
              </Box>
            ))
          )}
        </Box>

        {localSelected.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
            {localSelected.map((id) => {
              const org = organizations.find((o) => o.id === id);
              return (
                <Chip
                  key={id}
                  label={org?.name ?? `Org #${id}`}
                  size="small"
                  onDelete={() => toggleOrg(id)}
                  sx={{ borderRadius: 1.5, fontWeight: 500 }}
                />
              );
            })}
          </Stack>
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

export default OrganizationPickerDialog;
