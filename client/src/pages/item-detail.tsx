import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Gavel, Clock, Check, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AuctionItem, Bid, EventSettings } from "@shared/schema";

function CountdownSmall({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date(endTime).getTime();
      const diff = end - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(timer);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) return <Badge variant="destructive">Ended</Badge>;
  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="w-3 h-3" />
      {timeLeft}
    </Badge>
  );
}

export default function ItemDetailPage() {
  const [, navigate] = useLocation();
  const [matched, params] = useRoute("/item/:id");
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const itemId = params?.id ? parseInt(params.id) : 0;

  const { data: item, isLoading } = useQuery<AuctionItem>({
    queryKey: ["/api/items", itemId],
    enabled: !!itemId,
  });

  const { data: existingBid } = useQuery<Bid | null>({
    queryKey: ["/api/bids/my", itemId],
    enabled: !!itemId,
  });

  const { data: eventSettings } = useQuery<EventSettings>({
    queryKey: ["/api/event-settings"],
  });

  const isExpired = eventSettings?.endTime
    ? new Date(eventSettings.endTime).getTime() < Date.now()
    : false;

  const hasBid = !!existingBid;

  const bidMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/bids", { itemId, amount });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Bid Placed", description: "Your bid has been recorded successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/bids/my", itemId] });
      setBidAmount("");
      setTimeout(() => {
        navigate("/main");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({ title: "Bid Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleBid = () => {
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid bid amount.", variant: "destructive" });
      return;
    }
    if (item && item.startingPrice > 0 && amount < item.startingPrice) {
      toast({
        title: "Bid Too Low",
        description: `Your bid must be at least $${item.startingPrice.toLocaleString()} (the starting price).`,
        variant: "destructive",
      });
      return;
    }
    setShowConfirm(true);
  };

  const confirmBid = () => {
    const amount = parseInt(bidAmount);
    setShowConfirm(false);
    bidMutation.mutate(amount);
  };

  if (!matched) return null;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <Button
            data-testid="button-back"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-sm truncate flex-1 text-center">Item Details</h1>
          {eventSettings?.endTime && (
            <CountdownSmall endTime={eventSettings.endTime.toString()} />
          )}
        </div>
      </header>

      <div className="pb-32">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="w-full aspect-square rounded-md" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : item ? (
          <>
            <div className="w-full aspect-[4/3] bg-muted overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-4 py-4 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h2 className="text-xl font-bold leading-tight" data-testid="text-item-title">{item.name}</h2>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                {item.startingPrice > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Starting from <span className="font-semibold text-foreground">${item.startingPrice.toLocaleString()}</span>
                  </p>
                )}
              </div>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
                  <p className="text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Background</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.background}</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Item not found.</p>
          </div>
        )}
      </div>

      {item && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 space-y-3">
          {hasBid ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <Check className="w-5 h-5 text-primary" />
              <div className="text-center">
                <p className="text-sm font-semibold">Bid Submitted</p>
                <p className="text-xs text-muted-foreground">
                  Your bid of <span className="font-semibold text-foreground">${existingBid!.amount.toLocaleString()}</span> has been recorded
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirmation ID: <span className="font-mono font-semibold text-primary" data-testid="text-confirmation-id">{existingBid!.confirmationId}</span>
                </p>
              </div>
            </div>
          ) : isExpired ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">Auction has ended</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  data-testid="input-bid-amount"
                  type="number"
                  inputMode="numeric"
                  placeholder={item.startingPrice > 0 ? `Min $${item.startingPrice.toLocaleString()}` : "Enter your bid"}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
              <Button
                data-testid="button-place-bid"
                onClick={handleBid}
                disabled={bidMutation.isPending || !bidAmount}
              >
                <Gavel className="w-4 h-4 mr-1.5" />
                {bidMutation.isPending ? "Placing..." : "Place Bid"}
              </Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Bid</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You are about to place a sealed bid on:</p>
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="font-semibold text-foreground text-sm">{item?.name}</p>
                  <p className="text-lg font-bold text-primary">
                    ${parseInt(bidAmount || "0").toLocaleString()}
                  </p>
                </div>
                <p className="text-xs">
                  This bid is final and cannot be changed or withdrawn once confirmed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-bid">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="button-confirm-bid" onClick={confirmBid}>
              Confirm Bid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
