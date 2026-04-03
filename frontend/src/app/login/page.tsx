"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sprout, Phone, Lock } from "lucide-react";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Welcome Back",
    subtitle: "Login to your AgriLink account",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+251911234567",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    submit: "Login",
    submitting: "Logging in...",
    forgot: "Forgot password?",
    or: "Or",
    registerPrompt: "Don't have an account?",
    registerLink: "Register now",
    toastSuccess: "Login successful!",
    toastInvalid: "Invalid phone number or password",
    toastError: "An error occurred. Please try again.",
    loginRequired: "Login required",
  },
  am: {
    title: "እንኳን በደህና መጡ",
    subtitle: "ወደ አግሪሊንክ መለያዎ ይግቡ",
    phoneLabel: "የስልክ ቁጥር",
    phonePlaceholder: "+251911234567",
    passwordLabel: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    submit: "ግባ",
    submitting: "በመግባት ላይ...",
    forgot: "የይለፍ ቃል ዘነጋዎ?",
    or: "ወይም",
    registerPrompt: "መለያ የለዎትም?",
    registerLink: "አሁን ይመዝገቡ",
    toastSuccess: "በተሳካ ሁኔታ ገብተዋል!",
    toastInvalid: "ልክ ያልሆነ ስልክ ወይም የይለፍ ቃል",
    toastError: "ስህተት ተፈጥሯል። እባክዎ ደግመው ይሞክሩ።",
    loginRequired: "መግባት ያስፈልጋል",
  },
  or: {
    title: "Baga nagaan dhuftan",
    subtitle: "Kutaa AgriLink keessan seena",
    phoneLabel: "Lakkoofsa Bilbila",
    phonePlaceholder: "+251911234567",
    passwordLabel: "Jecha Darbii",
    passwordPlaceholder: "Jecha darbii galchi",
    submit: "Seeni",
    submitting: "Seenaa jirta...",
    forgot: "Jecha darbii dagatte?",
    or: "Yookaan",
    registerPrompt: "Akkaawuntii hin qabdu?",
    registerLink: "Amma galmaa'i",
    toastSuccess: "Milkaannaan seente!",
    toastInvalid: "Lakkoofsi bilbila ykn jecha darbii dogoggora",
    toastError: "Dogoggorri uumame. Maaloo irra deebi'ii yaali.",
    loginRequired: "Seenuu barbaachisa",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { login, language } = useApp();
  const t = translations[language] ?? translations.en;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Login attempt:', { phone, passwordLength: password.length });

    try {
      const success = await login(phone, password);
      if (success) {
        toast.success(t.toastSuccess);
        router.push("/dashboard");
      } else {
        toast.error(t.toastInvalid);
      }
    } catch (error) {
      console.error('Login error:', error);
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

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">{t.phoneLabel}</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">{t.passwordLabel}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 min-h-[48px]"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
              {loading ? t.submitting : t.submit}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <a href="#" className="text-sm text-primary hover:underline">
                {t.forgot}
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t.or}</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t.registerPrompt}{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  {t.registerLink}
                </Link>
              </p>
            </div>
          </div>

        </Card>
      </div>
    </div>
  );
}
