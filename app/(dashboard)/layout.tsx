"use client";

import { useAuth } from "@/contexts/auth-context";
import { Mail, ShieldCheck, HardDrive } from "lucide-react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";

function SignInScreen() {
  const { signIn, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {siteConfig.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Connect your Gmail to start analyzing your inbox. Everything runs
            locally in your browser.
          </p>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={signIn}
          disabled={isLoading}
        >
          <Mail className="mr-2 size-5" />
          {isLoading ? "Initializing..." : "Sign in with Google"}
        </Button>

        <div className="grid grid-cols-2 gap-4 text-left text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
            <span>Read-only access. We never send or delete emails.</span>
          </div>
          <div className="flex items-start gap-2">
            <HardDrive className="mt-0.5 size-4 shrink-0 text-blue-600" />
            <span>Data stays in your browser. No servers involved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInScreen />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
