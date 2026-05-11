"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface PurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: string;
    cropName: string;
    farmerId: string;
    farmerName: string;
    pricePerUnit: number;
    unit: string;
    quantity: string;
  };
  onSuccess?: () => void;
}

export function PurchaseRequestDialog({ open, onOpenChange, listing, onSuccess }: PurchaseRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedQuantity: "",
    offeredPrice: listing.pricePerUnit.toString(),
    buyerMessage: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requestedQuantity) {
      toast.error("Please enter the quantity you want to purchase");
      return;
    }

    setLoading(true);
    try {
      // Extract numeric ID from listing ID (format: "listing-123")
      const listingId = listing.id.startsWith('listing-') 
        ? parseInt(listing.id.split('-')[1]) 
        : undefined;

      await api.orders.create({
        sellerId: parseInt(listing.farmerId),
        listingId: listingId,
        cropName: listing.cropName,
        requestedQuantity: formData.requestedQuantity,
        unit: listing.unit,
        offeredPrice: parseFloat(formData.offeredPrice) || undefined,
        buyerMessage: formData.buyerMessage || undefined,
      });

      toast.success("Purchase request sent successfully!");
      onOpenChange(false);
      setFormData({ requestedQuantity: "", offeredPrice: listing.pricePerUnit.toString(), buyerMessage: "" });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to send purchase request:", error);
      toast.error("Failed to send purchase request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request to Purchase</DialogTitle>
          <DialogDescription>
            Send a purchase request to {listing.farmerName} for {listing.cropName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-semibold">{listing.cropName}</p>
              <p className="text-sm text-muted-foreground">
                Available: {listing.quantity} {listing.unit} • {listing.pricePerUnit} ETB/{listing.unit}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Needed *</Label>
            <div className="flex gap-2">
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={formData.requestedQuantity}
                onChange={(e) => setFormData({ ...formData, requestedQuantity: e.target.value })}
                required
              />
              <div className="flex items-center px-3 bg-muted rounded-md">
                <span className="text-sm font-medium">{listing.unit}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Your Offer Price (ETB per {listing.unit})</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Enter your offer"
              value={formData.offeredPrice}
              onChange={(e) => setFormData({ ...formData, offeredPrice: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Listed price: {listing.pricePerUnit} ETB/{listing.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to Farmer (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add any special requests or questions..."
              value={formData.buyerMessage}
              onChange={(e) => setFormData({ ...formData, buyerMessage: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
