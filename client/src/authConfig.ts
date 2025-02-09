import { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "22e3144a-5a98-4f90-adbc-ee6c9ff8f544", // Replace with your client ID
    authority:
      "https://login.microsoftonline.com/bbedeab2-1aeb-4de4-86bc-89b6b3432604", // Replace with your tenant ID
    redirectUri: "http://localhost:5173", // Default Vite dev server port
    postLogoutRedirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["api://c595744a-8e21-497a-bdf2-49b34920e06c/access_as_user"],
};

export const protectedResources = {
  api: {
    endpoint: "http://localhost:5269/weatherforecast",
    scopes: ["api://c595744a-8e21-497a-bdf2-49b34920e06c/access_as_user"], // Replace with your API's client ID
  },
};
