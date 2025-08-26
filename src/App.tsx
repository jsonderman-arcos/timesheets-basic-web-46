import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavigationLayout } from "@/components/navigation/NavigationLayout";
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
          <Route path="/" element={<NavigationLayout><DashboardPage /></NavigationLayout>} />
          <Route path="/timesheets" element={<NavigationLayout><TimesheetPage /></NavigationLayout>} />
          <Route path="/export" element={<NavigationLayout><ExportPage /></NavigationLayout>} />
          <Route path="/exceptions" element={<NavigationLayout><ExceptionsPage /></NavigationLayout>} />
          <Route path="/gps" element={<NavigationLayout><GpsPage /></NavigationLayout>} />
          <Route path="/reports" element={<NavigationLayout><ReportsPage /></NavigationLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
