"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Shield,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      icon: Mail,
      title: "Gmail Integration",
      description:
        "Seamlessly connects to your Gmail account with secure OAuth authentication",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "We never store your email data on our servers. Processing happens via secure cloud APIs with no data retention",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description:
        "AI-powered insights on subscriptions, spending, newsletters, and email patterns",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description:
        "Lightning-fast email analysis using Google Gemini and OpenAI GPT models",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Gmail",
      description: "Secure OAuth connection to your Gmail account",
    },
    {
      number: "02",
      title: "AI Analysis",
      description:
        "Cloud-based LLMs (Gemini, GPT) analyze emails without storing your data",
    },
    {
      number: "03",
      title: "Local Storage",
      description: "Analytics stored securely in your browser's local database",
    },
    {
      number: "04",
      title: "View Reports",
      description: "Access detailed analytics and actionable insights",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">My Inbox Report</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your Gmail into actionable insights. AI-powered
              analytics for subscriptions, spending, and email
              patterns—processed securely with zero data storage.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <button
              onClick={() => router.push("/auth/sign-in")}
              className="gradient-border glow-effect group"
            >
              <div className="px-8 py-4 flex items-center gap-3 text-lg font-semibold">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card p-6 text-left hover:scale-102 transition-transform"
              >
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, secure, and powerful. Get insights from your inbox in four
              easy steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="glass-card p-8 mb-6 hover:scale-105 transition-transform">
                  <div className="text-4xl font-bold gradient-text mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover insights you never knew existed in your inbox.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">47</div>
                <div className="text-muted-foreground">
                  Active Subscriptions
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">
                  $284
                </div>
                <div className="text-muted-foreground">Monthly Spending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">23</div>
                <div className="text-muted-foreground">Newsletter Sources</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Privacy is <span className="gradient-text">Sacred</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {`We never store your email data on our servers. Processing happens
              via secure cloud APIs that don't retain your information, and
              analytics are stored locally in your browser.`}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                "Zero data storage",
                "Secure cloud processing",
                "Local analytics storage",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built in the <span className="gradient-text">Open</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              This project is completely open source. Explore the code,
              contribute features, or fork it for your own use. Transparency and
              community-driven development.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="https://github.com/Ashish-Sontakke/myinboxreport"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-background border border-border hover:border-primary/50 rounded-lg px-6 py-3 transition-all duration-200 group"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">View on GitHub</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Created by</p>
              <a
                href="https://x.com/zeroAsh_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
              >
                <span className="font-medium">@zeroAsh_</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Unlock Your{" "}
              <span className="gradient-text">Inbox Insights</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start analyzing your Gmail today. No signup required, completely
              free, and we never store your email data.
            </p>
            <button
              onClick={() => router.push("/auth/sign-in")}
              className="gradient-border glow-effect group text-lg"
            >
              <div className="px-10 py-5 flex items-center gap-3 font-semibold">
                Connect Gmail & Start Analyzing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
