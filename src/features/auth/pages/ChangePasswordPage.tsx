import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { accountService } from '../api/accountService';
import { ApiError } from '../../../lib/api/client';
import { tokenStorage } from '../utils/tokenStorage';
import { routes } from '../../../routes';
import dasig_logo from '../../../assets/dasig_logo.svg';

const inputSlotProps = {
  input: {
    sx: {
      bgcolor: 'secondary.main',
      borderRadius: 2,
    },
  },
} as const;

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await accountService.changePassword({ currentPassword, newPassword });
      tokenStorage.clear();
      navigate(routes.auth, {
        replace: true,
        state: { message: 'Password changed successfully. Please log in with your new password.' },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#FFFFFF',
        px: 2,
        py: { xs: 8, md: 12 },
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: { xs: 5, sm: 6.5 },
          borderRadius: 4,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          bgcolor: '#FFFFFF',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            component="img"
            src={dasig_logo}
            alt="DASIG-CORE Logo"
            sx={{ width: 72, height: 72, borderRadius: '14px', objectFit: 'contain', mb: 2 }}
          />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Change Your Password
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, textAlign: 'center' }}>
            You're using a temporary password. Please set a new one to continue.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Temporary / Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          slotProps={inputSlotProps}
        />

        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          helperText="At least 8 characters."
          sx={{ mb: 3 }}
          slotProps={inputSlotProps}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          sx={{ mb: 4.5 }}
          slotProps={inputSlotProps}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
            py: 1.85,
            fontWeight: 800,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.05rem',
          }}
        >
          {isSubmitting ? 'Updating…' : 'Update Password'}
        </Button>
      </Paper>
    </Box>
  );
};

export default ChangePasswordPage;
