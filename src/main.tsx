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
import { tokenStorage } from './features/auth/utils/tokenStorage';

// Create the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the instance and handle redirect promise before rendering
msalInstance.initialize().then(async () => {
  await msalInstance.handleRedirectPromise();

  // After MSAL redirect login, sync the idToken to app tokenStorage (localStorage)
  // so that getSession() can authenticate the user on subsequent page loads.
  const activeAccount = msalInstance.getAllAccounts()[0];
  if (activeAccount) {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        account: activeAccount,
        scopes: ["User.Read"],
      });
      tokenStorage.set(tokenResponse.idToken);
    } catch {
      // Silent token acquisition failed; tokenStorage will remain empty
    }
  }

  // After a successful MSAL redirect login, navigate to the saved deep-link target
  // (e.g. /dashboard/admin/alerts?alertId=123). This is needed because redirectUri
  // must remain static (window.location.origin) per Entra ID requirements.
  const postLoginRedirect = sessionStorage.getItem('postLoginRedirect');
  if (postLoginRedirect) {
    sessionStorage.removeItem('postLoginRedirect');
    window.location.replace(postLoginRedirect);
  }

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