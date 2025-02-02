"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FloatingElement = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className={className}
  >
    {children}
  </motion.div>
);

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-12 md:pt-0 mt-0 bg-background px-4 md:px-0">
      <div className="section-block section-block-dark py-14 md:py-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-[10%] w-16 md:w-24 h-16 md:h-24 bg-accent/10 rounded-full float" />
          <div className="absolute top-40 right-[15%] w-20 md:w-32 h-20 md:h-32 bg-accent/5 rounded-full float-reverse delay-2" />
          <div className="absolute bottom-20 left-[20%] w-24 md:w-40 h-24 md:h-40 bg-accent/10 rounded-full float delay-3" />
          <div className="absolute top-1/3 right-[25%] w-12 md:w-16 h-12 md:h-16 bg-accent/5 rounded-full float-reverse delay-4" />

          {/* Red gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]" />
        </div>

        <div className="container-block relative z-20 py-8">
          <div className="max-w-4xl mx-auto">
            <FloatingElement className="slide-up delay-1">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight text-center md:text-left">
                <span className="text-gradient">Transforming Ideas into</span>
                <br />
                <span className="text-accent hover-scale inline-block">
                  Digital Excellence
                </span>
              </h1>
            </FloatingElement>

            <FloatingElement className="slide-up delay-2">
              <p className="text-gradient text-xl md:text-2xl mb-12 max-w-3xl text-center md:text-left">
                Expert full-stack development teams delivering cutting-edge
                solutions with precision and innovation
              </p>
            </FloatingElement>

            <FloatingElement className="slide-up delay-3">
              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="red-gradient text-white hover-lift px-8 py-6 text-lg group w-full sm:w-[240px]"
                >
                  <Link
                    href="/book"
                    className="flex items-center gap-2 justify-center"
                  >
                    Book Consultation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="hover-lift px-8 py-6 text-lg group w-full sm:w-[240px]"
                >
                  <Link
                    href="#pricing"
                    className="flex items-center gap-2 justify-center"
                  >
                    View Our Work
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </FloatingElement>

            {/* Stats section with floating animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-border/30">
              <FloatingElement className="float delay-1">
                <div className="hover-scale">
                  <h3 className="text-4xl font-bold mb-2 text-accent">80+</h3>
                  <p className="text-muted-foreground">Projects Delivered</p>
                </div>
              </FloatingElement>
              <FloatingElement className="float-reverse delay-2">
                <div className="hover-scale">
                  <h3 className="text-4xl font-bold mb-2 text-accent">98%</h3>
                  <p className="text-muted-foreground">Client Satisfaction</p>
                </div>
              </FloatingElement>
              <FloatingElement className="float delay-3">
                <div className="hover-scale">
                  <h3 className="text-4xl font-bold mb-2 text-accent">20+</h3>
                  <p className="text-muted-foreground">Expert Developers</p>
                </div>
              </FloatingElement>
              <FloatingElement className="float-reverse delay-4">
                <div className="hover-scale">
                  <h3 className="text-4xl font-bold mb-2 text-accent">24/7</h3>
                  <p className="text-muted-foreground">Support Available</p>
                </div>
              </FloatingElement>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
