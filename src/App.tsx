import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Navbar from "./components/Navbar";
import FloatingActionButton from "./components/FloatingActionButton";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BabysitterList from "./pages/BabysitterList";
import MyFamily from "./pages/MyFamily";
import CreateRequest from "./pages/CreateRequest";
import RequestDashboard from "./pages/RequestDashboard";
import BabysitterResponse from "./pages/BabysitterResponse";
import Upgrade from "./pages/Upgrade";
import ConfirmUpgrade from "./pages/ConfirmUpgrade";
import { useEffect } from "react";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const SESSION_TIMEOUT = 1000 * 60 * 60; // 1 hour

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    // Check if session is expired
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
      toast({
        title: "Session Expired",
        description: "Please log in again for security reasons.",
        variant: "destructive",
      });
      logout();
      return;
    }
    
    // Update last activity
    localStorage.setItem('lastActivity', Date.now().toString());
    
    // Set up activity listener
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };
    
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [user, logout, toast]);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const isResponsePage = location.pathname.startsWith('/r/');

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {user && !isResponsePage && <Navbar />}
      <div className="max-w-full">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/r/:requestId" element={<BabysitterResponse />} />
          <Route path="/confirm_upgrade" element={<ConfirmUpgrade />} />
          <Route
            path="/"
            element={
              user ? (
                <Index />
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />
          <Route
            path="/upgrade"
            element={
              <PrivateRoute>
                <Upgrade />
              </PrivateRoute>
            }
          />
          <Route
            path="/babysitters"
            element={
              <PrivateRoute>
                <BabysitterList />
              </PrivateRoute>
            }
          />
          <Route
            path="/family"
            element={
              <PrivateRoute>
                <MyFamily />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-request"
            element={
              <PrivateRoute>
                <CreateRequest />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <PrivateRoute>
                <RequestDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      {user && !isResponsePage && <FloatingActionButton />}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;