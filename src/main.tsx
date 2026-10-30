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

// After a new deployment, an open tab may ask for page files that no longer exist.
// Reload once so the tab picks up the new version instead of showing an error.
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem('reloadedForNewVersion')) {
    return;
  }
  sessionStorage.setItem('reloadedForNewVersion', 'true');
  event.preventDefault();
  window.location.reload();
});

// True when the stored token is missing or expires within 5 minutes
const tokenNeedsRefresh = (): boolean => {
  const token = tokenStorage.get();
  if (!token) {
    return true;
  }
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp !== 'number' || exp * 1000 - Date.now() < 5 * 60 * 1000;
  } catch {
    return true;
  }
};

// Create the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the instance and handle redirect promise before rendering
msalInstance.initialize().then(async () => {
  await msalInstance.handleRedirectPromise();

  // After MSAL redirect login, sync the idToken to app tokenStorage (localStorage)
  // so that getSession() can authenticate the user on subsequent page loads.
  const activeAccount = msalInstance.getAllAccounts()[0];
  if (activeAccount) {
    const syncToken = msalInstance
      .acquireTokenSilent({ account: activeAccount, scopes: ["User.Read"] })
      .then((tokenResponse) => tokenStorage.set(tokenResponse.idToken))
      .catch(() => {
        // Silent token acquisition failed; tokenStorage keeps its current value
      });

    // Only wait when the stored token is missing or about to expire;
    // otherwise show the app now and let the token refresh in the background.
    if (tokenNeedsRefresh()) {
      await syncToken;
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