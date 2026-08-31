"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { apiPostPublic, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams?.get("token") ?? null;
  const [token] = useState<string | null>(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(
    tokenParam ? null : "No reset token provided. Please request a new password reset link."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiPostPublic("/api/v1/auth/reset-password", { token, newPassword });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          setError("Too many attempts. Please request a new password reset link and try again.");
        } else if (err.code === "INVALID_TOKEN") {
          setError("This reset link is invalid or has already been used. Please request a new one.");
        } else {
          setError(err.message || "Password reset failed. Please try again.");
        }
      } else {
        setError("Unable to connect to the server. Please check your connection.");
      }
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
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white font-extrabold">Set New Password</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Choose a strong password. All existing sessions will be invalidated.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Password Updated</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your password has been changed successfully. All previous sessions have been terminated. Please log in with your new password.
                </p>
                <Button variant="gradient" size="sm" className="mt-2 text-xs" onClick={() => router.push("/portal/login")}>
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Min. 10 characters"
                      className="pl-9 pr-9"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!token}
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[11px] text-red-400">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full justify-center text-sm py-2.5"
                  disabled={loading || !token || newPassword.length < 10}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
