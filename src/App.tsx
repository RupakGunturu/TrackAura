import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import RealTimePage from "./pages/RealTimePage";
import FunnelsPage from "./pages/FunnelsPage";
import RetentionPage from "./pages/RetentionPage";
import PerformancePage from "./pages/PerformancePage";
import HeatmapsPage from "./pages/HeatmapsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/realtime" element={<RealTimePage />} />
            <Route path="/funnels" element={<FunnelsPage />} />
            <Route path="/retention" element={<RetentionPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/heatmaps" element={<HeatmapsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
