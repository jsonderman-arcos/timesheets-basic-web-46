import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavigationLayout } from "@/components/navigation/NavigationLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import TimesheetPage from "./pages/TimesheetPage";
import ExportPage from "./pages/ExportPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import GpsPage from "./pages/GpsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
// Strip unknown props injected by tooling from provider boundaries
function SafeStyledEngineProvider({ children }: { children: React.ReactNode }) {
  return <StyledEngineProvider injectFirst>{children}</StyledEngineProvider>;
}

function SafeThemeProvider({ theme, children }: { theme: any; children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
import { createMuiThemeFromTokens } from "@/theme/createMuiTheme";

const queryClient = new QueryClient();
const theme = createMuiThemeFromTokens();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SafeStyledEngineProvider>
          <SafeThemeProvider theme={theme}>
            {/* Keep Tailwind Preflight; omit CssBaseline */}
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <NavigationLayout><DashboardPage /></NavigationLayout>
                  </ProtectedRoute>
                } />
                <Route path="/timesheets" element={
                  <ProtectedRoute>
                    <NavigationLayout><TimesheetPage /></NavigationLayout>
                  </ProtectedRoute>
                } />
                <Route path="/export" element={
                  <ProtectedRoute>
                    <NavigationLayout><ExportPage /></NavigationLayout>
                  </ProtectedRoute>
                } />
                <Route path="/exceptions" element={
                  <ProtectedRoute>
                    <NavigationLayout><ExceptionsPage /></NavigationLayout>
                  </ProtectedRoute>
                } />
                <Route path="/gps" element={
                  <ProtectedRoute>
                    <NavigationLayout><GpsPage /></NavigationLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <NavigationLayout><ReportsPage /></NavigationLayout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SafeThemeProvider>
        </SafeStyledEngineProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
