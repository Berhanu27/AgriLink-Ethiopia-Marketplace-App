"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getListingUploadPreset, uploadToCloudinary } from "@/lib/cloudinary";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, DollarSign, MapPin, Sparkles, Tractor, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

const ETB_PER_USD = 185;

export default function AddListingPage() {
  const router = useRouter();
  const { currentUser, addListing, updateListing, listings } = useApp();
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [customCrop, setCustomCrop] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    location: '',
    description: '',
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (!editParam) return;
    setEditingId(editParam);

    const targetListing = listings.find((listing) => listing.id === editParam);
    if (!targetListing) return;

    const isKnownCrop = crops.includes(targetListing.cropName);
    if (!isKnownCrop) {
      setCustomCrop(targetListing.cropName);
    }

    setFormData({
      cropName: isKnownCrop ? targetListing.cropName : 'Other',
      quantity: targetListing.quantity,
      unit: targetListing.unit,
      pricePerUnit: String(targetListing.pricePerUnit),
      location: targetListing.location,
      description: targetListing.description || '',
    });

    if (targetListing.imageUrl) {
      setPhotoPreview(targetListing.imageUrl);
    }
  }, [searchParams, listings]);

  const crops = [
    'Teff',
    'Maize',
    'Wheat',
    'Barley',
    'Sorghum',
    'Coffee',
    'Sesame',
    'Chickpea',
    'Faba Bean',
    'Haricot Bean',
    'Other',
  ];

  const units = ['kg', 'quintal', 'ton', 'sack'];

  const quantityValue = parseFloat(formData.quantity);
  const priceValue = parseFloat(formData.pricePerUnit);
  const hasValidTotals = !isNaN(quantityValue) && !isNaN(priceValue);
  const totalEstimate = hasValidTotals ? quantityValue * priceValue : 0;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("Please login to add a listing");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const quantity = parseFloat(formData.quantity);
      const pricePerUnit = parseFloat(formData.pricePerUnit);

      if (isNaN(quantity) || isNaN(pricePerUnit)) {
        toast.error('Please enter valid numbers for quantity and price');
        setLoading(false);
        return;
      }

      let imageUrl: string | undefined = photoPreview || undefined;
      if (photoFile) {
        imageUrl = await uploadToCloudinary(photoFile, getListingUploadPreset());
      }

      if (editingId) {
        const updated = await updateListing(editingId, {
          cropName: formData.cropName === 'Other' ? customCrop : formData.cropName,
          quantity: formData.quantity,
          unit: formData.unit,
          pricePerUnit,
          location: formData.location,
          description: formData.description,
          imageUrl,
        });

        if (!updated) {
          toast.error('Failed to update listing. Please try again.');
          return;
        }

        toast.success('Listing updated successfully!');
      } else {
        const created = await addListing({
          farmerId: currentUser.id,
          farmerName: currentUser.name,
          farmerRegion: currentUser.region,
          farmerVerified: currentUser.verified,
          cropName: formData.cropName === 'Other' ? customCrop : formData.cropName,
          quantity: formData.quantity,
          unit: formData.unit,
          pricePerUnit,
          totalPrice: quantity * pricePerUnit,
          location: formData.location,
          status: 'active',
          description: formData.description,
          imageUrl,
          views: 0,
          inquiries: 0,
        });

        if (!created) {
          toast.error('Failed to create listing. Please try again.');
          return;
        }

        toast.success('Listing created successfully!');
      }
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create listing';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* If not verified, show message and hide form - only after hydration */}
        {isHydrated && !currentUser?.verified ? (
          <Card className="p-8 text-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 border-2 border-amber-200 dark:border-amber-700">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded-full mb-4">
                <Clock className="h-12 w-12 text-amber-600 dark:text-amber-300" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                Verification Required
              </h2>
              <p className="text-amber-800 dark:text-amber-200 max-w-md mb-6">
                Your account is pending admin verification. Once approved, you&apos;ll be able to create and publish product listings to reach buyers.
              </p>
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-amber-300 dark:border-amber-700">
                Back to Dashboard
              </Button>
            </div>
          </Card>
        ) : isHydrated ? (
          <>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-r from-primary/15 via-card to-accent/10 p-6 md:p-8">
              <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">Seller Workspace</p>
                  <h2 className="text-3xl font-bold mt-1">
                    {editingId ? 'Edit Listing' : 'Create a New Listing'}
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-xl">
                    Publish your produce with clear pricing and location details so buyers can quickly find and trust your offer.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Card className="p-3 bg-card/80">
                    <Tractor className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Farmer</p>
                  </Card>
                  <Card className="p-3 bg-card/80">
                    <ShieldCheck className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Trusted</p>
                  </Card>
                  <Card className="p-3 bg-card/80">
                    <Sparkles className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Visible</p>
                  </Card>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <Card className="p-6 lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-5">
                {/* Crop Name */}
                <div>
                  <Label htmlFor="cropName">Crop / Product Name *</Label>
                  <Select value={formData.cropName} onValueChange={(value) => handleChange('cropName', value)} required>
                    <SelectTrigger className="min-h-12 mt-1 bg-input-background/70">
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Custom crop input - show only if "Other" is selected */}
                  {formData.cropName === 'Other' && (
                    <div className="mt-3">
                      <Label htmlFor="customCrop">Please specify the crop name *</Label>
                      <Input
                        id="customCrop"
                        type="text"
                        placeholder="e.g., Millet, Lentil, Pea..."
                        value={customCrop}
                        onChange={(e) => setCustomCrop(e.target.value)}
                        className="min-h-12 mt-1 bg-input-background/70"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <div className="relative mt-1">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        placeholder="100"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        className="pl-10 min-h-12 bg-input-background/70"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                      <SelectTrigger className="min-h-12 mt-1 bg-input-background/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Per Unit */}
                <div>
                  <Label htmlFor="pricePerUnit">Price per {formData.unit} (ETB) *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pricePerUnit"
                      type="number"
                      step="0.01"
                      placeholder="85.00"
                      value={formData.pricePerUnit}
                      onChange={(e) => handleChange('pricePerUnit', e.target.value)}
                      className="pl-10 min-h-12 bg-input-background/70"
                      required
                    />
                  </div>
                  {hasValidTotals && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Estimated total value: {totalEstimate.toFixed(2)} ETB
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Addis Ababa, Bole"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="pl-10 min-h-12 bg-input-background/70"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about quality, harvest date, organic certification, etc."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="min-h-28 mt-1 bg-input-background/70"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <Label htmlFor="photo">Product Photo (Optional)</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="min-h-12 mt-1 bg-input-background/70"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setPhotoFile(file);
                      if (!file) {
                        setPhotoPreview(null);
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setPhotoPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Listing preview"
                      className="mt-2 h-32 w-full rounded-md border object-cover"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Supported formats: JPG, PNG, WebP (Max 5MB)</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-h-12"
                    onClick={() => router.push('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 min-h-12"
                    disabled={loading}
                  >
                    {loading ? (editingId ? 'Updating...' : 'Publishing...') : (editingId ? 'Update Listing' : 'Publish Listing')}
                  </Button>
                </div>
                </form>
              </Card>

              <Card className="p-5 bg-linear-to-b from-card to-muted/40">
                <h3 className="text-lg font-semibold mb-3">Listing Preview</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Product</p>
                    <p className="font-medium">{formData.cropName === 'Other' ? customCrop || 'Not specified yet' : formData.cropName || 'Not selected yet'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">
                      {formData.quantity || '0'} {formData.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unit Price</p>
                    <p className="font-medium">{formData.pricePerUnit || '0'} ETB/{formData.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium break-words">{formData.location || 'Not set yet'}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Value</p>
                  <p className="text-2xl font-bold text-primary mt-1">{hasValidTotals ? totalEstimate.toFixed(2) : '0.00'} ETB</p>
                  <p className="text-sm text-muted-foreground mt-2">≈ ${(hasValidTotals ? totalEstimate / ETB_PER_USD : 0).toFixed(2)} USD</p>
                  <p className="text-xs text-muted-foreground mt-2">(1 USD = {ETB_PER_USD} ETB)</p>
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
