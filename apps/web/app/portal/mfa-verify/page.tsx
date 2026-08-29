"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { apiPostPublic, ApiError } from "@/lib/api";

interface MfaVerifyResult {
  user: { id: string; email: string; fullName: string };
}

export default function MfaVerifyPage() {
  const router = useRouter();
  const [mfaSessionToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("gcc_mfa_token");
    }
    return null;
  });
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    if (!mfaSessionToken) {
      router.replace("/portal/login");
    }
  }, [mfaSessionToken, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaSessionToken) return;

    setLoading(true);
    setError(null);

    const payload: Record<string, string> = { mfaSessionToken };
    if (useRecovery) {
      payload.recoveryCode = recoveryCode.trim().toUpperCase();
    } else {
      payload.totpCode = totpCode.trim();
    }

    try {
      // mfa/verify is NOT in the CSRF exempt list but there's no session cookie yet
      // so the csrf middleware will skip enforcement (hasSession = false).
      // We use apiPostPublic to avoid a CSRF fetch attempt before a session exists.
      await apiPostPublic<MfaVerifyResult>("/api/v1/auth/mfa/verify", payload);

      // Session cookie is now set by the backend — clear the temporary MFA token
      sessionStorage.removeItem("gcc_mfa_token");
      router.replace("/portal/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          setRateLimited(true);
          setError("Too many verification attempts. Please wait 5 minutes before trying again. For security, your MFA session has been exhausted — please log in again.");
          sessionStorage.removeItem("gcc_mfa_token");
        } else if (err.statusCode === 401) {
          setError("Your MFA session has expired. Please log in again.");
          sessionStorage.removeItem("gcc_mfa_token");
        } else {
          setError(err.message || "Verification failed. Please check your code and try again.");
        }
      } else {
        setError("Unable to connect to authentication server.");
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white font-extrabold">Two-Factor Verification</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                {useRecovery
                  ? "Enter one of your saved recovery codes."
                  : "Enter the 6-digit code from your authenticator app."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!rateLimited && (
                <>
                  {useRecovery ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Recovery Code</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <Input
                          type="text"
                          required
                          autoComplete="off"
                          placeholder="XXXX-XXXX-XXXX"
                          className="pl-9 font-mono uppercase tracking-widest"
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value)}
                          maxLength={20}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Authenticator Code</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        required
                        autoComplete="one-time-code"
                        placeholder="000000"
                        className="text-center text-xl font-mono tracking-[0.4em]"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full justify-center text-sm py-2.5"
                    disabled={loading || (!useRecovery && totpCode.length !== 6) || (useRecovery && recoveryCode.length < 6)}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                  </Button>
                </>
              )}

              {rateLimited && (
                <Link href="/portal/login">
                  <Button variant="outline" className="w-full text-xs">
                    Return to Login
                  </Button>
                </Link>
              )}
            </form>
          </CardContent>

          {!rateLimited && (
            <CardFooter className="flex flex-col gap-2 pt-0 text-center">
              <button
                type="button"
                onClick={() => {
                  setUseRecovery((v) => !v);
                  setError(null);
                  setTotpCode("");
                  setRecoveryCode("");
                }}
                className="text-xs text-slate-400 hover:text-white underline-offset-2 hover:underline"
              >
                {useRecovery ? "Use authenticator app instead" : "Use a recovery code instead"}
              </button>
              <p className="text-[10px] text-slate-500">
                This session expires in 5 minutes. Maximum 5 verification attempts.
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
