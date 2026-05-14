import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Index from "./pages/Index"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import AppLayout from "./components/app/AppLayout"
import Dashboard from "./pages/app/Dashboard"
import Tasks from "./pages/app/Tasks"
import Articles from "./pages/app/Articles"
import Calendar from "./pages/app/Calendar"
import Settings from "./pages/app/Settings"
import { isLoggedIn } from "./lib/auth"

const queryClient = new QueryClient()

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="articles" element={<Articles />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
