import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useLogin } from '../hooks/useLogin';
import logo from '../../../assets/logo.png';

const inputSlotProps = {
  input: {
    sx: {
      bgcolor: 'secondary.main',
      borderRadius: 2,
    },
  },
} as const;

const LoginPage = () => {
  const navigate = useNavigate();
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
        flexDirection: 'column',
        bgcolor: '#FFFFFF', // Modern high-contrast pure white background
        overflowX: 'hidden',
      }}
    >
      {/* Same Header as Landing Page, excluding the Sign In button */}
      <Box
        component="header"
        sx={{
          py: 2.5,
          px: { xs: 4, sm: 8, md: 10 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'rgba(0, 0, 0, 0.06)',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={logo}
            alt="DASIG Logo"
            sx={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 1.5 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '0.5px' }}>
            DASIG-CORE
          </Typography>
        </Box>
        <Tooltip title="Back to Landing Page">
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              color: '#475569',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              bgcolor: 'rgba(15, 23, 42, 0.02)',
              '&:hover': {
                color: '#0284C7',
                borderColor: 'rgba(2, 132, 199, 0.2)',
                bgcolor: 'rgba(2, 132, 199, 0.04)',
                transform: 'translateX(-2px)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Login Form Section (Centered) */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            maxWidth: 500, // Significantly larger/wider form card container
            p: { xs: 5, sm: 6.5 }, // More spacious and premium padding
            borderRadius: 4, // Rounded corners matching landing page UI styling
            border: '1px solid rgba(0, 0, 0, 0.06)',
            bgcolor: '#FFFFFF', // High-contrast clean white form card container background
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 50px rgba(66, 110, 240, 0.08)',
              borderColor: 'rgba(66, 110, 240, 0.2)',
            },
          }}
        >
          {/* Logo Branding and User Login Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2.25, // Enlarge the logo frame
                borderRadius: '20px',
                bgcolor: 'rgba(66, 110, 240, 0.03)',
                border: '1px solid rgba(66, 110, 240, 0.08)',
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="DASIG-CORE Logo"
                sx={{
                  width: 80, // Made the logo larger inside the bigger form
                  height: 80,
                  borderRadius: '14px',
                  objectFit: 'contain',
                }}
              />
            </Box>

            {/* Added "User Login" label inside the card header below the logo */}
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                mt: 3,
                letterSpacing: '-0.5px',
              }}
            >
              User Login
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3.5, borderRadius: 2 }}>
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
            sx={{ mb: 3 }}
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
            sx={{ mb: 4.5 }}
            slotProps={inputSlotProps}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.85, // Generously sized button height
              fontWeight: 800,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.05rem', // Slightly larger text
              bgcolor: 'primary.main',
              boxShadow: '0 4px 14px 0 rgba(66, 110, 240, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 6px 20px 0 rgba(66, 110, 240, 0.35)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {isLoading ? 'Logging in…' : 'Login'}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
