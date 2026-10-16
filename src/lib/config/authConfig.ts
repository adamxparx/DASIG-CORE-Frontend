import type { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
        redirectUri: "http://localhost:5173",
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