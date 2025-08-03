import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Market from "@/pages/market";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import ProductsManagement from "@/pages/products-management";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  const hideNavAndFooter = ["/login", "/register"].includes(location);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavAndFooter && <Navbar />}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/market" component={Market} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/services" component={Services} />
          <Route path="/products-management" component={ProductsManagement} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {!hideNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
