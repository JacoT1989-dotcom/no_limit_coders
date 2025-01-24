"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Fish } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 dark:from-primary/50 dark:to-primary/30" />
        <div className="absolute inset-0 bg-[radial-gradient(#000_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#fff_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {/* Logo and Title Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 mb-8 md:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="bg-primary p-3 md:p-4 rounded-full">
              <Fish className="h-12 w-12 md:h-16 md:w-16 text-primary-foreground" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Welcome to CatchTrack
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto px-4"
          >
            Your comprehensive solution for documenting and managing fishing
            operations
          </motion.p>
        </motion.div>

        {/* Buttons Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="space-y-4 w-full max-w-[280px] md:max-w-sm px-4"
        >
          <Link href="/login" className="w-full block">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 md:h-12 text-base md:text-lg shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/10"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Sign In
            </Button>
          </Link>

          <Link href="/register" className="w-full block">
            <Button
              variant="outline"
              className="w-full border-2 border-primary text-primary hover:bg-primary/5 h-11 md:h-12 text-base md:text-lg shadow-lg transition-all hover:shadow-xl"
              size="lg"
            >
              <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Create Account
            </Button>
          </Link>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl w-full px-4"
        >
          <div className="text-center p-4 md:p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border">
            <motion.h3
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="text-base md:text-lg font-semibold text-foreground mb-2"
            >
              Real-time Tracking
            </motion.h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor your fishing operations in real-time with accurate
              tracking
            </p>
          </div>

          <div className="text-center p-4 md:p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border">
            <motion.h3
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="text-base md:text-lg font-semibold text-foreground mb-2"
            >
              Compliance Made Easy
            </motion.h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Stay compliant with automated documentation and reporting
            </p>
          </div>

          <div className="text-center p-4 md:p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border">
            <motion.h3
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-base md:text-lg font-semibold text-foreground mb-2"
            >
              Data Analytics
            </motion.h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Make informed decisions with comprehensive data analytics
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
