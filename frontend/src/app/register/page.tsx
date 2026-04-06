"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, User, Phone, Lock, Truck, Users } from "lucide-react";
import { toast } from "sonner";
import { getTransporterUploadPreset, uploadToCloudinary } from "@/lib/cloudinary";
import { UserRole } from "@/types";

const translations = {
  en: {
    title: "Create Account",
    subtitle: "Join AgriLink Ethiopia today",
    roleLabel: "I am a:",
    role: {
      farmer: "Farmer",
      buyer: "Buyer",
      transporter: "Transporter",
      cooperative: "Cooperative",
    },
    nameLabel: "Full Name",
    coopNameLabel: "Cooperative Name",
    coopOrgLabel: "Organization Name",
    namePlaceholder: "Enter your name",
    coopPlaceholder: "Enter cooperative name",
    nationalIdLabel: "National ID Number",
    nationalIdPlaceholder: "Enter your national ID number",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+251911234567",
    regionLabel: "Region",
    regionPlaceholder: "Select your region",
    vehicleTypeLabel: "Vehicle Type",
    vehicleTypePlaceholder: "e.g., Truck, Van",
    vehicleCapacityLabel: "Vehicle Capacity",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    submit: "Create Account",
    submitting: "Creating Account...",
    loginPrompt: "Already have an account?",
    loginLink: "Login here",
    toastMismatch: "Passwords do not match",
    toastLength: "Password must be at least 6 characters",
    toastSuccess: "Registration successful!",
    toastPending: "Registration submitted. Awaiting approval.",
    toastFail: "Registration failed. Please try again.",
    toastError: "An error occurred. Please try again.",
  },
  am: {
    title: "መለያ ይፍጠሩ",
    subtitle: "ዛሬ አግሪሊንክ ኢትዮጵያን ይቀላቀሉ",
    roleLabel: "እኔ እኔ የሆንሁ፦",
    role: {
      farmer: "ገበሬ",
      buyer: "ገዢ",
      transporter: "ትራንስፖርተር",
      cooperative: "ህብረት",
    },
    nameLabel: "ሙሉ ስም",
    coopNameLabel: "የህብረት ስም",
    coopOrgLabel: "የድርጅት ስም",
    namePlaceholder: "ስምዎን ያስገቡ",
    coopPlaceholder: "የህብረት ስም ያስገቡ",
    nationalIdLabel: "የመታወቂያ ቁጥር",
    nationalIdPlaceholder: "የመታወቂያ ቁጥርዎን ያስገቡ",
    phoneLabel: "የስልክ ቁጥር",
    phonePlaceholder: "+251911234567",
    regionLabel: "ክልል",
    regionPlaceholder: "ክልልዎን ይምረጡ",
    vehicleTypeLabel: "የተሽከርካሪ አይነት",
    vehicleTypePlaceholder: "ለምሳሌ ትራክ፣ ቫን",
    vehicleCapacityLabel: "የተሽከርካሪ አቅም",
    passwordLabel: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃል ይፍጠሩ",
    confirmPasswordLabel: "የይለፍ ቃል ያረጋግጡ",
    confirmPasswordPlaceholder: "የይለፍ ቃልዎን ዳግም ያስገቡ",
    submit: "መለያ ይፍጠሩ",
    submitting: "በመፍጠር ላይ...",
    loginPrompt: "መለያ አለዎት?",
    loginLink: "እዚህ ይግቡ",
    toastMismatch: "የይለፍ ቃሎቹ አይመሳሰሉም",
    toastLength: "የይለፍ ቃል ቢያንስ 6 ቁምፊ ይሆን አለበት",
    toastSuccess: "በተሳካ ሁኔታ ተመዝግበዋል!",
    toastPending: "መመዝገብ ተቀባይነት አግኝቷል። እባክዎ ማረጋገጫን ይጠብቁ።",
    toastFail: "መመዝገብ አልተሳካም። እባክዎ ደግመው ይሞክሩ።",
    toastError: "ስህተት ተፈጥሯል። እባክዎ ደግመው ይሞክሩ።",
  },
  or: {
    title: "Akkaawuntii uumi",
    subtitle: "Har'a AgriLink Itoophiyaa seeni",
    roleLabel: "Ani waa'ee koo:",
    role: {
      farmer: "Qonnaan bultoota",
      buyer: "Bittaa",
      transporter: "Geejjibaa",
      cooperative: "Hirmaattota",
    },
    nameLabel: "Maqaa guutuu",
    coopNameLabel: "Maqaa waldaa",
    coopOrgLabel: "Maqaa dhaabbataa",
    namePlaceholder: "Maqaa kee galchi",
    coopPlaceholder: "Maqaa waldaa galchi",
    nationalIdLabel: "Lakkoofsa Eenyummaa Biyyaalessaa",
    nationalIdPlaceholder: "Lakkoofsa eenyummaa kee galchi",
    phoneLabel: "Lakkoofsa Bilbila",
    phonePlaceholder: "+251911234567",
    regionLabel: "Naannoo",
    regionPlaceholder: "Naannoo kee filadhu",
    vehicleTypeLabel: "Gosa Konkolaataa",
    vehicleTypePlaceholder: "fkn. Trakii, Vaanii",
    vehicleCapacityLabel: "Humna Geejjibaa",
    passwordLabel: "Jecha Darbii",
    passwordPlaceholder: "Jecha darbii uumi",
    confirmPasswordLabel: "Jecha Darbii Mirkaneessi",
    confirmPasswordPlaceholder: "Jecha darbii irra deebi'i",
    submit: "Akkaawuntii uumi",
    submitting: "Akkaawuntii uumamaa...",
    loginPrompt: "Akkaawuntiin jiraa?",
    loginLink: "As seeni",
    toastMismatch: "Jecha darbii walsima hin qabu",
    toastLength: "Jecha darbii dheerina 6 ol qabaachuu qaba",
    toastSuccess: "Galmeessi milkaa'e!",
    toastPending: "Galmeen fudhatame. Mirkaneessaaf eegaa.",
    toastFail: "Galmeessi hin milkoofne. Maaloo irra deebi'i yaali.",
    toastError: "Dogoggorri uumame. Maaloo irra deebi'i yaali.",
  },
} as const;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, language } = useApp();
  const t = translations[language] ?? translations.en;

  const initialRole = (searchParams.get("role") as UserRole) || "farmer";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: initialRole as UserRole,
    region: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
    vehicleType: "",
    vehicleCapacity: "",
    cooperativeName: "",
  });
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null);
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setFormData((prev) => ({ ...prev, role: roleParam as UserRole }));
    }
  }, [searchParams]);

  const regions = [
    "Addis Ababa",
    "Afar",
    "Amhara",
    "Benishangul-Gumuz",
    "Dire Dawa",
    "Gambela",
    "Harari",
    "Oromia",
    "Sidama",
    "SNNPR",
    "Somali",
    "Tigray",
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t.toastMismatch);
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t.toastLength);
      return;
    }

    setLoading(true);

    try {
      let vehicleImageUrl: string | undefined;
      if (formData.role === "transporter" && vehicleImageFile) {
        vehicleImageUrl = await uploadToCloudinary(vehicleImageFile, getTransporterUploadPreset());
      }

      const success = await register(
        {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          region: formData.region,
          nationalId: formData.nationalId,
          vehicleType: formData.vehicleType || undefined,
          vehicleCapacity: formData.vehicleCapacity || undefined,
          vehicleImageUrl: vehicleImageUrl || undefined,
          cooperativeName: formData.cooperativeName || undefined,
        },
        formData.password,
      );

      if (success) {
        if (formData.role === "transporter") {
          toast.success(t.toastPending);
        } else {
          toast.success(t.toastSuccess);
        }
        router.push("/dashboard");
      } else {
        toast.error(t.toastFail);
      }
    } catch {
      toast.error(t.toastError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-2">
          <Sprout className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg leading-none">AgriLink</h1>
            <p className="text-xs text-muted-foreground">Ethiopia</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="role">{t.roleLabel}</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger className="min-h-[48px] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">
                    <div className="flex items-center gap-2">
                      <Sprout className="h-4 w-4" />
                      {t.role.farmer}
                    </div>
                  </SelectItem>
                  <SelectItem value="buyer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t.role.buyer}
                    </div>
                  </SelectItem>
                  <SelectItem value="transporter">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {t.role.transporter}
                    </div>
                  </SelectItem>
                  <SelectItem value="cooperative">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t.role.cooperative}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">
                {formData.role === "cooperative" ? t.coopNameLabel : t.nameLabel}
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-10 min-h-[48px]"
                  required
                />
              </div>
            </div>

            {formData.role === "cooperative" && (
              <div>
                <Label htmlFor="cooperativeName">{t.coopOrgLabel}</Label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cooperativeName"
                    type="text"
                    placeholder={t.coopPlaceholder}
                    value={formData.cooperativeName}
                    onChange={(e) => handleChange("cooperativeName", e.target.value)}
                    className="pl-10 min-h-[48px]"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="phone">{t.phoneLabel}</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="pl-10 min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nationalId">{t.nationalIdLabel}</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nationalId"
                  type="text"
                  placeholder={t.nationalIdPlaceholder}
                  value={formData.nationalId}
                  onChange={(e) => handleChange("nationalId", e.target.value)}
                  className="pl-10 min-h-[48px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="region">{t.regionLabel}</Label>
              <Select value={formData.region} onValueChange={(value) => handleChange("region", value)}>
                <SelectTrigger className="min-h-[48px] mt-1">
                  <SelectValue placeholder={t.regionPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === "transporter" && (
              <>
                <div>
                  <Label htmlFor="vehicleType">{t.vehicleTypeLabel}</Label>
                  <div className="relative mt-1">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="vehicleType"
                      type="text"
                      placeholder={t.vehicleTypePlaceholder}
                      value={formData.vehicleType}
                      onChange={(e) => handleChange("vehicleType", e.target.value)}
                      className="pl-10 min-h-[48px]"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vehicleCapacity">{t.vehicleCapacityLabel}</Label>
                  <Input
                    id="vehicleCapacity"
                    type="text"
                    placeholder="e.g., 5 tons"
                    value={formData.vehicleCapacity}
                    onChange={(e) => handleChange("vehicleCapacity", e.target.value)}
                    className="min-h-[48px] mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleImage">Vehicle Photo (Optional)</Label>
                  <Input
                    id="vehicleImage"
                    type="file"
                    accept="image/*"
                    className="min-h-[48px] mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setVehicleImageFile(file);
                      if (!file) {
                        setVehicleImagePreview(null);
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setVehicleImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {vehicleImagePreview && (
                    <img
                      src={vehicleImagePreview}
                      alt="Vehicle preview"
                      className="mt-2 h-32 w-full rounded-md border object-cover"
                    />
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="password">{t.passwordLabel}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10 min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t.confirmPasswordPlaceholder}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="pl-10 min-h-[48px]"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
              {loading ? t.submitting : t.submit}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t.loginPrompt}{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t.loginLink}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
