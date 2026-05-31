"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthCard } from "@/components/marketing/auth-card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Badge } from "@/components/ui/badge";

export function HomeHero() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="brand-page-glow absolute inset-0" />
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-5 py-8 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-10">
        <div className="absolute left-5 top-8 md:left-8 lg:top-10">
          <BrandLogo size="md" priority />
        </div>
        <section className="flex min-h-[56vh] flex-col justify-center pt-16 lg:min-h-0 lg:pt-0">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
            <Badge className="w-fit gap-2 border-accent/30 bg-accent/10 text-accent">
              <Sparkles className="size-3" />
              Creator onboarding, elevated
            </Badge>
            <div className="max-w-3xl space-y-6">
              <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
                Grow Your Brand With Visual Era
              </h1>
              <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                Professional creator onboarding, identity verification, and management tools.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="relative flex items-center justify-center pb-8 lg:pb-0">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}>
            <AuthCard />
          </motion.div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
