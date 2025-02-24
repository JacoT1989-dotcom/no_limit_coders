"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { services } from "./types";

export function ServicesSection() {
  return (
    <section
      id="services"
      className="-mt-0 py-2 md:py-8 flex justify-center px-4 md:px-0"
    >
      <div className="bg-background dark:bg-black/40 dark:backdrop-blur-sm border dark:border-white/10 rounded-2xl p-8 w-full max-w-7xl">
        <div className="container-block relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground dark:text-white">
              Our Services
            </h2>
            <p className="text-base md:text-lg text-muted-foreground dark:text-white/60 max-w-2xl mx-auto px-4 md:px-0">
              Comprehensive web development solutions tailored to your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card dark:bg-black/40 dark:backdrop-blur-sm 
                          rounded-lg p-6 md:p-8 
                          hover:shadow-lg dark:hover:shadow-white/5 
                          transition-shadow
                          border dark:border-white/10"
              >
                <div className="mb-4 text-accent dark:text-white">
                  <service.icon className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground dark:text-white/60">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {service.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm md:text-base"
                    >
                      <CheckCircle2 className="w-5 h-5 text-accent dark:text-white shrink-0 mt-0.5" />
                      <span className="dark:text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
