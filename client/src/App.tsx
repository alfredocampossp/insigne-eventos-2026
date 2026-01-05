import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Companies from "@/pages/Companies";
import Contacts from "@/pages/Contacts";
import Deals from "@/pages/Deals";
import Proposals from "@/pages/Proposals";
import Tasks from "@/pages/Tasks";
import Financial from "@/pages/Financial";
import Calendar from "@/pages/Calendar";
import Reports from "@/pages/Reports";
import Events from "@/pages/Events";
import AdminDataImport from "@/pages/AdminDataImport";
import NotFound from "@/pages/NotFound";

function PrivateRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) return null;

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <DashboardLayout>
      <Component {...rest} />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        {() => <PrivateRoute component={Home} />}
      </Route>
      
      <Route path="/companies">
        {() => <PrivateRoute component={Companies} />}
      </Route>
      <Route path="/contacts">
        {() => <PrivateRoute component={Contacts} />}
      </Route>
      <Route path="/deals">
        {() => <PrivateRoute component={Deals} />}
      </Route>
      <Route path="/proposals">
        {() => <PrivateRoute component={Proposals} />}
      </Route>
      <Route path="/tasks">
        {() => <PrivateRoute component={Tasks} />}
      </Route>
      <Route path="/financial">
        {() => <PrivateRoute component={Financial} />}
      </Route>
      <Route path="/calendar">
        {() => <PrivateRoute component={Calendar} />}
      </Route>
      <Route path="/reports">
        {() => <PrivateRoute component={Reports} />}
      </Route>
      <Route path="/events">
        {() => <PrivateRoute component={Events} />}
      </Route>
      
      {/* Placeholder Routes for now */}
      <Route path="/admin/import">
        {() => <PrivateRoute component={AdminDataImport} />}
      </Route>
      <Route path="/admin">
        {() => <PrivateRoute component={() => <div>Configurações (Em breve)</div>} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
