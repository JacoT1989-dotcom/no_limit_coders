"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { techStack } from "./types";

export function TechStackSlider() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 bg-secondary/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Technologies We Use</h2>
          <p className="text-muted-foreground">
            Built with cutting-edge technologies for optimal performance
          </p>
        </motion.div>
      </div>

      <div className="relative" ref={containerRef}>
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-8 py-4"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...techStack, ...techStack].map((tech, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center min-w-[120px] h-24 bg-card rounded-lg shadow-sm px-6"
              >
                <tech.icon className="w-8 h-8 mb-2 text-primary" />
                <span className="text-xs font-medium text-center">
                  {tech.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
}
