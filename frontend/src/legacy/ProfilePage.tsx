"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
  Edit,
  Settings,
  LogOut,
  Star,
  Truck,
  Building2,
} from "lucide-react";

export default function ProfilePage() {
  const { currentUser, logout } = useApp();
  const router = useRouter();

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 max-w-screen-sm space-y-4">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-xl font-semibold">Login required</h2>
            <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-1">My Profile</h2>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold mb-1">{currentUser.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={currentUser.verified ? 'default' : 'secondary'}>
                {currentUser.verified ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Verification
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {currentUser.role}
              </Badge>
            </div>
            {currentUser.rating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {currentUser.rating} Rating
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Phone className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-medium">{currentUser.phone}</p>
              </div>
            </div>

            {/* Email */}
            {currentUser.email && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
              </div>
            )}

            {/* Region */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Region</p>
                <p className="font-medium">{currentUser.region}</p>
              </div>
            </div>

            {/* Role-specific info */}
            {currentUser.role === 'transporter' && (
              <>
                {currentUser.vehicleType && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Vehicle Type</p>
                      <p className="font-medium">{currentUser.vehicleType}</p>
                    </div>
                  </div>
                )}
                {currentUser.vehicleCapacity && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Vehicle Capacity</p>
                      <p className="font-medium">{currentUser.vehicleCapacity}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {currentUser.role === 'cooperative' && (
              <>
                {currentUser.cooperativeName && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Cooperative Name</p>
                      <p className="font-medium">{currentUser.cooperativeName}</p>
                    </div>
                  </div>
                )}
                {currentUser.memberCount && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <UserIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="font-medium">{currentUser.memberCount} members</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" className="min-h-[44px]">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="min-h-[44px]">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </Card>

        {/* Account Status */}
        {!currentUser.verified && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">Verification Pending</h4>
                <p className="text-sm text-yellow-800 mb-3">
                  Your account is awaiting verification. This usually takes 1-2 business days.
                </p>
                <Button size="sm" variant="outline" className="bg-white">
                  Check Status
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Additional Options */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Account Actions</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Help */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Need Help?</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              FAQ & Support
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Contact Us
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Terms & Privacy
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
