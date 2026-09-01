"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FolderGit2,
  QrCode,
  LogOut,
  User,
  Users,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost, ApiError } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  departments: string[];
  permissions: string[];
}

const PUBLIC_AUTH_PATHS = [
  "/portal/login",
  "/portal/mfa-verify",
  "/portal/forgot-password",
  "/portal/reset-password",
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isPublicAuthPath = PUBLIC_AUTH_PATHS.includes(pathname || "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ user: UserProfile }>("/api/v1/auth/me");
        if (!cancelled) {
          setUser(data.user);
          setAuthError(null);
          if (isPublicAuthPath) {
            // Redirect logged-in user to their home desk/dashboard
            const u = data.user;
            if (u.roles?.includes("SYSTEM_SUPER_ADMIN")) {
              router.replace("/portal/system-admin");
            } else if (u.roles?.includes("EXECUTIVE_COUNCIL")) {
              router.replace("/portal/departments/EXECUTIVE_COUNCIL");
            } else if (u.departments?.[0]) {
              router.replace(`/portal/departments/${u.departments[0]}`);
            } else {
              router.replace("/portal/dashboard");
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.statusCode === 401) {
            if (!isPublicAuthPath) {
              router.replace("/portal/login");
            }
            return;
          }
          if (!isPublicAuthPath) {
            setAuthError("Unable to verify session. Please sign in.");
          }
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, pathname, isPublicAuthPath]);

  const handleLogout = async () => {
    try {
      await apiPost("/api/v1/auth/logout");
    } catch {
      // Clear client state on logout fail
    }
    setUser(null);
    router.replace("/portal/login");
  };

  const isSuperAdmin = user?.roles?.includes("SYSTEM_SUPER_ADMIN");
  const isExecCouncil = user?.roles?.includes("EXECUTIVE_COUNCIL");

  const deptHref =
    isSuperAdmin || isExecCouncil
      ? "/portal/departments"
      : user?.departments?.[0]
      ? `/portal/departments/${user.departments[0]}`
      : "/portal/departments";

  const navItems = [
    { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/tasks", label: "Task Tracker", icon: CheckSquare },
    { href: "/portal/events", label: "Event Desk", icon: Calendar },
    { href: "/portal/registrations", label: "Registrations Hub", icon: Users },
    { href: deptHref, label: "Department Desks", icon: FolderGit2 },
    { href: "/portal/qr", label: "QR Manager", icon: QrCode },
  ];

  // System Admin (Super Admin only — distinct from Executive Council)
  if (isSuperAdmin) {
    navItems.push({ href: "/portal/system-admin", label: "System Admin", icon: ShieldCheck });
  }

  // Show full-screen loader while verifying session, except on public auth routes
  if (!authChecked && !isPublicAuthPath) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-xs text-slate-400">Verifying session credentials…</span>
        </div>
      </div>
    );
  }

  // Hide sidebar layout entirely on public auth routes
  if (isPublicAuthPath) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center w-full">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col md:flex-row text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-800/80 bg-[#080a0f]/90 p-5 space-y-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo/gcc-logo.png"
              alt="GCC Logo"
              className="h-10 w-auto object-contain shrink-0"
            />
            <div>
              <span className="font-bold text-white text-sm block">Member Portal</span>
              <span className="text-[10px] text-slate-400">BMSIT&M Internal</span>
            </div>
          </div>

          {/* User Profile Card */}
          {user ? (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                {isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                ) : isExecCouncil ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className="truncate">{user.fullName}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {isSuperAdmin && (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-purple-600 text-white">
                    SUPER ADMIN
                  </Badge>
                )}
                {isExecCouncil && (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-amber-600 text-white">
                    EXEC COUNCIL
                  </Badge>
                )}
                {!isSuperAdmin && !isExecCouncil && (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0">
                    {user.roles?.[0] || "MEMBER"}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-slate-300">
                  {user.departments?.[0] || "GENERAL"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Session Required</span>
              </div>
              <p className="text-[10px] text-slate-400">Please sign in to access internal portal features.</p>
              <Link
                href="/portal/login"
                onClick={() => { window.location.href = '/portal/login'; }}
                className="flex items-center justify-center w-full py-1.5 px-3 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
              >
                Sign In to GCC
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/portal/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </Button>
          ) : (
            <Link
              href="/portal/login"
              onClick={() => { window.location.href = '/portal/login'; }}
              className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              Member Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {authError && !user ? (
          <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 glass-panel border-amber-500/30 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Authentication Session Required</h3>
            <p className="text-xs text-slate-400">
              You are currently viewing the portal in guest mode. Please sign in with your GCC authorized credentials to view tasks, department desks, and system management.
            </p>
            <Link
              href="/portal/login"
              onClick={() => { window.location.href = '/portal/login'; }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}