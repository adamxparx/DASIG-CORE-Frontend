import { type FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useLogin } from '../hooks/useLogin';

const inputSlotProps = {
  input: {
    sx: {
      bgcolor: 'secondary.main',
      borderRadius: 1.5,
    },
  },
} as const;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useLogin();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void login({ username: email, password });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        px: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          align="center"
          sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}
        >
          User Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={isLoading}
          sx={{ mb: 2 }}
          slotProps={inputSlotProps}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={isLoading}
          sx={{ mb: 3 }}
          slotProps={inputSlotProps}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{
            py: 1.25,
            fontWeight: 700,
            borderRadius: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          {isLoading ? 'Logging in…' : 'Login'}
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
