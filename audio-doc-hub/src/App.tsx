import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { LoadingBar } from "@/components/LoadingBar";
import Index from "./pages/Index";
import CallsList from "./pages/CallsList";
import CallDetail from "./pages/CallDetail";
import Chat from "./pages/Chat";
import Uploads from "./pages/Uploads";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LoadingBar />
        <CommandPalette />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/calls" element={<CallsList />} />
            <Route path="/calls/:id" element={<CallDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/intelligence" element={<Chat />} />
            <Route path="/uploads" element={<Uploads />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
