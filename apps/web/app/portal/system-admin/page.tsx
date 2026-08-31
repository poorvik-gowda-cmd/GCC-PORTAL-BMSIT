"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Search,
  UserPlus,
  Building,
  Key,
  Ban,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertCircle,
  Loader2,
  X,
  Lock,
  LogOut,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { UserProfile, RoleId, DepartmentId, AccountStatus } from "@gcc-portal/contracts";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  accountStatus: AccountStatus;
  roles: RoleId[];
  departments: DepartmentId[];
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number | null;
}

interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  description: string;
  memberCount: number;
}

interface RoleInfo {
  id: RoleId;
  name: string;
  memberCount: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string | null;
  userEmail: string | null;
  userFullName: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
}

export default function SystemAdminPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // UI / Tab state
  const [activeTab, setActiveTab] = useState<"users" | "departments" | "audit">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for Add Member
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDept, setNewDept] = useState<string>("EXECUTIVE_COUNCIL");
  const [newRole, setNewRole] = useState<string>("DEPARTMENT_MEMBER");

  // Form states for Manage Selected User
  const [editDept, setEditDept] = useState<string>("");
  const [editRoles, setEditRoles] = useState<string[]>([]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // 1. Verify Super Admin Authorization
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiGet<{ user: UserProfile }>("/api/v1/auth/me");
        if (active) {
          const hasSuperAdminRole = res.user.roles.includes("SYSTEM_SUPER_ADMIN" as RoleId);
          setIsSuperAdmin(hasSuperAdminRole);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.statusCode === 401) {
            router.replace("/portal/login");
            return;
          }
          setIsSuperAdmin(false);
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  // 2. Fetch Super Admin Data
  const loadAdminData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [usersRes, deptsRes, rolesRes, logsRes] = await Promise.all([
        apiGet<{ users: AdminUser[] }>("/api/v1/admin/users"),
        apiGet<{ departments: DepartmentInfo[] }>("/api/v1/admin/departments"),
        apiGet<{ roles: RoleInfo[] }>("/api/v1/admin/roles"),
        apiGet<{ logs: AuditLogEntry[] }>("/api/v1/admin/audit-logs"),
      ]);
      setUsers(usersRes.users);
      setDepartments(deptsRes.departments);
      setRoles(rolesRes.roles);
      setAuditLogs(logsRes.logs);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load administrative data.";
      showToast("error", msg);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      let active = true;
      (async () => {
        try {
          const [usersRes, deptsRes, rolesRes, logsRes] = await Promise.all([
            apiGet<{ users: AdminUser[] }>("/api/v1/admin/users"),
            apiGet<{ departments: DepartmentInfo[] }>("/api/v1/admin/departments"),
            apiGet<{ roles: RoleInfo[] }>("/api/v1/admin/roles"),
            apiGet<{ logs: AuditLogEntry[] }>("/api/v1/admin/audit-logs"),
          ]);
          if (active) {
            setUsers(usersRes.users);
            setDepartments(deptsRes.departments);
            setRoles(rolesRes.roles);
            setAuditLogs(logsRes.logs);
          }
        } catch {
          // ignore
        }
      })();
      return () => {
        active = false;
      };
    }
  }, [isSuperAdmin]);

  // Open Edit User Drawer
  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditDept(user.departments[0] || "");
    setEditRoles(user.roles);
  };

  // Add Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFullName) return;
    setActionLoading(true);
    try {
      await apiPost("/api/v1/admin/users", {
        email: newEmail.trim(),
        fullName: newFullName.trim(),
        password: newPassword.trim() || undefined,
        departmentId: newDept || undefined,
        roleId: newRole || undefined,
        accountStatus: "ACTIVE",
      });
      showToast("success", `Member ${newEmail} created and onboarded.`);
      setShowAddModal(false);
      setNewEmail("");
      setNewFullName("");
      setNewPassword("");
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create member.";
      showToast("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Department
  const handleUpdateDepartment = async () => {
    if (!selectedUser || !editDept) return;
    setActionLoading(true);
    try {
      await apiPost(`/api/v1/admin/users/${selectedUser.id}/department`, {
        departmentId: editDept,
      });
      showToast("success", `Department updated for ${selectedUser.email}.`);
      await loadAdminData();
      setSelectedUser((prev) => (prev ? { ...prev, departments: [editDept as DepartmentId] } : null));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update department.";
      showToast("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Roles
  const handleUpdateRoles = async () => {
    if (!selectedUser || editRoles.length === 0) return;
    setActionLoading(true);
    try {
      await apiPost(`/api/v1/admin/users/${selectedUser.id}/roles`, {
        roles: editRoles,
      });
      showToast("success", `Roles updated for ${selectedUser.email}.`);
      await loadAdminData();
      setSelectedUser((prev) => (prev ? { ...prev, roles: editRoles as RoleId[] } : null));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update roles.";
      showToast("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Change Account Status
  const handleUpdateStatus = async (status: AccountStatus) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await apiPost(`/api/v1/admin/users/${selectedUser.id}/status`, { status });
      showToast("success", `Account status changed to ${status}.`);
      await loadAdminData();
      setSelectedUser((prev) => (prev ? { ...prev, accountStatus: status } : null));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update account status.";
      showToast("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke Sessions
  const handleRevokeSessions = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await apiPost(`/api/v1/admin/users/${selectedUser.id}/revoke-sessions`, {});
      showToast("success", `All active sessions revoked for ${selectedUser.email}.`);
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to revoke sessions.";
      showToast("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      !searchQuery ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || u.accountStatus === statusFilter;
    const matchesDept = deptFilter === "ALL" || u.departments.includes(deptFilter as DepartmentId);
    return matchesQuery && matchesStatus && matchesDept;
  });

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-400">Verifying administrative authorization...</p>
      </div>
    );
  }

  // Strictly Block Normal Users
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-panel border-red-500/40 shadow-2xl text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">403 Access Denied</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This interface is restricted strictly to <strong>SYSTEM_SUPER_ADMIN</strong> accounts. Your current profile does not have administrative clearance. This attempt has been recorded in the security audit log.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.replace("/portal/dashboard")} className="w-full text-xs">
            Return to Portal Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-medium ${
            toast.type === "success"
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
              : "bg-red-500/20 border border-red-500/40 text-red-300"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-red-500/20 text-red-400 border border-red-500/30">
              <Lock className="w-3 h-3 mr-1" /> SYSTEM SUPER ADMIN DESK
            </Badge>
            <span className="text-[10px] text-slate-500 font-mono">CONFIDENTIAL</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-2 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-400" /> Platform Administration & Member Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage GCC portal users, assign departments, configure RBAC roles, and inspect security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadAdminData} disabled={loadingData} className="gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500">
            <UserPlus className="w-4 h-4" /> Onboard Member
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "users" ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" /> Member Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "departments" ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Building className="w-4 h-4" /> Department Desks ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "audit" ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" /> Audit Trails ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY & MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="ALL">All Account Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REVOKED">REVOKED</option>
                <option value="PENDING_PASSWORD_SETUP">PENDING SETUP</option>
              </select>
            </div>
            <div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Members Table */}
          <Card className="glass-panel border-slate-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Member / Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Assigned Role(s)</th>
                      <th className="px-4 py-3">Created / Last Login</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                          {loadingData ? "Loading directory..." : "No members found matching the filters."}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{u.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                u.accountStatus === "ACTIVE"
                                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                  : u.accountStatus === "SUSPENDED"
                                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                                  : u.accountStatus === "REVOKED"
                                  ? "border-red-500/40 text-red-400 bg-red-500/10"
                                  : "border-slate-500/40 text-slate-400"
                              }`}
                            >
                              {u.accountStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {u.departments.length > 0 ? (
                              <Badge variant="default" className="text-[10px]">
                                {u.departments[0].replace("_", " ")}
                              </Badge>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {u.roles.map((r) => (
                                <Badge
                                  key={r}
                                  variant="outline"
                                  className={`text-[9px] ${
                                    r === "SYSTEM_SUPER_ADMIN"
                                      ? "border-red-500/50 text-red-400 bg-red-500/10"
                                      : r === "EXECUTIVE_COUNCIL"
                                      ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                                      : "border-blue-500/40 text-blue-400"
                                  }`}
                                >
                                  {r.replace("_", " ")}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-400">
                            <div>{new Date(u.createdAt * 1000).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-500">
                              {u.lastLoginAt ? `Login: ${new Date(u.lastLoginAt * 1000).toLocaleDateString()}` : "Never logged in"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="outline" size="sm" onClick={() => handleSelectUser(u)} className="text-xs h-7 px-2.5">
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS OVERVIEW */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Link key={dept.id} href={`/portal/departments/${dept.id}`} className="block group">
              <Card className="glass-panel border-slate-800 hover:border-blue-500/40 transition-colors cursor-pointer">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">{dept.id}</Badge>
                    <span className="text-xs text-blue-400 font-medium font-mono">{dept.memberCount} Members</span>
                  </div>
                  <CardTitle className="text-lg text-white mt-1 group-hover:text-blue-300 transition-colors">{dept.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-400">{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 flex justify-between items-center">
                    <span>Assigned Members</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{dept.memberCount}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "audit" && (
        <Card className="glass-panel border-slate-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white">Administrative Security Audit Trail</CardTitle>
              <CardDescription className="text-xs">Immutable record of logins, administrative mutations, and permission decisions.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadAdminData} className="text-xs gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target / Actor Email</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No audit events recorded.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp * 1000).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              log.action.includes("FAILURE") || log.action.includes("DENIED")
                                ? "border-red-500/50 text-red-400"
                                : log.action.includes("CHANGED") || log.action.includes("ADMIN")
                                ? "border-amber-500/50 text-amber-400"
                                : "border-emerald-500/50 text-emerald-400"
                            }`}
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-white">{log.userEmail || "SYSTEM / ANONYMOUS"}</td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{log.ipAddress || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL: ONBOARD MEMBER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg glass-panel border-red-500/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Onboard GCC Member</CardTitle>
                <CardDescription className="text-xs">Create a portal member account with departmental affiliation.</CardDescription>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Email Address *</label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. member@bmsit.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Full Name *</label>
                  <Input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Initial Password (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Defaults to GccPortal@2026! if omitted"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500">The user can change this password upon login or reset.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Primary Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" disabled={actionLoading} className="text-xs bg-gradient-to-r from-red-600 to-rose-600">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                    Save Member
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: MANAGE SELECTED USER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-xl glass-panel border-red-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <CardTitle className="text-white text-lg">{selectedUser.fullName}</CardTitle>
                <CardDescription className="text-xs font-mono text-slate-400">{selectedUser.email}</CardDescription>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Section 1: Department Assignment */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-400" /> Department Assignment
                </h4>
                <p className="text-[11px] text-slate-400">Assign this user to a specific operational department.</p>
                <div className="flex gap-2 pt-2">
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.id})
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleUpdateDepartment} disabled={actionLoading || !editDept} className="text-xs">
                    Save Department
                  </Button>
                </div>
              </div>

              {/* Section 2: Role Assignment */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-400" /> Role Assignments
                </h4>
                <p className="text-[11px] text-slate-400">Select one or more RBAC roles for this member.</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {roles.map((r) => {
                    const isChecked = editRoles.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked ? "bg-purple-500/10 border-purple-500/40 text-purple-200" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditRoles([...editRoles, r.id]);
                            } else {
                              setEditRoles(editRoles.filter((x) => x !== r.id));
                            }
                          }}
                          className="rounded border-slate-700 text-purple-500 focus:ring-purple-500"
                        />
                        <span>{r.name}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="pt-2 flex justify-end">
                  <Button size="sm" onClick={handleUpdateRoles} disabled={actionLoading || editRoles.length === 0} className="text-xs">
                    Save Roles
                  </Button>
                </div>
              </div>

              {/* Section 3: Account Status & Session Management */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-red-400" /> Account Status & Security
                </h4>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-300">
                    Current Status: <span className="font-bold text-white">{selectedUser.accountStatus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus("ACTIVE")}
                      disabled={actionLoading || selectedUser.accountStatus === "ACTIVE"}
                      className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Set Active
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus("SUSPENDED")}
                      disabled={actionLoading || selectedUser.accountStatus === "SUSPENDED"}
                      className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      Suspend
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus("REVOKED")}
                      disabled={actionLoading || selectedUser.accountStatus === "REVOKED"}
                      className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">Emergency Security Control:</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRevokeSessions}
                    disabled={actionLoading}
                    className="text-xs text-red-400 border-red-500/40 hover:bg-red-500/10 gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Revoke All Active Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
