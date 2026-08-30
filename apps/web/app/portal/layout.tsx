"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CheckSquare, Calendar, FolderGit2, QrCode, LogOut, User, Loader2, AlertCircle } from "lucide-react";
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

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ user: UserProfile }>("/api/v1/auth/me");
        if (!cancelled) setUser(data.user);
      } catch (err) {
        if (!cancelled && err instanceof ApiError && err.statusCode === 401) {
          router.replace("/portal/login");
          return;
        }
        // Network error — still render with null user, don't hard-redirect
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    try {
      // POST /logout is CSRF-exempt per backend EXEMPT_PATHS list
      await apiPost("/api/v1/auth/logout");
    } catch {
      // Even if logout API fails, redirect to clear frontend state
    }
    router.replace("/portal/login");
  };

  const isLeadership = user?.roles.some((r) => r === "SYSTEM_SUPER_ADMIN" || r === "EXECUTIVE_COUNCIL");
  const deptHref = isLeadership
    ? "/portal/departments"
    : user?.departments?.[0]
    ? `/portal/departments/${user.departments[0]}`
    : "/portal/departments";

  const navItems = [
    { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/tasks", label: "Task Tracker", icon: CheckSquare },
    { href: "/portal/events", label: "Event Desk", icon: Calendar },
    { href: deptHref, label: "Department Desks", icon: FolderGit2 },
    { href: "/portal/qr", label: "QR Manager", icon: QrCode },
  ];

  if (user?.roles.includes("SYSTEM_SUPER_ADMIN")) {
    navItems.push({ href: "/portal/system-admin", label: "System Admin", icon: User });
  }

  // Show spinner while session check is in-flight (avoids flash of unauthenticated content)
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-xs text-slate-400">Verifying session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-900/60 p-5 space-y-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              GCC
            </div>
            <div>
              <span className="font-bold text-white text-sm block">Member Portal</span>
              <span className="text-[10px] text-slate-400">BMSIT&M Internal</span>
            </div>
          </div>

          {user ? (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                {user.fullName}
              </div>
              <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="default" className="text-[9px] px-1.5 py-0">
                  {user.roles?.[0] || "MEMBER"}
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {user.departments?.[0] || "GENERAL"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Session error
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === item.href ? "bg-blue-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 text-blue-400" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link href="/" className="block text-[11px] text-slate-400 hover:text-white text-center">
            ← Back to Public Website
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center text-xs gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}