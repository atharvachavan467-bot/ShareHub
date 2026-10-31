import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { CatalogPage } from "./pages/CatalogPage";
import { ResourceDetailPage } from "./pages/ResourceDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BorrowerDashboardPage } from "./pages/BorrowerDashboardPage";
import { OwnerStudioPage } from "./pages/OwnerStudioPage";
import { QualificationsPage } from "./pages/QualificationsPage";
import { IncidentsPage } from "./pages/IncidentsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-surface-950 text-slate-100 selection:bg-brand-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<CatalogPage />} />
                <Route path="/resources" element={<Navigate to="/" replace />} />
                <Route path="/resources/:resourceId" element={<ResourceDetailPage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Borrower & User Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/borrower"
                  element={
                    <ProtectedRoute>
                      <BorrowerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Owner Studio Route */}
                <Route
                  path="/dashboard/owner"
                  element={
                    <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                      <OwnerStudioPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Safety Qualifications Route */}
                <Route
                  path="/qualifications"
                  element={
                    <ProtectedRoute>
                      <QualificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Incidents Route */}
                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute>
                      <IncidentsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>

          <Toaster
            position="top-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f8fafc",
                borderRadius: "1rem",
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
