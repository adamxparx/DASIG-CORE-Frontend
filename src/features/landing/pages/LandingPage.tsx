import { type FormEvent, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import dasig_logo from '../../../assets/dasig_logo.svg';
import { useLogin } from '../../auth/hooks/useLogin';

const LandingPage = () => {
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const { login, error, isLoading } = useLogin();

  const getEmailError = (value: string): string => {
    if (!value.trim()) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const getPasswordError = (value: string): string => {
    if (!value) {
      return 'Password is required.';
    }
    return '';
  };

  const emailError = emailTouched ? getEmailError(email) : '';
  const passwordError = passwordTouched ? getPasswordError(password) : '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    const emailErr = getEmailError(email);
    const passwordErr = getPasswordError(password);

    if (emailErr || passwordErr) {
      return;
    }

    void login({ username: email.trim(), password });
  };

  const featureHighlights = [
    {
      icon: <AssignmentTurnedInOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />,
      title: 'Standardized KPI Tracking',
      description: 'Streamlined submission workflows for administrators, committee leads, and members.',
    },
    {
      icon: <InsightsOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />,
      title: 'Real-Time Progress Metrics',
      description: 'Live operational indicators and milestone monitoring across consortium units.',
    },
    {
      icon: <DescriptionOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />,
      title: 'Auditable Executive Reports',
      description: 'Consolidated reporting and data export tailored for consortium governance.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8FAFC',
        backgroundImage: 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(66, 110, 240, 0.07), transparent 70%)',
        color: '#0F172A',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      {/* Top Header */}
      <Box
        component="header"
        sx={{
          py: { xs: 1.5, xl: 2 },
          px: { xs: 2.5, sm: 4, md: 6, xl: 8 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.75, xl: 2 } }}>
          <Box
            component="img"
            src={dasig_logo}
            alt="DASIG Logo"
            sx={{ width: { xs: 40, xl: 46 }, height: { xs: 40, xl: 46 }, objectFit: 'contain' }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.2px',
              fontSize: { xs: '1rem', xl: '1.2rem' },
            }}
          >
            DASIG-CORE
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area: Split Hero */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 3.5, sm: 4.5, md: 3, xl: 5 },
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: { xs: '100%', sm: 600, md: 1040, lg: 1200, xl: 1440 },
            my: 'auto',
            px: { xs: 2.5, sm: 3, md: 4, xl: 5 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr', xl: '1.2fr 0.8fr' },
              gap: { xs: 0, md: 0 },
              alignItems: 'center',
            }}
          >
            {/* Left Column: Brand & Context */}
            <Box
              sx={{
                pr: { md: 5, lg: 7, xl: 9 },
                py: { md: 2, xl: 3 },
                order: { xs: 2, md: 1 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.35rem', xl: '2.85rem' },
                  letterSpacing: '-0.6px',
                  lineHeight: { xs: 1.18, xl: 1.16 },
                  color: '#0F172A',
                  mb: { xs: 1.75, xl: 2.5 },
                }}
              >
                Consortium Oversight and Reporting Environment
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  fontSize: { xs: '0.925rem', md: '1rem', xl: '1.125rem' },
                  lineHeight: { xs: 1.6, xl: 1.65 },
                  mb: { xs: 2.75, xl: 3.75 },
                  maxWidth: { xs: '100%', md: 540, xl: 640 },
                }}
              >
                DASIG-CORE centralizes KPI submission, verification, and governance. Empowering DASIG administrators,
                committee leads, and members with timely metrics and auditable reporting.
              </Typography>

              {/* Feature Highlights Cards */}
              <Stack spacing={{ xs: 1.5, xl: 2.25 }} sx={{ mb: { xs: 2, md: 0 } }}>
                {featureHighlights.map((feat) => (
                  <Box
                    key={feat.title}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: { xs: 1.75, xl: 2.25 },
                      p: { xs: 1.5, xl: 2 },
                      bgcolor: '#FFFFFF',
                      borderRadius: 2.5,
                      border: '1px solid rgba(226, 232, 240, 0.95)',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(66, 110, 240, 0.25)',
                        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: { xs: 1, xl: 1.25 },
                        borderRadius: 2,
                        bgcolor: 'rgba(66, 110, 240, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        '& svg': {
                          fontSize: { xs: 20, xl: 24 },
                        },
                      }}
                    >
                      {feat.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: '#1E293B',
                          fontSize: { xs: '0.875rem', xl: '1rem' },
                          mb: 0.25,
                        }}
                      >
                        {feat.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          lineHeight: { xs: 1.4, xl: 1.5 },
                          fontSize: { xs: '0.8rem', xl: '0.875rem' },
                        }}
                      >
                        {feat.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Right Column: Unboxed Login Form with Separator */}
            <Box
              sx={{
                pl: { md: 5, lg: 7, xl: 9 },
                py: { md: 2, xl: 3 },
                pb: { xs: 4, md: 2, xl: 3 },
                mb: { xs: 3, md: 0 },
                borderLeft: { md: '1px solid rgba(226, 232, 240, 0.85)' },
                borderBottom: { xs: '1px solid rgba(226, 232, 240, 0.85)', md: 'none' },
                order: { xs: 1, md: 2 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 420, xl: 470 },
                  mx: 'auto',
                }}
              >
              <Box sx={{ mb: { xs: 3, xl: 3.5 } }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.3px',
                    fontSize: { xs: '1.4rem', md: '1.6rem', xl: '1.9rem' },
                  }}
                >
                  Sign In
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    mt: { xs: 0.75, xl: 1 },
                    fontSize: { xs: '0.875rem', xl: '0.975rem' },
                  }}
                >
                  Enter your consortium credentials to access your dashboard.
                </Typography>
              </Box>

              {successMessage && !error && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Stack spacing={{ xs: 2.5, xl: 3 }}>
                <TextField
                  fullWidth
                  id="email-input"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@institution.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  autoComplete="email"
                  required
                  error={Boolean(emailError)}
                  helperText={emailError}
                  disabled={isLoading}
                  slotProps={{
                    htmlInput: {
                      'aria-required': 'true',
                      'aria-invalid': Boolean(emailError),
                      'aria-describedby': emailError ? 'email-helper-text' : undefined,
                    },
                    formHelperText: {
                      id: 'email-helper-text',
                      sx: { mx: 0, mt: 0.75, fontSize: { xs: '0.8rem', xl: '0.875rem' }, fontWeight: 500 },
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon
                            sx={{
                              color: emailError ? 'error.main' : '#94A3B8',
                              fontSize: { xs: 20, xl: 22 },
                              transition: 'color 0.2s ease',
                            }}
                          />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                        fontSize: { xs: '0.95rem', xl: '1.05rem' },
                        '& .MuiInputBase-input': {
                          py: { xs: 1.75, xl: 2 },
                        },
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  id="password-input"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  autoComplete="current-password"
                  required
                  error={Boolean(passwordError)}
                  helperText={passwordError}
                  disabled={isLoading}
                  slotProps={{
                    htmlInput: {
                      'aria-required': 'true',
                      'aria-invalid': Boolean(passwordError),
                      'aria-describedby': passwordError ? 'password-helper-text' : undefined,
                    },
                    formHelperText: {
                      id: 'password-helper-text',
                      sx: { mx: 0, mt: 0.75, fontSize: { xs: '0.8rem', xl: '0.875rem' }, fontWeight: 500 },
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon
                            sx={{
                              color: passwordError ? 'error.main' : '#94A3B8',
                              fontSize: { xs: 20, xl: 22 },
                              transition: 'color 0.2s ease',
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            size="small"
                            sx={{ color: '#94A3B8' }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                        fontSize: { xs: '0.95rem', xl: '1.05rem' },
                        '& .MuiInputBase-input': {
                          py: { xs: 1.75, xl: 2 },
                        },
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  sx={{
                    mt: { xs: 0.5, xl: 1 },
                    py: { xs: 1.35, xl: 1.6 },
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: { xs: '0.95rem', xl: '1.05rem' },
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(66, 110, 240, 0.3)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: '#325ad8',
                      boxShadow: '0 6px 20px rgba(66, 110, 240, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                      boxShadow: '0 2px 8px rgba(66, 110, 240, 0.3)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid #426ef0',
                      outlineOffset: '2px',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'rgba(66, 110, 240, 0.65)',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Signing in…</span>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
        </Container>
      </Box>

      {/* Clean Minimalist Footer */}
      <Box
        component="footer"
        sx={{
          py: { xs: 2, md: 1.5, xl: 2 },
          px: 3,
          textAlign: 'center',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          bgcolor: '#FFFFFF',
          flexShrink: 0,
          mt: { xs: 4, md: 0 },
        }}
      >
        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: { xs: '0.75rem', xl: '0.85rem' } }}>
          &copy; {new Date().getFullYear()} DASIG-CORE
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
