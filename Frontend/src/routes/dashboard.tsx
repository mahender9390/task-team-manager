import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import {
  Clock, AlertTriangle, Plus, LogOut, FolderKanban, ListTodo, X, Loader2, Pencil, Trash2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Tasklane" }] }),
});

type Status = "Todo" | "In Progress" | "Done";
interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: Status;
  dueDate?: string;
  projectId?: string | number;
  assignedTo?: { id?: string | number; name: string } | null;
  assignee?: { id: string | number; name: string } | null;
}
interface Project { id: string | number; name: string; description?: string }
interface Member { id: string | number; name: string; email?: string }

const STATUSES: Status[] = ["Todo", "In Progress", "Done"];

function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState<string | number | null>(null);

  const getStatusStyles = (status: Status) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Todo":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [t, p] = await Promise.all([api.get("/tasks"), api.get("/projects")]);
      setTasks(t.data?.tasks ?? t.data ?? []);
      setProjects(p.data?.projects ?? p.data ?? []);
      if (user?.role === "Admin") {
        try {
          const u = await api.get("/auth/users");
          setMembers(u.data?.users ?? u.data ?? []);
        } catch { }
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) refresh(); }, [user]);

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status !== "Done").length,
      overdue: tasks.filter((t) => t.dueDate && t.status !== "Done" && new Date(t.dueDate).getTime() < now).length,
    };
  }, [tasks]);

  const updateStatus = async (task: Task, newStatus: Status) => {
    // 1. Optimistic Update: Change the UI immediately
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      // 2. Call the API (Check if your backend expects PUT or PATCH)
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      // If successful, refresh to get updated data from DB
      refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
      // 3. Rollback if the API fails
      setTasks(previousTasks);
      alert("Could not update status. Check if the server is running.");
    }
  };

  const deleteTask = async (task: Task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    setDeletingId(task.id);
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== task.id));
    try { await api.delete(`/tasks/${task.id}`); }
    catch { setTasks(prev); }
    finally { setDeletingId(null); }
  };

  const deleteProject = async (project: Project) => {
    if (!confirm(`Are you sure? Deleting "${project.name}" will also delete all associated tasks.`)) return;

    setIsDeletingProject(project.id);
    const previousProjects = projects;

    // Optimistic UI update: remove it from view immediately
    setProjects((prev) => prev.filter((p) => p.id !== project.id));

    try {
      await api.delete(`/projects/${project.id}`);
      refresh(); // Refresh to ensure stats and tasks stay synced
    } catch (e) {
      alert("Failed to delete project. Please try again.");
      setProjects(previousProjects); // Roll back if the API fails
    } finally {
      setIsDeletingProject(null);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground leading-tight">{user.role}</div>
            </div>
            <button onClick={() => { logout(); navigate({ to: "/login" }); }}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {user.role === "Admin" ? "Workspace overview" : "My tasks"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.role === "Admin" ? "Manage projects, assign work, and track delivery." : "Stay focused on what's assigned to you."}
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<ListTodo className="h-4 w-4" />} label="Total tasks" value={stats.total} tone="default" />
          <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={stats.pending} tone="primary" />
          <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Overdue" value={stats.overdue} tone="destructive" />
        </section>

        {user.role === "Admin" && (
          <section className="flex flex-wrap gap-2">
            <button onClick={() => setShowProjectModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Create project
            </button>
            <button onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
              <Plus className="h-4 w-4" /> New task
            </button>
          </section>
        )}

        {user.role === "Admin" && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FolderKanban className="h-4 w-4" /> Projects
            </h2>
            {projects.length === 0 ? (
              <EmptyCard text="No projects yet. Create one to get started." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <div key={p.id} className="group relative rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
                    <div className="font-medium text-foreground pr-16">{p.name}</div>
                    {p.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                    {/* Admin-only Action Buttons */}
                    {user.role === "Admin" && (
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingProject(p)}
                          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          title="Edit Project"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProject(p)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete Project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ListTodo className="h-4 w-4" /> Tasks
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : err ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {err}
              <div className="mt-1 text-xs text-muted-foreground">Make sure your API base URL is set and the backend is reachable.</div>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyCard text="No tasks yet." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Task</th>
                    <th className="px-4 py-2.5 font-medium">Assignee</th>
                    <th className="px-4 py-2.5 font-medium">Due</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    {user.role === "Admin" && <th className="px-4 py-2.5 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const overdue = t.dueDate && t.status !== "Done" && new Date(t.dueDate).getTime() < Date.now();
                    const canEdit = user.role === "Admin" || (t.assignee && String(t.assignee.id) === String(user.id));
                    return (
                      <tr key={t.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{t.title}</div>
                          {t.description && <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{t.assignee?.name ?? t.assignedTo?.name ?? "—"}</td>
                        <td className={`px-4 py-3 ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {canEdit ? (
                            <select
                              value={t.status}
                              onChange={(e) => updateStatus(t, e.target.value as Status)}
                              className={`rounded-md border px-2 py-1 text-xs font-bold transition-colors duration-200 cursor-pointer ${getStatusStyles(t.status)}`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s} className="bg-white text-foreground font-normal">
                                  {s}
                                </option>
                              ))}
                            </select>
                          ) : <StatusPill status={t.status} />}
                        </td>
                        {user.role === "Admin" && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setEditingTask(t)}
                                className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent">
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                              <button onClick={() => deleteTask(t)} disabled={deletingId === t.id}
                                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60">
                                <Trash2 className="h-3 w-3" /> {deletingId === t.id ? "…" : "Delete"}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {showProjectModal && (
        <ProjectModal onClose={() => setShowProjectModal(false)} onCreated={refresh} />
      )}
      {showTaskModal && (
        <TaskModal projects={projects} members={members} onClose={() => setShowTaskModal(false)} onCreated={refresh} />
      )}
      {editingTask && (
        <TaskModal
          projects={projects}
          members={members}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onCreated={refresh}
        />
      )}
      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onCreated={refresh}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "default" | "primary" | "destructive" }) {
  const toneCls = tone === "primary" ? "text-primary" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wide">
        <span>{label}</span><span className={toneCls}>{icon}</span>
      </div>
      <div className={`mt-2 text-3xl font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const cls = status === "Done" ? "bg-primary/10 text-primary" : status === "In Progress" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}

function EmptyCard({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">{text}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, onCreated }: { project?: Project; onClose: () => void; onCreated: () => void }) {
  const isEdit = !!project;
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      if (isEdit) {
        await api.put(`/projects/${project.id}`, { name, description });
      } else {
        await api.post("/projects", { name, description });
      }
      onCreated(); onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit project" : "Create project"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input required placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={loading} className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </button>
      </form>
    </Modal>
  );
}

function TaskModal({ projects, members, task, onClose, onCreated }: { projects: Project[]; members: Member[]; task?: Task; onClose: () => void; onCreated: () => void }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState<string>(
    task?.projectId != null ? String(task.projectId) : projects[0] ? String(projects[0].id) : "",
  );
  const [assignedTo, setAssignedTo] = useState<string>(task?.assignedTo?.id != null ? String(task.assignedTo.id) : "");
  const [status, setStatus] = useState<Status>(task?.status ?? "Todo");
  const [dueDate, setDueDate] = useState(task?.dueDate ? String(task.dueDate).slice(0, 10) : "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      const payload = {
        title, description, projectId, assignedTo: assignedTo || null,
        dueDate: dueDate || null, status,
      };
      if (isEdit) await api.put(`/tasks/${task!.id}`, payload);
      else await api.post("/tasks", payload);
      onCreated(); onClose();
    } catch (e: any) { setErr(e?.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };
  return (
    <Modal title={isEdit ? "Edit task" : "New task"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input required placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2} />
        <div className="grid grid-cols-2 gap-2">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Project…</option>
            {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Assign to…</option>
            {members.map((m) => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
          </select>
        </div>
        {isEdit && (
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={loading} className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create task"}
        </button>
      </form>
    </Modal>
  );
}