"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sprout, User, Phone, Lock, Mail, Key } from "lucide-react";
import { toast } from "sonner";

export default function AdminSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"verify" | "register">("verify");
  const [setupKey, setSetupKey] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify the setup key
    const SETUP_KEY = "AGRILINK_ADMIN_2024"; // This should match backend
    
    if (setupKey === SETUP_KEY) {
      setStep("register");
      toast.success("Setup key verified! Please create your admin account.");
    } else {
      toast.error("Invalid setup key. Please contact system administrator.");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    console.log("Sending setup key:", setupKey);
    console.log("Form data:", { ...formData, password: "***" });

    try {
      const requestBody = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        setupKey: setupKey,
      };
      
      console.log("Request body:", { ...requestBody, password: "***" });

      const response = await fetch("http://localhost:8080/api/auth/setup-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Setup-Key": setupKey,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        toast.success("Admin account created successfully!");
        
        // Store phone for convenience
        localStorage.setItem('admin_phone', formData.phone);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else if (response.status === 409) {
        toast.error("Admin user already exists. Please login instead.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else if (response.status === 403) {
        const errorText = await response.text();
        console.error("403 Error:", errorText);
        toast.error("Invalid setup key. Please try again.");
        setStep("verify");
        setSetupKey("");
      } else {
        const errorText = await response.text();
        console.error("Error:", errorText);
        toast.error("Failed to create admin account");
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Sprout className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg leading-none">AgriLink</h1>
            <p className="text-xs text-muted-foreground">Ethiopia</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-md p-6">
          {step === "verify" ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Key className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Admin Setup</h2>
                <p className="text-muted-foreground">
                  Enter the setup key to create an administrator account
                </p>
              </div>

              <form onSubmit={handleVerifyKey} className="space-y-4">
                <div>
                  <Label htmlFor="setupKey">Setup Key</Label>
                  <div className="relative mt-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="setupKey"
                      type="password"
                      placeholder="Enter setup key"
                      value={setupKey}
                      onChange={(e) => setSetupKey(e.target.value)}
                      className="pl-10 min-h-[48px]"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact your system administrator for the setup key
                  </p>
                </div>

                <Button type="submit" className="w-full min-h-[48px]">
                  Verify Setup Key
                </Button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Security Notice:</strong> This page is for initial system setup only.
                  The setup key is required to prevent unauthorized admin account creation.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Create Admin Account</h2>
                <p className="text-muted-foreground">
                  Fill in your details to create the administrator account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="pl-10 min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251911234567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="pl-10 min-h-[48px]"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be your login username
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pl-10 min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="pl-10 min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
                  {loading ? "Creating Admin Account..." : "Create Admin Account"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
