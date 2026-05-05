"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Sprout,
  Phone,
  MapPin,
  ShoppingCart,
  Truck,
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const translations: Record<"en" | "am" | "or", {
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  marketTitle: string;
  marketSubtitle: string;
  featuredTitle: string;
  featuredSubtitle: string;
  contactSeller: string;
  viewFullBoard: string;
  howItWorksTitle: string;
  howItWorks: { title: string; description: string }[];
  trustTitle: string;
  trustSubtitle: string;
  trustPills: string[];
  continueAsTitle: string;
  continueAsSubtitle: string;
  roles: Record<"farmer" | "buyer" | "transporter" | "cooperative", { title: string; description: string }>;
  footer: {
    about: { heading: string; items: string[] };
    help: { heading: string; items: string[] };
    contact: { heading: string; tel: string; email: string };
    legal: { heading: string; items: string[] };
  };
}> = {
  en: {
    heroTitle: "Connect Farmers to Markets",
    heroSubtitle:
      "See crop prices, find buyers, and grow your income. Join Ethiopia's trusted agricultural marketplace.",
    ctaPrimary: "Get Started",
    ctaSecondary: "Browse Market",
    marketTitle: "Live Market Prices",
    marketSubtitle: "Updated today",
    featuredTitle: "Featured Produce",
    featuredSubtitle: "Fresh listings from verified farmers",
    contactSeller: "Login to Contact Seller",
    viewFullBoard: "View Full Board",
    howItWorksTitle: "How It Works",
    howItWorks: [
      { title: "Farmers List Produce", description: "Post your crops with price and location" },
      { title: "Buyers Find & Contact", description: "Browse and connect with verified farmers" },
      { title: "Transporters Deliver", description: "Reliable delivery to your destination" },
    ],
    trustTitle: "Secure & Transparent Marketplace",
    trustSubtitle:
      "All users are verified to ensure trust and safety. Direct connections between farmers and buyers with transparent pricing.",
    trustPills: ["Verified Users", "Transparent Pricing", "Direct Contact"],
    continueAsTitle: "Continue as:",
    continueAsSubtitle: "Choose your role to get started",
    roles: {
      farmer: { title: "Farmer", description: "Sell your produce directly" },
      buyer: { title: "Buyer", description: "Find quality crops at best prices" },
      transporter: { title: "Transporter", description: "Deliver agricultural products" },
      cooperative: { title: "Cooperative", description: "Manage group sales together" },
    },
    footer: {
      about: { heading: "About", items: ["Our Story", "Mission", "Team"] },
      help: { heading: "Help", items: ["FAQ", "Support", "Guidelines"] },
      contact: { heading: "Contact", tel: "+251 911 234567", email: "info@agrilink.et" },
      legal: { heading: "Legal", items: ["Terms of Service", "Privacy Policy"] },
    },
  },
  am: {
    heroTitle: "ገበሬዎችን ገበያዎችን እንገናኝ",
    heroSubtitle:
      "የእርሻ ዋጋዎችን ይመልከቱ፣ ገዢዎችን ያግኙ፣ ገቢዎን ያድጉ። ታመነ የኢትዮጵያ ገበያ ይቀላቀሉ።",
    ctaPrimary: "ይጀምሩ",
    ctaSecondary: "ገበያን ይመልከቱ",
    marketTitle: "ቀጥታ የገበያ ዋጋዎች",
    marketSubtitle: "ዛሬ ተዘመነ",
    featuredTitle: "የተመረጡ ምርቶች",
    featuredSubtitle: "ከተረጋገጡ ገበሬዎች አዳዲስ ልምዶች",
    contactSeller: "ለሻጩ ለመገናኘት ይግቡ",
    viewFullBoard: "ሙሉውን ያዩ",
    howItWorksTitle: "እንዴት እንሰራ",
    howItWorks: [
      { title: "ገበሬዎች ምርቶቻቸውን ይለጥፉ", description: "ዋጋና አካባቢ ይጨምሩ" },
      { title: "ገዢዎች ይፈልጋሉና ይገናኛሉ", description: "ከገበሬዎች ቀጥታ ይገናኛሉ" },
      { title: "ትራንስፖርተሮች ይዘዋወራሉ", description: "እርሻ ምርቶችን በአስተማማኝ ሁኔታ ያድርሱ" },
    ],
    trustTitle: "ደህንነታማ እና ግልጽ ገበያ",
    trustSubtitle:
      "ሁሉም ተጠቃሚዎች ለእምነት ይፈተናሉ። ገበሬዎችና ገዢዎች በቀጥታ እንዲገናኙ ግልጽ ዋጋ እናሳያለን።",
    trustPills: ["የተረጋገጡ ተጠቃሚዎች", "ግልጽ ዋጋ", "ቀጥታ ግንኙነት"],
    continueAsTitle: "ቀጥሉ እንደ፦",
    continueAsSubtitle: "ሚገባዎትን ሚና ይምረጡ",
    roles: {
      farmer: { title: "ገበሬ", description: "ምርቶችዎን ቀጥታ ይሽጡ" },
      buyer: { title: "ገዢ", description: "ጥራት ያላቸውን ምርቶች ይፈልጉ" },
      transporter: { title: "ትራንስፖርተር", description: "ምርቶችን በተስፋ ያድርሱ" },
      cooperative: { title: "ህብረት", description: "አባላትን በአንድ ቦታ ያቀናብሩ" },
    },
    footer: {
      about: { heading: "ስለ እኛ", items: ["ታሪካችን", "ተልዕኮ", "ቡድን"] },
      help: { heading: "እገዛ", items: ["ተደጋጋሚ ጥያቄዎች", "ድጋፍ", "መመሪያዎች"] },
      contact: { heading: "ያግኙን", tel: "+251 911 234567", email: "info@agrilink.et" },
      legal: { heading: "ህጋዊ", items: ["የአገልግሎት መመሪያ", "የግላዊነት ፖሊሲ"] },
    },
  },
  or: {
    heroTitle: "Qonnaan bultoota fi gabaa walitti fiduu",
    heroSubtitle:
      "Gatiin midhaanii ilaali, bittoota barbaadi, galii kee guddifachiisi. Gabaa amanamaa Itoophiyaa seeni.",
    ctaPrimary: "Jalqabi",
    ctaSecondary: "Gabaa Ilaali",
    marketTitle: "Gatiin Gabaa Ammayya",
    marketSubtitle: "Har'a haaromsame",
    featuredTitle: "Oomisha filatamoo",
    featuredSubtitle: "Galmee haaraa qonnaan bultoota amanamootaa",
    contactSeller: "Gurgurtaa qunnamiuf seeni",
    viewFullBoard: "Guutuu ilaali",
    howItWorksTitle: "Akka itti hojjetu",
    howItWorks: [
      { title: "Qonnaan bultoonni oomisha galmeessu", description: "Gatii fi bakka dabali" },
      { title: "Bittoonni barbaadu fi wal qunnamu", description: "Qonnaan bultoota waliin walqunnamuu" },
      { title: "Geejjibni dhiyeessa", description: "Oomisha sirnaan geessi" },
    ],
    trustTitle: "Gabaa nageenyaan fi iftoomina",
    trustSubtitle:
      "Fayyadamtoonni hundi mirkanaa'aniiru. Qonnaan bultoota fi bittoota wal qunnamtii toora-duraa, gatii ifaa waliin.",
    trustPills: ["Fayyadamtoota mirkanaa'aa", "Gatii ifaa", "Qunnamtii toora-duraa"],
    continueAsTitle: "Itti fufi akka:",
    continueAsSubtitle: "Gahee kee filadhu",
    roles: {
      farmer: { title: "Qonnaan bultoota", description: "Oomisha kee toora-duraa gurguri" },
      buyer: { title: "Bittaa", description: "Oomisha qulqullina qabu barbaadi" },
      transporter: { title: "Geejjibaa", description: "Oomisha iddoo barbaadame geessi" },
      cooperative: { title: "Hirmaattota", description: "Gurmuudhaan gurgurtaa gaggeessi" },
    },
    footer: {
      about: { heading: "Waa'ee keenya", items: ["Seenaa keenya", "Kaayyoo", "Hojjettoota"] },
      help: { heading: "Gargaarsa", items: ["Gaaffilee Giddugala", "Deeggarsa", "Qajeelfama"] },
      contact: { heading: "Nu qunnamaa", tel: "+251 911 234567", email: "info@agrilink.et" },
      legal: { heading: "Seeraa", items: ["Sirna tajaajila", "Ibsaa dhuunfaa"] },
    },
  },
};

