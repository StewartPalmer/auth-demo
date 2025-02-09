import { useState } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import axios from "axios";
import "./App.css";

// Create a custom axios instance for API calls
const apiClient = axios.create({
  baseURL: "http://localhost:5269",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

interface ApiError {
  message?: string;
  code?: string;
  status?: number;
  response?: {
    data?: unknown;
    status?: number;
    statusText?: string;
  };
}

function App() {
  const { instance } = useMsal();
  const [apiData, setApiData] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
      // Set the first account as active after login if no active account exists
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0 && !instance.getActiveAccount()) {
        instance.setActiveAccount(accounts[0]);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to login");
    }
  };

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/",
    });
  };

  const callProtectedApi = async () => {
    try {
      setError(""); // Clear any previous errors
      let account = instance.getActiveAccount();

      // If no active account, try to set the first available account
      if (!account) {
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
          account = accounts[0];
        } else {
          throw new Error("Please sign in first");
        }
      }

      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });

      const { data } = await apiClient.get("/protected", {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      setApiData(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(e);
      const error = e as ApiError;
      setError(error.message || "Failed to call API");
      setApiData("");
    }
  };

  return (
    <div className="App">
      <AuthenticatedTemplate>
        <h2>Welcome {instance.getActiveAccount()?.username}</h2>
        <button onClick={handleLogout}>Sign Out</button>
        <div style={{ marginTop: "20px" }}>
          <button onClick={callProtectedApi}>Call Protected API</button>
          {error && (
            <div style={{ color: "red", margin: "10px 0" }}>{error}</div>
          )}
          {apiData && (
            <pre style={{ marginTop: "20px", textAlign: "left" }}>
              {apiData}
            </pre>
          )}
        </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <h2>Welcome to the MSAL Protected App</h2>
        <button onClick={handleLogin}>Sign In</button>
        {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
      </UnauthenticatedTemplate>
    </div>
  );
}

export default App;
