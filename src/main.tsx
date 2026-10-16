import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import theme from './theme.ts';

// MSAL imports
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './lib/config/authConfig';

// Create the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the instance and handle redirect promise before rendering
msalInstance.initialize().then(async () => {
  await msalInstance.handleRedirectPromise();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </MsalProvider>
    </StrictMode>,
  );
});