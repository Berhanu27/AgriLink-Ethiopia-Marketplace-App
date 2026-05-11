"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";

interface PaymentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  onSuccess?: () => void;
}

export function PaymentUploadDialog({ open, onOpenChange, orderId, onSuccess }: PaymentUploadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please select a payment screenshot");
      return;
    }

    setLoading(true);
    try {
      // Upload to Cloudinary
      const { uploadToCloudinary } = await import('@/lib/cloudinary');
      const imageUrl = await uploadToCloudinary(imageFile);

      // Update order with payment screenshot
      await api.orders.update(orderId, {
        paymentScreenshotUrl: imageUrl,
      });

      toast.success("Payment proof uploaded successfully!");
      onOpenChange(false);
      setImageFile(null);
      setImagePreview(null);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to upload payment proof:", error);
      toast.error("Failed to upload payment proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Upload a screenshot or photo of your payment confirmation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="payment-image">Payment Screenshot *</Label>
            <Input
              id="payment-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>

          {imagePreview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-2">
                <img
                  src={imagePreview}
                  alt="Payment preview"
                  className="w-full h-auto max-h-64 object-contain rounded"
                />
              </div>
            </div>
          )}

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
            <Button type="submit" className="flex-1" disabled={loading || !imageFile}>
              {loading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
