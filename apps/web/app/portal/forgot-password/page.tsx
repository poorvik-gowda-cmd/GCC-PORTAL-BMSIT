"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { apiPostPublic } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Backend always returns a generic success message (never reveals account existence)
      await apiPostPublic("/api/v1/auth/forgot-password", { email });
      setSubmitted(true);
    } catch {
      // Even on rate-limit or server error, show generic message — never reveal account status
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link href="/portal/login" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <Card className="glass-panel border-blue-500/30 shadow-2xl">
          <CardHeader className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white font-extrabold">Reset Your Password</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Enter your GCC email address and we&apos;ll send reset instructions if an account exists.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Check your inbox</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If an account exists for <strong>{email}</strong>, password reset instructions have been issued. Check your email within the next 15 minutes.
                </p>
                <Link href="/portal/login">
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">GCC Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="member@bmsit.in"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full justify-center text-sm py-2.5"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Instructions"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
