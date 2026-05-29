import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import collaborationConcept from '../../../assets/collaboration_concept.png';
import { routes } from '../../../routes';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate(routes.auth);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF', // Modern high-contrast pure white background
        color: '#0F172A', // Slate dark headings
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Navbar / Header */}
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
        <Button
          variant="outlined"
          onClick={handleGoToLogin}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 3.5,
            py: 0.85,
            borderColor: 'rgba(15, 23, 42, 0.15)',
            color: '#475569', // Muted slate text
            '&:hover': {
              borderColor: '#0284C7', // Sky blue hover
              color: '#0284C7',
              bgcolor: 'rgba(2, 132, 199, 0.04)',
            },
          }}
        >
          Sign In
        </Button>
      </Box>

      {/* Main Split Section - Far Left Layout */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, // Stretches split screen across entire width
          minHeight: 'calc(100vh - 80px)',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
          px: { xs: 4, sm: 8, md: 10, lg: 12 }, // comfortable bezel spacing, shifted to the far left
        }}
      >
        {/* Backing decorative glow bubble (larger, left-aligned) */}
        <Box
          sx={{
            position: 'absolute',
            width: '750px',
            height: '750px',
            borderRadius: '50%',
            bgcolor: 'rgba(66, 110, 240, 0.03)', // Subtle royal blue back glow
            filter: 'blur(120px)',
            zIndex: 0,
            pointerEvents: 'none',
            top: '40%',
            left: '10%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Left Column: Branding and Text aligned to the far left */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start', // All alignment on the left side
            textAlign: 'left', // Left text alignment
            zIndex: 2,
            width: '100%',
          }}
        >
          {/* Logo & Software Title Row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 3.5,
              mb: 2.5,
              width: '100%',
            }}
          >
            {/* Logo Frame */}
            <Box
              sx={{
                display: 'inline-flex',
                p: 1.75,
                borderRadius: '24px',
                bgcolor: 'rgba(66, 110, 240, 0.03)',
                border: '1px solid rgba(66, 110, 240, 0.12)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.4s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="DASIG-CORE Logo"
                sx={{
                  width: 96, // Perfectly sized logo to fit in row
                  height: 96,
                  borderRadius: '16px',
                  objectFit: 'contain',
                }}
              />
            </Box>

            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 900,
                color: '#0F172A',
                lineHeight: 1.0,
                letterSpacing: '-2.5px',
                fontSize: { xs: '3.75rem', sm: '5.25rem', md: '6.5rem' }, // Gigantic Title
              }}
            >
              DASIG-CORE
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: '#0284C7', // Radiant sky blue subtitle
              textTransform: 'uppercase',
              letterSpacing: '5px',
              mb: 4.5,
              pl: { xs: 0, sm: 0.5 },
              fontSize: { xs: '1.15rem', md: '1.35rem' }, // Enlarged Subtitle
            }}
          >
            Consortium KPI Platform
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#475569', // Beautiful slate body text
              mb: 7,
              lineHeight: 1.9,
              fontSize: { xs: '1.25rem', md: '1.45rem' }, // Enlarged Description text
              maxWidth: 720, // Clean width for single-column paragraph readability
            }}
          >
            A high-performance key performance indicator tracking and analytics hub tailored for Technology Business Incubators (TBIs). Empowers staff, managers, and administrators to seamlessly manage submissions, monitor real-time metrics, and generate precise reports.
          </Typography>

          {/* Get Started Button (Bigger, Glassy Sheen) */}
          <Button
            variant="contained"
            onClick={handleGoToLogin}
            sx={{
              px: 9,
              py: 2.75, // Significantly larger padding
              fontWeight: 900,
              borderRadius: '18px', // Premium rounded edges
              textTransform: 'none',
              fontSize: '1.4rem', // Bigger button text
              position: 'relative',
              overflow: 'hidden',
              bgcolor: '#0284C7', // Sky blue
              color: '#FFFFFF',
              boxShadow: '0 8px 32px 0 rgba(2, 132, 199, 0.35)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#0369A1',
                boxShadow: '0 12px 45px 0 rgba(2, 132, 199, 0.5)',
                transform: 'translateY(-2px)',
              },
              // Glass sheen sweep effect
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)',
                transform: 'skewX(-25deg)',
                animation: 'shine 4.5s infinite ease-in-out',
              },
              '@keyframes shine': {
                '0%': {
                  left: '-100%',
                },
                '15%': {
                  left: '150%',
                },
                '100%': {
                  left: '150%',
                },
              },
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Right Column: Floating PNG Illustration */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            width: '100%',
            height: '100%',
            p: { xs: 1, sm: 2, md: 3 }, // Minimal padding to allow illustration to expand fully
          }}
        >
          {/* Circular glow bubble behind illustration */}
          <Box
            sx={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              bgcolor: 'rgba(66, 110, 240, 0.06)', // Subtle Royal Blue aura
              filter: 'blur(80px)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Floating Illustration with rounded corners */}
          <Box
            component="img"
            src={collaborationConcept}
            alt="DASIG-CORE Circular Collaboration Concept"
            sx={{
              width: '100%',
              height: 'auto',
              maxWidth: { xs: '450px', sm: '550px', md: '620px', lg: '680px' },
              maxHeight: { xs: '450px', sm: '550px', md: '620px', lg: '680px' },
              objectFit: 'contain',
              zIndex: 1,
              borderRadius: '40px', // Round the image corners beautifully!
              border: '1px solid rgba(66, 110, 240, 0.08)', // Subtle neon boundary outlining the rounded corners
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)', // Premium depth shadow
              filter: 'drop-shadow(0px 16px 35px rgba(0, 0, 0, 0.06))',
              animation: 'float 6s ease-in-out infinite', // Smooth floating animation
              '@keyframes float': {
                '0%': {
                  transform: 'translateY(0px)',
                },
                '50%': {
                  transform: 'translateY(-15px)',
                },
                '100%': {
                  transform: 'translateY(0px)',
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          textAlign: 'center',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          bgcolor: 'rgba(249, 250, 251, 0.8)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography variant="body2" color="#475569">
          &copy; {new Date().getFullYear()} DASIG-CORE. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
