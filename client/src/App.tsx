import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import WelcomePage from "@/pages/welcome";
import LoginPage from "@/pages/login";
import MainPage from "@/pages/landing";
import ItemDetailPage from "@/pages/item-detail";
import AdminPage from "@/pages/admin";
import MyBidsPage from "@/pages/my-bids";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/main" component={MainPage} />
      <Route path="/landing" component={() => <Redirect to="/main" />} />
      <Route path="/admin-login" component={() => <Redirect to="/login" />} />
      <Route path="/item/:id" component={ItemDetailPage} />
      <Route path="/my-bids" component={MyBidsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
