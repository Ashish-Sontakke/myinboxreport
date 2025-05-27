"use client";

import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, RefreshCw, Home, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();
  const getErrorMessage = () => {
    switch (error) {
      case "AccessDenied":
        return {
          title: "Access Denied",
          description:
            "You declined to authorize the application. We need Gmail access to analyze your emails.",
          icon: Mail,
        };
      case "Configuration":
        return {
          title: "Configuration Error",
          description:
            "There's an issue with our authentication setup. Please try again later.",
          icon: AlertCircle,
        };
      case "Verification":
        return {
          title: "Verification Failed",
          description:
            "We couldn't verify your identity. Please try signing in again.",
          icon: AlertCircle,
        };
      default:
        return {
          title: "Authentication Error",
          description: "Something went wrong during sign-in. Please try again.",
          icon: AlertCircle,
        };
    }
  };

  const errorInfo = getErrorMessage();
  const IconComponent = errorInfo.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card p-8 md:p-12 w-full max-w-md text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{errorInfo.title}</h1>
          <p className="text-muted-foreground">{errorInfo.description}</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg p-3 transition-colors group flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full bg-background border border-border hover:border-primary/50 rounded-lg p-3 transition-all duration-200 group flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
        </motion.div>

        {/* Support Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          Still having trouble?{" "}
          <Link
            href="https://github.com/Ashish-Sontakke/myinboxreport/issues"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report an issue
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
