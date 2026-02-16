import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";

export default function WelcomePage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Gavel className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Elite Auction</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              An exclusive sealed-bid auction for distinguished guests. Browse curated luxury items and place your confidential bid.
            </p>
          </div>
        </div>

        <div className="w-full">
          <Button
            data-testid="button-enter-auction"
            className="w-full"
            size="lg"
            onClick={() => navigate("/login")}
          >
            <Gavel className="w-4 h-4 mr-2" />
            Enter Auction
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
          Invitation Only
        </p>
      </div>
    </div>
  );
}
