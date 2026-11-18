import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  toast?: string | null;
}

/**
 * Shows a success snackbar when the current navigation carries a `toast`
 * message in its history state (e.g. after creating/updating a record and
 * returning to the list page). Closing it clears the state so it only shows once.
 */
const LocationToast = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;
  const open = Boolean(state?.toast);
  const message = state?.toast ?? '';

  const handleClose = () => {
    navigate(location.pathname, { replace: true, state: null });
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity="success" onClose={handleClose} sx={{ borderRadius: 2, fontWeight: 600 }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default LocationToast;