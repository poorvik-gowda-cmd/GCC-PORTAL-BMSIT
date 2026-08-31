"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { apiPostPublic, ApiError, setStoredSessionToken } from "@/lib/api";

interface LoginSuccess {
  user: { id: string; email: string; fullName: string; roles: string[]; departments: string[] };
  sessionToken?: string;
}
interface LoginMfa {
  requiresMfa: boolean;
  mfaSessionToken: string;
}

export default function MemberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Login is in the CSRF exempt list — use public post (no CSRF header needed)
      const data = await apiPostPublic<LoginSuccess | LoginMfa>("/api/v1/auth/login", { email, password });

      if ("requiresMfa" in data && data.requiresMfa) {
        sessionStorage.setItem("gcc_mfa_token", data.mfaSessionToken);
        router.push("/portal/mfa-verify");
        return;
      }

      if ("sessionToken" in data && data.sessionToken) {
        setStoredSessionToken(data.sessionToken);
      }

      router.push("/portal/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          setError("Too many login attempts. Please wait 15 minutes before trying again.");
        } else {
          setError(err.message || "Invalid email or password");
        }
      } else {
        setError("Unable to connect to authentication server. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Return to Public GCC Website
        </Link>

        <Card className="glass-panel border-blue-500/30 shadow-2xl">
          <CardHeader className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white font-extrabold">GCC Member Sign In</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Global Collaboration Cell — BMSIT&M Internal Portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <Input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full justify-center text-sm py-2.5" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Member Portal"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-0 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <Link href="/portal/forgot-password" className="hover:text-slate-300 underline-offset-2 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-300 block mb-0.5">Strict Access Policy</strong>
              Public signup is disabled. Accounts, roles, and permissions are controlled exclusively by administrators.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}