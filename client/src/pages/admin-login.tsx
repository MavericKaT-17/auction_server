import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/login", { accountId, password });
      return res.json();
    },
    onSuccess: (data: { id: number; name: string; role: string }) => {
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        toast({
          title: "Access Denied",
          description: "This login is for administrators only.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
          <h1 className="text-lg font-bold tracking-tight">Admin Login</h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input
                  data-testid="input-admin-account-id"
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
                  data-testid="input-admin-password"
                  id="password"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
              <Button
                data-testid="button-admin-sign-in"
                type="submit"
                className="w-full"
                disabled={accountId.length !== 8 || password.length !== 4 || loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
