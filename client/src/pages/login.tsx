import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // 👈 added useQueryClient
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Gavel } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // 👈 get the query client instance
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showNameField, setShowNameField] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const body: { accountId: string; password: string; name?: string } = { accountId, password };
      if (showNameField && name.trim()) {
        body.name = name.trim();
      }
      const res = await apiRequest("POST", "/api/login", body);
      return res.json();
    },
    onSuccess: (data: { id: number; name: string; role: string }) => {
      // 👇 Invalidate user‑specific queries so they refetch with the new user's data
      queryClient.invalidateQueries({ queryKey: ["/api/bids/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      // Optionally, you can also clear the entire cache:
      // queryClient.clear();

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/main");
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("NEW_USER")) {
        setShowNameField(true);
        toast({
          title: "Welcome!",
          description: "Please enter your name to create your account.",
        });
        return;
      }
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (showNameField && !name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 max-w-md mx-auto">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-2">
          <Button
            data-testid="button-back-to-welcome"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight">Sign In</h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Gavel className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input
                  data-testid="input-account-id"
                  id="accountId"
                  type="tel"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="8-digit account ID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value.replace(/\D/g, "").slice(0, 8))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  data-testid="input-password"
                  id="password"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
              {showNameField && (
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    data-testid="input-name"
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    First time? Enter your name to create your account.
                  </p>
                </div>
              )}
              <Button
                data-testid="button-sign-in"
                type="submit"
                className="w-full"
                disabled={
                  accountId.length !== 8 ||
                  password.length !== 4 ||
                  (showNameField && !name.trim()) ||
                  loginMutation.isPending
                }
              >
                {loginMutation.isPending ? "Signing in..." : showNameField ? "Create Account & Enter" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}