import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import TimesheetPage from "./pages/TimesheetPage";
import ExportPage from "./pages/ExportPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import GpsPage from "./pages/GpsPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/timesheets" element={<AppLayout><TimesheetPage /></AppLayout>} />
            <Route path="/export" element={<AppLayout><ExportPage /></AppLayout>} />
            <Route path="/exceptions" element={<AppLayout><ExceptionsPage /></AppLayout>} />
            <Route path="/gps" element={<AppLayout><GpsPage /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
