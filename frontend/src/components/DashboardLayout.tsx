"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotificationPanel from "@/components/NotificationPanel";
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
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  Truck,
  MapPin,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isOnline, language, setLanguage, isHydrated } = useApp();
  const { totalCount } = useNotifications();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const unreadCount = totalCount;
  
  // Debug logging
  useEffect(() => {
    console.log('DashboardLayout - Current user role:', currentUser?.role);
    console.log('DashboardLayout - Total notification count:', totalCount);
    console.log('DashboardLayout - Unread count:', unreadCount);
  }, [currentUser?.role, totalCount, unreadCount]);

  const languages = [
    { code: "en" as const, label: "EN" },
    { code: "am" as const, label: "አማ" },
    { code: "or" as const, label: "OR" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const activeLanguage = isHydrated ? language : "en";

  // Role-specific navigation items
  const getNavItemsByRole = () => {
    // Ensure we only run this on the client side after hydration
    if (!currentUser?.role) {
      return [
        { path: "/dashboard", icon: Home, label: "Dashboard", scrollTo: null },
      ];
    }

    const role = currentUser.role;

    if (role === 'admin') {
      return [
        { path: "/dashboard", icon: Home, label: "Dashboard", scrollTo: null },
        { path: "/dashboard", icon: Users, label: "User Verification", scrollTo: "user-verification", badge: unreadCount },
        { path: "/dashboard", icon: Package, label: "All Listings", scrollTo: "all-listings" },
        { path: "/dashboard", icon: Bell, label: "Broadcast Feed", scrollTo: "broadcast-feed" },
        { path: "/dashboard", icon: TrendingUp, label: "Platform Analytics", scrollTo: "platform-analytics" },
      ];
    } else if (role === 'farmer') {
      return [
        { path: "/dashboard", icon: Home, label: "Dashboard", scrollTo: null },
        { path: "/dashboard", icon: Package, label: "My Listings", scrollTo: "my-listings" },
        { path: "/dashboard", icon: ShoppingCart, label: "Purchase Orders", scrollTo: "purchase-orders" },
        { path: "/dashboard", icon: TrendingUp, label: "Market Prices", scrollTo: "market-prices" },
      ];
    } else if (role === 'cooperative') {
      return [
        { path: "/dashboard", icon: Home, label: "Dashboard", scrollTo: null },
        { path: "/dashboard", icon: Package, label: "Bulk Listings", scrollTo: "my-listings" },
        { path: "/dashboard", icon: ShoppingCart, label: "Purchase Orders", scrollTo: "purchase-orders" },
        { path: "/dashboard", icon: Users, label: "Members", scrollTo: "top-contributors" },
      ];
    } else if (role === 'buyer') {
      return [
        { path: "/dashboard", icon: Home, label: "Dashboard", scrollTo: null },
        { path: "/search", icon: Search, label: "Search Products", scrollTo: null },
        { path: "/dashboard", icon: ShoppingCart, label: "My Orders", scrollTo: "my-orders" },
        { path: "/dashboard", icon: Truck, label: "Find Transport", scrollTo: "find-transport" },
      ];
    } else if (role === 'transporter') {
      return [
        { path: "/dashboard", icon: Home, label: "Dashboard", scrollTo: null },
        { path: "/dashboard", icon: Truck, label: "Delivery Requests", scrollTo: "delivery-requests" },
        { path: "/dashboard", icon: MapPin, label: "My Routes", scrollTo: "my-routes" },
        { path: "/dashboard", icon: DollarSign, label: "Earnings", scrollTo: "earnings" },
      ];
    }

    // Default navigation
    return [
      { path: "/dashboard", icon: Home, label: "Dashboard", scrollTo: null },
      { path: "/search", icon: Search, label: "Search", scrollTo: null },
    ];
  };

  const sidebarNavItems = getNavItemsByRole();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/add", icon: Plus, label: "Add" },
    { path: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#1e3a8a] text-white fixed h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-blue-700">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Sprout className="h-8 w-8" />
            <div>
              <h1 className="font-bold text-lg leading-none">AgriLink</h1>
              <p className="text-xs text-blue-200">Ethiopia</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        {isMounted && (
          <nav className="flex-1 py-4">
            {sidebarNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.path && !item.scrollTo;
              const itemBadge = item.badge || 0;
              const showBadge = itemBadge > 0;
              
              const handleClick = (e: React.MouseEvent) => {
                if (item.scrollTo) {
                  e.preventDefault();
                  const element = document.getElementById(item.scrollTo);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    router.push(item.path);
                  }
                }
              };
              
              return (
                <Link
                  key={item.label + index}
                  href={item.path}
                  onClick={handleClick}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors relative ${
                    isActive
                      ? "bg-blue-700 border-l-4 border-white"
                      : "hover:bg-blue-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="h-5 w-5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {itemBadge > 9 ? '9+' : itemBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Section */}
        <div className="p-4 border-t border-blue-700">
          {isMounted && currentUser ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{currentUser.name}</p>
                  <p className="text-xs text-blue-200 capitalize">{currentUser.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white hover:bg-blue-800"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-blue-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-blue-700 rounded w-16"></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <h2 className="text-xl font-semibold text-gray-800">
                {pathname === "/dashboard" ? "Dashboard" : 
                 pathname === "/search" ? "Search Listings" :
                 pathname === "/add" ? "Add New Listing" : "AgriLink"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {!isOnline && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <WifiOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}

              {/* Notification Bell */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="end">
                  <NotificationPanel 
                    userRole={currentUser?.role || ''} 
                    userId={currentUser?.id || 0}
                  />
                </PopoverContent>
              </Popover>

              {/* Language Selector */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      activeLanguage === lang.code
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-5 w-5" />
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
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto h-5 w-5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
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
        <main className="p-6">{children}</main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
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
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1/4 h-4 w-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
