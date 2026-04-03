"use client";

import { useApp } from "@/context/AppContext";
import FarmerDashboard from "@/legacy/FarmerDashboard";
import BuyerDashboard from "@/legacy/BuyerDashboard";
import TransporterDashboard from "@/legacy/TransporterDashboard";
import CooperativeDashboard from "@/legacy/CooperativeDashboard";
import AdminDashboard from "@/legacy/AdminDashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";

const translations = {
  en: {
    title: "Login required",
    subtitle: "Sign in to access your dashboard.",
    button: "Go to Login",
  },
  am: {
    title: "መግባት ያስፈልጋል",
    subtitle: "ዳሽቦርድዎን ለመመልከት ይግቡ።",
    button: "ወደ መግቢያ ይሂዱ",
  },
  or: {
    title: "Seenuu barbaachisa",
    subtitle: "Daashboordii kee argachuuf seeni.",
    button: "Gara seensaatti",
  },
} as const;

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, language, isHydrated } = useApp();
  const t = translations[language] ?? translations.en;

  if (!isHydrated) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 max-w-screen-sm space-y-4">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-xl font-semibold">Loading dashboard...</h2>
            <p className="text-sm text-muted-foreground">Preparing your account view.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 max-w-screen-sm space-y-4">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            <Button onClick={() => router.push("/login")}>{t.button}</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  switch (currentUser.role) {
    case "farmer":
      return <FarmerDashboard />;
    case "buyer":
      return <BuyerDashboard />;
    case "transporter":
      return <TransporterDashboard />;
    case "cooperative":
      return <CooperativeDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <FarmerDashboard />;
  }
}
