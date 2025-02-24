"use client";

import { motion } from "framer-motion";
import { PricingCard } from "./pricing-card";
import { packages } from "./types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="py-10 flex justify-center">
      <div className="bg-background dark:bg-black/40 dark:backdrop-blur-sm border dark:border-white/10 rounded-2xl p-8 w-full max-w-7xl">
        <div className="container-block relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-foreground dark:text-white">
              Pricing Plans
            </h2>
            <p className="text-muted-foreground dark:text-white/60 max-w-2xl mx-auto mb-8">
              Choose the perfect team composition for your project
            </p>
            <Link href="/book">
              <Button
                size="lg"
                className="bg-accent dark:bg-white dark:text-black hover:bg-accent/90 dark:hover:bg-white/90"
              >
                Make Your Booking
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="hover-lift"
              >
                <PricingCard {...pkg} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
