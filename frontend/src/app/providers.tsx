"use client";

import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppProvider>
        {children}
        <Toaster position="top-center" />
      </AppProvider>
    </ThemeProvider>
  );
}
