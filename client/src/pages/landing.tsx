import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel, Clock, ArrowLeft, ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { useState, useEffect } from "react";
import type { AuctionItem, EventSettings } from "@shared/schema";

const ITEMS_PER_PAGE = 10;

function CountdownBar({ endTime }: { endTime: string }) {
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

  if (isExpired) {
    return (
      <span className="text-destructive font-semibold text-xs">Auction Ended</span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Clock className="w-3.5 h-3.5 text-primary" />
      <span className="font-mono font-semibold tabular-nums">{timeLeft}</span>
    </div>
  );
}

function ItemCard({ item, onClick }: { item: AuctionItem; onClick: () => void }) {
  return (
    <Card className="overflow-visible hover-elevate active-elevate-2 cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex gap-3">
          <div className="w-28 h-28 flex-shrink-0 rounded-l-md overflow-hidden bg-muted">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 py-3 pr-3 flex flex-col justify-center gap-1">
            <h3
              className="font-semibold text-sm leading-tight line-clamp-2"
              data-testid={`text-item-name-${item.id}`}
            >
              {item.name}
            </h3>
            {item.startingPrice > 0 && (
              <p className="text-xs text-muted-foreground">
                Starting at <span className="font-semibold text-foreground">${item.startingPrice.toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex gap-3">
          <Skeleton className="w-28 h-28 rounded-l-md" />
          <div className="flex-1 py-3 pr-3 flex flex-col justify-center gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MainPage() {
  const [, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: items, isLoading: itemsLoading } = useQuery<AuctionItem[]>({
    queryKey: ["/api/items"],
  });

  const { data: eventSettings } = useQuery<EventSettings>({
    queryKey: ["/api/event-settings"],
  });

  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              data-testid="button-back-to-landing"
              onClick={() => navigate("/")}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Gavel className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-sm tracking-tight">Elite Auction</h1>
          </div>
          <div className="flex items-center gap-2">
            {eventSettings?.endTime && (
              <CountdownBar endTime={eventSettings.endTime.toString()} />
            )}
            <Button
              data-testid="button-my-bids"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/my-bids")}
            >
              <Receipt className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
              About This Event
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Welcome to our exclusive charity gala auction. Each item has been thoughtfully curated 
              from the world's finest collections. Your generous bids support vital philanthropic 
              initiatives around the globe. All bids are sealed and confidential -- one bid per item, 
              no changes permitted.
            </p>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Auction Items
            </h2>
            {totalItems > 0 && (
              <span className="text-xs text-muted-foreground" data-testid="text-item-count">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {itemsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <ItemSkeleton key={i} />)
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => navigate(`/item/${item.id}`)}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gavel className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No auction items available yet.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-4" data-testid="pagination-controls">
              <Button
                data-testid="button-prev-page"
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  data-testid={`button-page-${page}`}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                data-testid="button-next-page"
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
