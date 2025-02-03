"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone } from "lucide-react";
import Link from "next/link";

const RegisterSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto p-8 text-center"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-12 rounded-lg shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Registration Successful!
          </h1>

          <p className="text-lg md:text-xl mb-8">
            Thank you for registering with us. Our team will contact you within
            the next 24 hours via:
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-6 w-6" />
              <span>Email</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-6 w-6" />
              <span>Phone Call</span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-red-100 transition-colors"
          >
            Return to Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterSuccessPage;
