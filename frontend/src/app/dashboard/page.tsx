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
    pendingTitle: "Approval pending",
    pendingSubtitle: "Your transporter account is awaiting admin approval.",
    pendingNote: "You will be able to access the dashboard once approved.",
    pendingHome: "Back to Home",
    pendingLogout: "Logout",
  },
  am: {
    title: "መግባት ያስፈልጋል",
    subtitle: "ዳሽቦርድዎን ለመመልከት ይግቡ።",
    button: "ወደ መግቢያ ይሂዱ",
    pendingTitle: "ማረጋገጫ በመጠባበቅ ላይ",
    pendingSubtitle: "የትራንስፖርተር መለያዎ የአስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ ነው።",
    pendingNote: "ከተፈቀደ በኋላ ዳሽቦርድ ይገኛል።",
    pendingHome: "ወደ ቤት ተመለስ",
    pendingLogout: "ውጣ",
  },
  or: {
    title: "Seenuu barbaachisa",
    subtitle: "Daashboordii kee argachuuf seeni.",
    button: "Gara seensaatti",
    pendingTitle: "Mirkaneessi eegamaa",
    pendingSubtitle: "Akkaawuntiin geejjibaa kee mirkaneessaa admin eeggachaa jira.",
    pendingNote: "Mirkaneeffamee booda daashboordii ni argatta.",
    pendingHome: "Gara manaatti deebi'i",
    pendingLogout: "Ba'i",
  },
} as const;

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, language, isHydrated, logout } = useApp();
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

  if (currentUser.role === "transporter" && !currentUser.verified) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 max-w-screen-sm space-y-4">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-xl font-semibold">{t.pendingTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.pendingSubtitle}</p>
            <p className="text-xs text-muted-foreground">{t.pendingNote}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" onClick={() => router.push("/")}>{t.pendingHome}</Button>
              <Button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                {t.pendingLogout}
              </Button>
            </div>
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
