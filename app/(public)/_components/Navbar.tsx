"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import eagleLogo from "@/assets/eagle.jpg";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "SERVICES", href: "/services" },
  { label: "TECH STACK", href: "/tech-stack" },
  { label: "OUR TEAM", href: "/our-team" },
  { label: "CONTACT US", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="ml-4 container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src={eagleLogo}
            alt="Eagle Logo"
            width={45}
            height={45}
            className="rounded-full hover:scale-110 transition-transform duration-200"
          />
          <div className="flex gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              NO LIMIT
            </span>
            <span className="text-lg font-semibold text-gray-200">CODERS</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className="text-gray-300 hover:text-black hover:bg-slate-700/50 transition-all duration-200 px-4"
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>

        {/* Mobile Navigation Button */}
        <Button
          variant="ghost"
          className="md:hidden text-gray-300 hover:text-black mr-7"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full border-b md:hidden bg-slate-900/95">
          <div className="container py-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                asChild
                className="w-full justify-start text-gray-300 hover:bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                <Link href={item.href}>
                  <span className="hover:bg-slate-700/50 px-4 py-2 rounded-md transition-colors">
                    {item.label}
                  </span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
