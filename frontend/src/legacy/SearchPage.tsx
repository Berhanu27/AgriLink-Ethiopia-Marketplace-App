"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";

export default function SearchPage() {
  const { listings, marketPrices } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = listings.filter(
    (l) =>
      l.status === 'active' &&
      (searchQuery === '' ||
        l.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.farmerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPrices = marketPrices.filter(
    (p) =>
      searchQuery === '' || p.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-1">Search</h2>
          <p className="text-muted-foreground">Find crops and market prices</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search crops, location, farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[48px]"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="listings">
              Listings ({filteredListings.length})
            </TabsTrigger>
            <TabsTrigger value="prices">
              Market Prices ({filteredPrices.length})
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-3 mt-4">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <Card key={listing.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center overflow-hidden">
                      {listing.imageUrl ? (
                        <img 
                          src={listing.imageUrl} 
                          alt={listing.cropName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold">{listing.cropName}</h4>
                        {listing.farmerVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {listing.farmerName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {listing.quantity} {listing.unit} available
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {listing.pricePerUnit} ETB/{listing.unit}
                          </p>
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold mb-2">No Results Found</h4>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Market Prices Tab */}
          <TabsContent value="prices" className="space-y-3 mt-4">
            {filteredPrices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPrices.map((price) => (
                  <Card key={price.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold mb-1">{price.cropName}</h4>
                        <p className="text-xs text-muted-foreground">{price.market}</p>
                      </div>
                      {price.change !== undefined && (
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            price.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {price.change > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(price.change)}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {price.averagePrice}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ETB/{price.unit}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated {new Date(price.updatedAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold mb-2">No Prices Found</h4>
                <p className="text-sm text-muted-foreground">
                  Try searching for different crops
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
