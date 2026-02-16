import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, Trophy, ChevronRight, Gavel, Users } from "lucide-react";
import { useState } from "react";
import type { AuctionItem } from "@shared/schema";

interface BidRecord {
  id: number;
  confirmationId: string;
  userId: number;
  itemId: number;
  amount: number;
  bidTime: string;
  userName: string;
  accountId: string;
  rank: number;
}

interface ItemWithStats {
  item: AuctionItem;
  bidCount: number;
  highestBid: number;
}

function AdminItemList({ onSelectItem }: { onSelectItem: (id: number) => void }) {
  const { data: itemsWithStats, isLoading } = useQuery<ItemWithStats[]>({
    queryKey: ["/api/admin/items"],
  });

  const handleDownloadAll = async () => {
    window.open("/api/admin/export-csv", "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">All Items</h2>
        <Button
          data-testid="button-download-csv"
          variant="outline"
          size="sm"
          onClick={handleDownloadAll}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : itemsWithStats && itemsWithStats.length > 0 ? (
          itemsWithStats.map(({ item, bidCount, highestBid }) => (
            <Card
              key={item.id}
              className="overflow-visible hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => onSelectItem(item.id)}
            >
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-1">{item.name}</h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{bidCount} bids</span>
                      </div>
                      {highestBid > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Trophy className="w-3 h-3 text-primary" />
                          <span className="font-semibold">${highestBid.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No items found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function AdminItemBids({ itemId, onBack }: { itemId: number; onBack: () => void }) {
  const { data: bids, isLoading } = useQuery<BidRecord[]>({
    queryKey: ["/api/admin/items", itemId, "bids"],
  });

  const { data: item } = useQuery<AuctionItem>({
    queryKey: ["/api/items", itemId],
  });

  const handleDownloadItemCsv = () => {
    window.open(`/api/admin/items/${itemId}/export-csv`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button data-testid="button-admin-item-back" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          data-testid="button-download-item-csv"
          variant="outline"
          size="sm"
          onClick={handleDownloadItemCsv}
        >
          <Download className="w-4 h-4 mr-1.5" />
          CSV
        </Button>
      </div>

      {item && (
        <Card>
          <CardContent className="p-3">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h3 className="font-bold text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
          Bid Rankings
        </h3>

        {isLoading ? (
          <Card>
            <CardContent className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : bids && bids.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Bidder</TableHead>
                      <TableHead>Confirmation</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Bid Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bids.map((bid) => (
                      <TableRow key={bid.id} data-testid={`row-bid-${bid.id}`}>
                        <TableCell className="text-center">
                          {bid.rank === 1 ? (
                            <Badge className="px-1.5">
                              <Trophy className="w-3 h-3" />
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">{bid.rank}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{bid.userName}</p>
                            <p className="text-[10px] text-muted-foreground">{bid.accountId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground" data-testid={`text-confirmation-${bid.id}`}>{bid.confirmationId}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          ${bid.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap" data-testid={`text-bidtime-${bid.id}`}>
                          {new Date(bid.bidTime).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Gavel className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No bids yet for this item.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
          <Button
            data-testid="button-admin-back"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-base tracking-tight">Admin Dashboard</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {selectedItemId ? (
          <AdminItemBids itemId={selectedItemId} onBack={() => setSelectedItemId(null)} />
        ) : (
          <AdminItemList onSelectItem={setSelectedItemId} />
        )}
      </div>
    </div>
  );
}
