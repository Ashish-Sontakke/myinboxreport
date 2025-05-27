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

export default function Home() {
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
    <main className="min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-chart-1/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
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
            <button className="gradient-border glow-effect group">
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
              We never store your email data on our servers. Processing happens
              via secure cloud APIs that don't retain your information, and
              analytics are stored locally in your browser.
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
              Start analyzing your Gmail today.
            </p>
            <button className="gradient-border glow-effect group text-lg">
              <div className="px-10 py-5 flex items-center gap-3 font-semibold">
                Connect Gmail & Start Analyzing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
