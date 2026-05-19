"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AuthCard } from "@/components/marketing/auth-card";
import { Badge } from "@/components/ui/badge";

export function HomeHero() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0,transparent_36%,rgba(216,181,109,0.08)_100%)]" />
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-5 py-8 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-10">
        <section className="flex min-h-[56vh] flex-col justify-center pt-10 lg:min-h-0 lg:pt-0">
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
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, x: 40, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="absolute right-0 top-10 hidden w-64 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl xl:block"
          >
            <div className="mb-4 h-2 w-24 rounded-full bg-white/15" />
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-accent/60" />
              <div className="h-2 w-4/5 rounded-full bg-white/15" />
              <div className="h-2 w-2/3 rounded-full bg-white/10" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}>
            <AuthCard />
          </motion.div>
        </section>
      </div>
    </main>
  );
}
