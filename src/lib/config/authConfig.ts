import type { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
        // Dynamically use the active domain (localhost or https://dasig-core.site)
        // If you are using /auth.html, append it like: `${window.location.origin}/auth.html`
        redirectUri: window.location.origin, 
    },
    cache: {
        cacheLocation: "sessionStorage"
    }
};

// For initial login - request OIDC scopes
export const loginRequest = {
    scopes: ["User.Read"]
};

// For acquiring API access token with app roles (self-token for SPA)
// Use the client ID directly as scope, not api://<client-id>/.default
export const apiRequest = {
    scopes: [import.meta.env.VITE_ENTRA_CLIENT_ID]
};