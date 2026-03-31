import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";

import AuthPage from "@/pages/auth";
import DiscoverPage from "@/pages/discover";
import ProfilePage from "@/pages/profile";
import RequestsPage from "@/pages/requests";
import NotificationsPage from "@/pages/notifications";
import AdminPage from "@/pages/admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <MainLayout><DiscoverPage /></MainLayout>
      </Route>
      <Route path="/profile">
        <MainLayout><ProfilePage /></MainLayout>
      </Route>
      <Route path="/requests">
        <MainLayout><RequestsPage /></MainLayout>
      </Route>
      <Route path="/notifications">
        <MainLayout><NotificationsPage /></MainLayout>
      </Route>
      <Route path="/admin">
        <MainLayout requireAdmin><AdminPage /></MainLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