export default function Homepage() {
  const { marketPrices, listings, transporters, language, setLanguage, isHydrated } = useApp();
  const displayLanguage = isHydrated ? language : 'en';
  const t = translations[displayLanguage] ?? translations.en;
  const adminListings = listings.filter((listing) => listing.farmerId === "admin");
  const farmerListings = listings.filter((listing) => listing.farmerId !== "admin");

  const languages = [
    { code: "en" as const, label: "EN" },
    { code: "am" as const, label: "አማ" },
    { code: "or" as const, label: "OR" },
  ];

  const howItWorks = [
    { icon: Sprout, ...t.howItWorks[0] },
    { icon: ShoppingCart, ...t.howItWorks[1] },
    { icon: Truck, ...t.howItWorks[2] },
  ];

  const roles = [
    { role: "farmer" as const, icon: Sprout },
    { role: "buyer" as const, icon: ShoppingCart },
    { role: "transporter" as const, icon: Truck },
    { role: "cooperative" as const, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-[100] bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-screen-xl">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg leading-none">AgriLink</h1>
              <p className="text-xs text-muted-foreground">Ethiopia</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    displayLanguage === lang.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative flex-1 min-h-[calc(100vh-64px)] flex overflow-hidden mt-4">
        {/* Full background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/hero.png"
            alt="AgriLink"
            className="w-full h-full object-contain object-center hero-image-zoom"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Text & CTA — centered over the image */}
        <div className="relative z-10 flex flex-col justify-center w-full max-w-2xl mx-auto px-8 pt-16 pb-16 text-white text-center">
          <Badge className="mb-5 text-sm px-3 py-1 w-fit mx-auto bg-white/20 text-white border-white/30" variant="outline">
            🌱 Ethiopia&apos;s #1 AgriMarketplace
          </Badge>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight tracking-tight" style={{textShadow: '2px 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.8)'}} suppressHydrationWarning>
            {t.heroTitle}
          </h2>
          <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{textShadow: '1px 1px 8px rgba(0,0,0,0.9)'}} suppressHydrationWarning>
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto min-h-[52px] text-base px-8 shadow-lg">
                {t.ctaPrimary} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#market-prices">
              <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[52px] text-base px-8 bg-white/10 border-white/40 text-white hover:bg-white/20">
                {t.ctaSecondary}
              </Button>
            </Link>
          </div>
          {/* Trust indicators */}
          <div className="flex flex-wrap gap-4 text-sm text-white justify-center" style={{textShadow: '1px 1px 6px rgba(0,0,0,0.8)'}}>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> Verified Users</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> Transparent Pricing</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> Direct Contact</span>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="space-y-6">
            {/* Admin Products Table */}
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold">Admin Products</h4>
                  <p className="text-xs text-muted-foreground">Official price announcements and spotlight listings</p>
                </div>
                <Badge variant="secondary">{adminListings.length} items</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Image</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Crop</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {adminListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-10 w-14 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            {(listing as any).imageUrl ? (
                              <img src={(listing as any).imageUrl} alt={listing.cropName} className="h-full w-full object-cover" />
                            ) : (
                              <Sprout className="h-5 w-5 text-primary/40" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{listing.cropName}</td>
                        <td className="px-4 py-3 font-bold text-primary">{listing.pricePerUnit} ETB/{listing.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{listing.quantity} {listing.unit}</td>
                        <td className="px-4 py-3">
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                            {listing.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Farmer Products Table */}
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{t.featuredTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t.featuredSubtitle}</p>
                </div>
                <Badge variant="secondary">{farmerListings.length} items</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Image</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Crop</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Farmer</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {farmerListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-10 w-14 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            {(listing as any).imageUrl ? (
                              <img src={(listing as any).imageUrl} alt={listing.cropName} className="h-full w-full object-cover" />
                            ) : (
                              <Sprout className="h-5 w-5 text-primary/40" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{listing.cropName}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{listing.farmerName}</p>
                            <p className="text-xs text-muted-foreground">{listing.farmerPhone || '—'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{listing.farmerRegion || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{listing.quantity} {listing.unit}</td>
                        <td className="px-4 py-3 font-bold text-primary">{listing.pricePerUnit} ETB/{listing.unit}</td>
                        <td className="px-4 py-3">
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                            {listing.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <h3 className="text-2xl font-bold text-center mb-8">{t.howItWorksTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Available Transporters</h3>
              <p className="text-sm text-muted-foreground">Verified transporters ready to move your goods</p>
            </div>
            <Badge variant="secondary">{transporters.length} available</Badge>
          </div>
          {transporters.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vehicle</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vehicle Type</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacity</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transporters.map((transporter) => (
                      <tr key={transporter.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-10 w-14 rounded-md overflow-hidden bg-muted/40 border flex items-center justify-center">
                            {transporter.vehicleImageUrl ? (
                              <img src={transporter.vehicleImageUrl} alt={transporter.fullName} className="h-full w-full object-cover" />
                            ) : (
                              <Truck className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{transporter.fullName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.region || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.vehicleType || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.vehicleCapacity || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No verified transporters available yet.</p>
            </Card>
          )}
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <Shield className="h-16 w-16 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{t.trustTitle}</h3>
                <p className="text-muted-foreground mb-4">{t.trustSubtitle}</p>
                <div className="flex flex-wrap gap-4">
                  {t.trustPills.map((pill) => (
                    <div key={pill} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">{pill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <h3 className="text-2xl font-bold text-center mb-2">{t.continueAsTitle}</h3>
          <p className="text-center text-muted-foreground mb-8">{t.continueAsSubtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((roleData) => {
              const Icon = roleData.icon;
              const roleCopy = t.roles[roleData.role];
              return (
                <Link key={roleData.role} href={`/register?role=${roleData.role}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <Icon className="h-12 w-12 text-primary mb-4" />
                    <h4 className="font-semibold mb-2">{roleCopy.title}</h4>
                    <p className="text-sm text-muted-foreground">{roleCopy.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h5 className="font-semibold mb-3">{t.footer.about.heading}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.footer.about.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">{t.footer.help.heading}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.footer.help.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">{t.footer.contact.heading}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="tel:+251911234567" className="hover:text-foreground">
                    {t.footer.contact.tel}
                  </a>
                </li>
                <li>
                  <a href="mailto:info@agrilink.et" className="hover:text-foreground">
                    {t.footer.contact.email}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">{t.footer.legal.heading}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.footer.legal.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2026 AgriLink Ethiopia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
