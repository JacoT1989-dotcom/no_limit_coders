"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  Search,
  FileText,
  Clock,
  TrendingUp,
  Zap,
  BarChart,
} from "lucide-react";
import Link from "next/link";

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent leading-[1.2] px-4 pb-2">
              Transform Your
              <br className="hidden sm:block" />
              Business
              <br />
              Go Paperless Today
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto px-4 leading-[1.8] pb-2">
              Say goodbye to endless paperwork. Our digital solutions streamline
              your operations with instant search, smart filtering, and
              automated workflows that save you countless hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg rounded-full w-full sm:w-auto leading-none"
              >
                <Link href={"/pricing"}>Book a team for 1 week free</Link>
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center p-6"
            >
              <h3 className="text-4xl font-bold text-blue-400 mb-2 leading-[1.2]">
                85%
              </h3>
              <p className="text-gray-300 text-lg leading-[1.6]">
                Reduction in Paperwork
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6"
            >
              <h3 className="text-4xl font-bold text-cyan-400 mb-2 leading-[1.2]">
                4x
              </h3>
              <p className="text-gray-300 text-lg leading-[1.6]">
                Faster Document Processing
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6"
            >
              <h3 className="text-4xl font-bold text-blue-400 mb-2 leading-[1.2]">
                60hrs
              </h3>
              <p className="text-gray-300 text-lg leading-[1.6]">
                Saved Monthly Per Employee
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent px-4 leading-[1.2] pb-2">
            The Future of Business Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {[
              {
                icon: <Search className="h-6 w-6" />,
                title: "Instant Search",
                description:
                  "Find any document in seconds with powerful search capabilities",
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Smart Documents",
                description:
                  "AI-powered document processing and automated data extraction",
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Time Saving",
                description:
                  "Automated workflows that reduce manual tasks by up to 85%",
              },
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Performance Analytics",
                description: "Real-time insights into your business operations",
              },
              {
                icon: <BarChart className="h-6 w-6" />,
                title: "Business Intelligence",
                description:
                  "Advanced reporting and analytics for informed decision making",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Team Collaboration",
                description:
                  "Seamless sharing and collaboration across departments",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer hover:bg-slate-800/70"
              >
                <div className="mb-4 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100 leading-[1.4]">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-[1.6]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 px-4 leading-[1.2] pb-2">
            Ready to Revolutionize Your Workflow?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto px-4 leading-[1.6] pb-2">
            Join thousands of businesses that have transformed their operations
            with our solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full w-full sm:w-auto leading-none"
            >
              <Link href={"/getting-started"}>Get Started Now</Link>
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
