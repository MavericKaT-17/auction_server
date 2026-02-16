import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Gavel, Receipt } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import type { Bid } from "@shared/schema";

interface UserBid extends Bid {
  itemName: string;
}

export default function MyBidsPage() {
  const [, navigate] = useLocation();

  const { data: myBids, isLoading } = useQuery<UserBid[]>({
    queryKey: ["/api/bids/my"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex items-center gap-2">
          <Button
            data-testid="button-back-to-main"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-sm tracking-tight">My Bids</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : myBids && myBids.length > 0 ? (
          myBids.map((bid) => (
            <Card key={bid.id} data-testid={`card-bid-${bid.id}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm" data-testid={`text-bid-item-${bid.id}`}>{bid.itemName}</h3>
                  <span className="font-semibold text-sm text-primary" data-testid={`text-bid-amount-${bid.id}`}>
                    ${bid.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs text-muted-foreground" data-testid={`text-bid-time-${bid.id}`}>
                    {new Date(bid.bidTime).toLocaleString()}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground" data-testid={`text-bid-confirmation-${bid.id}`}>
                    {bid.confirmationId}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">You haven't placed any bids yet.</p>
              <Button
                data-testid="button-browse-items"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => navigate("/main")}
              >
                <Gavel className="w-4 h-4 mr-1.5" />
                Browse Items
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
