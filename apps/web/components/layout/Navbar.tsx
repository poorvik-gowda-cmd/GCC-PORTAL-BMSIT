"use client";

import Link from "next/link";
import { useState } from "react";
import { Globe, Menu, X, Shield, Calendar, Award, BookOpen, Users, Compass, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/vision", label: "Vision", icon: Compass },
    { href: "/what-we-do", label: "What We Do", icon: BookOpen },
    { href: "/opportunities", label: "Opportunities", icon: Award },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/collaborations", label: "MOUs & Partners", icon: Globe },
    { href: "/members", label: "Members", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Globe className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              GCC <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">BMSIT&M</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">
              Global Collaboration Cell
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <link.icon className="w-4 h-4 text-blue-400/80" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Portal Sign In CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/portal/login"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-95"
          >
            <Shield className="w-4 h-4" />
            Member Portal
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              <link.icon className="w-5 h-5 text-blue-400" />
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800">
            <Link
              href="/portal/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Member Portal Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
