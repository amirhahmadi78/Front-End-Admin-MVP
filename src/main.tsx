import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import {  HashRouter } from "react-router-dom";
import "./index.css";
import { ErrorBoundary } from "./components/errors/ErrorBoundary.tsx";
import { registerGlobalErrors } from "./utils/globalErrors.ts";

registerGlobalErrors()


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
         <HashRouter>
            <App />
        </HashRouter>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
