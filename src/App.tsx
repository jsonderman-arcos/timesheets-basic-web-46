import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MuiAppLayout } from "@/components/layout/MuiAppLayout";
import DashboardPage from "./pages/DashboardPage";
import TimesheetPage from "./pages/TimesheetPage";
import ExportPage from "./pages/ExportPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import GpsPage from "./pages/GpsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MuiAppLayout><DashboardPage /></MuiAppLayout>} />
          <Route path="/timesheets" element={<MuiAppLayout><TimesheetPage /></MuiAppLayout>} />
          <Route path="/export" element={<MuiAppLayout><ExportPage /></MuiAppLayout>} />
          <Route path="/exceptions" element={<MuiAppLayout><ExceptionsPage /></MuiAppLayout>} />
          <Route path="/gps" element={<MuiAppLayout><GpsPage /></MuiAppLayout>} />
          <Route path="/reports" element={<MuiAppLayout><ReportsPage /></MuiAppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
