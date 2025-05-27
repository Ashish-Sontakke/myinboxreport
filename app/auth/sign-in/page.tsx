"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
export default function SignInPage() {
  const handleGoogleSignIn = () => {
    signIn("google", {
      redirect: true,
      redirectTo: "/app",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card p-8 md:p-12 w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to <span className="gradient-text">My Inbox Report</span>
          </h1>
          <p className="text-muted-foreground">
            Sign in to analyze your Gmail with AI-powered insights
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-background border border-border hover:border-primary/50 rounded-lg p-4 transition-all duration-200 group hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-medium text-lg">Continue with Google</span>
            </div>
          </button>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 space-y-3"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-primary" />
            <span>Secure OAuth 2.0 authentication</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Eye className="w-4 h-4 text-primary" />
            <span>Read-only access to analyze email patterns</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>GDPR compliant with zero data storage</span>
          </div>
        </motion.div>

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
