"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Loader2,
  AlertCircle,
  X,
  Send,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPatch, ApiError } from "@/lib/api";
import type { Task, DepartmentId, TaskPriority, TaskStatus } from "@gcc-portal/contracts";

export default function TaskTrackerPage() {
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [canAssignTask, setCanAssignTask] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; roles: string[]; permissions: string[] } | null>(null);
  const [members, setMembers] = useState<{ id: string; fullName: string; email: string; departments: string[] }[]>([]);

  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [remarkInput, setRemarkInput] = useState<{ [key: string]: string }>({});
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Create Task Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    department: "EXECUTIVE_COUNCIL" as DepartmentId,
    assignedTo: "",
    deadline: "",
    priority: "MEDIUM" as TaskPriority,
  });

  useEffect(() => {
    apiGet<{ user: { id: string; roles: string[]; permissions: string[] } }>("/api/v1/auth/me")
      .then((d) => {
        const u = d.user;
        setCurrentUser(u);
        const allowed =
          u.permissions?.includes("TASK_ASSIGN_GLOBAL") ||
          u.permissions?.includes("TASK_ASSIGN_DEPARTMENT") ||
          u.roles?.includes("SYSTEM_SUPER_ADMIN") ||
          u.roles?.includes("EXECUTIVE_COUNCIL");
        setCanAssignTask(allowed);
      })
      .catch(() => {});

    apiGet<{ members: { id: string; fullName: string; email: string; departments: string[] }[] }>("/api/v1/members")
      .then((d) => {
        setMembers(d.members || []);
      })
      .catch(() => {});
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ tasks: Task[] }>("/api/v1/tasks");
      setTasksList(data.tasks || []);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Could not load tasks. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiGet<{ tasks: Task[] }>("/api/v1/tasks");
        if (active) {
          setTasksList(data.tasks || []);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.statusCode === 401) {
            setError("Session expired. Please log in again.");
          } else {
            setError("Could not load tasks. Please try again later.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const [now, setNow] = useState<number>(0);
  useEffect(() => {
    Promise.resolve().then(() => {
      setNow(Date.now());
    });
  }, []);

  const isOverdue = (deadlineStr: string, status: string) => {
    if (status === "COMPLETED") return false;
    if (now === 0) return false;
    return new Date(deadlineStr).getTime() < now;
  };

  const handleAddRemark = async (taskId: string) => {
    const remark = remarkInput[taskId]?.trim();
    if (!remark) return;
    setUpdatingTaskId(taskId);
    try {
      await apiPost(`/api/v1/tasks/${taskId}/remarks`, { remark });
      showToast("success", "Remark submitted successfully.");
      setRemarkInput((prev) => ({ ...prev, [taskId]: "" }));
      await loadTasks();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to add remark.";
      showToast("error", msg);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await apiPatch(`/api/v1/tasks/${taskId}`, { status: newStatus });
      showToast("success", `Task marked as ${newStatus}.`);
      await loadTasks();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update task status.";
      showToast("error", msg);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.assignedTo || !createForm.deadline) return;
    setCreating(true);
    try {
      await apiPost("/api/v1/tasks", {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        department: createForm.department,
        assignedTo: createForm.assignedTo.trim(),
        deadline: new Date(createForm.deadline).toISOString(),
        priority: createForm.priority,
      });
      showToast("success", "Task created and assigned.");
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        department: "EXECUTIVE_COUNCIL",
        assignedTo: "",
        deadline: "",
        priority: "MEDIUM",
      });
      await loadTasks();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create task.";
      showToast("error", msg);
    } finally {
      setCreating(false);
    }
  };

  const canModifyTaskStatus = (task: Task) => {
    if (!currentUser) return false;
    return (
      currentUser.roles.includes("SYSTEM_SUPER_ADMIN") ||
      currentUser.roles.includes("EXECUTIVE_COUNCIL") ||
      currentUser.id === task.assignedTo
    );
  };

  const canAddRemark = 
    !!(currentUser?.permissions?.includes("TASK_REMARK") ||
    currentUser?.roles?.includes("SYSTEM_SUPER_ADMIN") ||
    currentUser?.roles?.includes("EXECUTIVE_COUNCIL"));

  const filteredTasks =
    selectedDeptFilter === "ALL"
      ? tasksList
      : tasksList.filter((t) => t.department === selectedDeptFilter);

  const deptMembers = members;

  return (
    <div className="space-y-8">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-400" /> GCC Task & Status Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Role-based operational task management synchronized with GCC live adapters.
          </p>
        </div>

        {canAssignTask && (
          <Button variant="gradient" size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" /> Assign New Task
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Department:
        </span>
        {[
          "ALL",
          "EXECUTIVE_COUNCIL",
          "EVENTS_OPERATIONS",
          "TECHNICAL",
          "MARKETING",
          "DESIGN",
          "PHOTOGRAPHY",
        ].map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDeptFilter(dept)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedDeptFilter === dept ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {dept.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading active task assignments...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <Card className="glass-panel border-slate-800 p-12 text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Tasks Assigned</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {selectedDeptFilter === "ALL"
              ? "There are currently no tasks assigned across the council."
              : `No tasks currently assigned in ${selectedDeptFilter.replace("_", " ")}.`}
          </p>
        </Card>
      )}

      {/* Tasks List */}
      {!loading && !error && filteredTasks.length > 0 && (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const overdue = isOverdue(task.deadline, task.status);

            return (
              <Card
                key={task.taskId}
                className={`glass-panel border transition-all ${
                  overdue
                    ? "border-rose-500/60 bg-rose-950/20 shadow-lg shadow-rose-900/20"
                    : "border-slate-800"
                }`}
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-blue-400 font-bold">{task.taskId}</span>
                      <Badge variant={task.priority === "CRITICAL" ? "destructive" : "secondary"}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {task.department.replace("_", " ")}
                      </Badge>
                    </div>

                    {overdue ? (
                      <Badge variant="destructive" className="gap-1 px-3 py-1 text-xs">
                        <AlertTriangle className="w-4 h-4" /> OVERDUE
                      </Badge>
                    ) : task.status === "COMPLETED" ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                      </Badge>
                    ) : (
                      <Badge variant="warning">{task.status}</Badge>
                    )}
                  </div>

                  <CardTitle className="text-lg text-white">{task.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-300">{task.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300">
                    <div>
                      <span className="text-slate-400">Assigned To: </span>
                      <strong className="text-white">{task.assignedToName || task.assignedTo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Deadline: </span>
                      <strong className={overdue ? "text-rose-400" : "text-white"}>
                        {new Date(task.deadline).toLocaleDateString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Latest Progress: </span>
                      <span className="text-slate-200">{task.latestUpdate || "No status update yet"}</span>
                    </div>
                  </div>

                   {/* Actions: Mark completed / in progress */}
                  {canModifyTaskStatus(task) && (
                    <div className="flex items-center gap-2">
                      {task.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingTaskId === task.taskId}
                          onClick={() => handleUpdateStatus(task.taskId, "COMPLETED")}
                          className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-7"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Completed
                        </Button>
                      )}
                      {task.status === "NOT_STARTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingTaskId === task.taskId}
                          onClick={() => handleUpdateStatus(task.taskId, "IN_PROGRESS")}
                          className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-7"
                        >
                          <Clock className="w-3.5 h-3.5 mr-1" /> Mark In Progress
                        </Button>
                      )}
                    </div>
                  )}

                  {/* President Remark */}
                  {task.presidentRemark && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-1">
                      <span className="font-semibold text-xs flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Executive Remark:
                      </span>
                      <p className="text-xs italic">&ldquo;{task.presidentRemark}&rdquo;</p>
                    </div>
                  )}

                  {/* Add Remark Form */}
                  {canAddRemark && (
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <Input
                        placeholder="Add Executive Remark..."
                        value={remarkInput[task.taskId] || ""}
                        onChange={(e) => setRemarkInput({ ...remarkInput, [task.taskId]: e.target.value })}
                        className="text-xs h-9"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={updatingTaskId === task.taskId || !remarkInput[task.taskId]?.trim()}
                        onClick={() => handleAddRemark(task.taskId)}
                        className="text-xs shrink-0 gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Add Remark
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg glass-panel border-blue-500/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Assign New Task</CardTitle>
                <CardDescription className="text-xs">Create a new task assigned to a department member.</CardDescription>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Task Title *</label>
                  <Input
                    required
                    placeholder="e.g. Draft MoU Agreement"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Task details and deliverables..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Department *</label>
                    <select
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value as DepartmentId })}
                      className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="EXECUTIVE_COUNCIL">Executive Council</option>
                      <option value="EVENTS_OPERATIONS">Events & Operations</option>
                      <option value="TECHNICAL">Technical</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="DESIGN">Design</option>
                      <option value="PHOTOGRAPHY">Photography</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Priority</label>
                    <select
                      value={createForm.priority}
                      onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as TaskPriority })}
                      className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Assign To *</label>
                    <select
                      value={createForm.assignedTo}
                      onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Member</option>
                      {deptMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.email}) [{m.departments.map(d => d.replace("_", " ")).join(", ") || "GENERAL"}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Deadline *</label>
                    <Input
                      type="date"
                      required
                      value={createForm.deadline}
                      onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" disabled={creating} className="text-xs">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Assign Task
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}