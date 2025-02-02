"use client";

import { motion } from "framer-motion";
import { techCategories } from "./types";

export function TechStackSection() {
  return (
    <section id="tech-stack" className="py-10 flex justify-center">
      <div className="section-block">
        <div className="container-block relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-foreground">
              Our Tech Stack
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We use cutting-edge technologies to build robust and scalable
              solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-3xl border border-border/30 p-8 hover-lift"
              >
                <h3 className="text-x1 font-semibold mb-4 text-foreground">
                  {category.title}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {category.items.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: techIndex * 0.1 }}
                      className="flex flex-col items-center text-center gap-2"
                    >
                      <div className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors duration-300">
                        <tech.icon className="w-8 h-8" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {tech.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
