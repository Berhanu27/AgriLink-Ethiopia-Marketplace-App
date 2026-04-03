"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  Plus,
  Bell,
  User,
  Sprout,
  LogOut,
  CheckCircle2,
  WifiOff,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, notifications, isOnline } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/add", icon: Plus, label: "Add" },
    { path: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-screen-xl">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg leading-none">AgriLink</h1>
              <p className="text-xs text-muted-foreground">Ethiopia</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-1 text-destructive text-xs">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Desktop Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-semibold">{currentUser?.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{currentUser?.role}</p>
                  {currentUser?.verified && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/notifications")}>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-1/4 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
