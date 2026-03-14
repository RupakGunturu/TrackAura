import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2, Globe, FolderKanban, PencilLine, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterBar } from "@/components/FilterBar";
import { toast } from "@/hooks/use-toast";
import { createProject, deleteProject, fetchProjects, updateProject } from "@/lib/projectsApi";
import { getStoredProjectIdList, setStoredProjectIds } from "@/lib/projectSelection";

type ProjectsQueryData = Awaited<ReturnType<typeof fetchProjects>>;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getStoredProjectIdList());
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (payload) => {
      queryClient.setQueryData<ProjectsQueryData>(["projects"], (prev) => {
        if (!prev) {
          return {
            projects: [
              {
                ...payload.project,
                stats: {
                  pageViews: 0,
                  visitors: 0,
                  live: 0,
                },
              },
            ],
          };
        }

        return {
          projects: [
            {
              ...payload.project,
              stats: {
                pageViews: 0,
                visitors: 0,
                live: 0,
              },
            },
            ...prev.projects,
          ],
        };
      });

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setName("");
      setWebsiteUrl("");
      setSelectedIds((prev) => {
        const next = [...new Set([...prev, payload.project.id])];
        setStoredProjectIds(next.join(","));
        return next;
      });
      toast({ title: "Project created", description: `${payload.project.name} is ready for tracking.` });
    },
    onError: (error) => {
      toast({
        title: "Project create failed",
        description: error instanceof Error ? error.message : "Unable to create project.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.setQueryData<ProjectsQueryData>(["projects"], (prev) => {
        if (!prev) return prev;
        return {
          projects: prev.projects.filter((project) => project.id !== projectId),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project deleted" });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete project.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, websiteUrl }: { id: string; name: string; websiteUrl: string }) =>
      updateProject(id, { name, websiteUrl }),
    onSuccess: (payload) => {
      queryClient.setQueryData<ProjectsQueryData>(["projects"], (prev) => {
        if (!prev) return prev;
        return {
          projects: prev.projects.map((project) => (project.id === payload.project.id ? { ...project, ...payload.project } : project)),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditingProjectId(null);
      toast({ title: "Project updated", description: `${payload.project.name} was updated.` });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save project changes.",
        variant: "destructive",
      });
    },
  });

  const projects = data?.projects ?? [];

  const activeSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const onCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast({ title: "Project name required", description: "Enter a name before creating a project." });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      websiteUrl: websiteUrl.trim() || undefined,
    });
  };

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const applySelection = () => {
    const normalized = setStoredProjectIds(selectedIds.join(","));
    toast({ title: "Projects switched", description: normalized || "No projects selected." });
  };

  const startEdit = (project: { id: string; name: string; website_url: string | null }) => {
    setEditingProjectId(project.id);
    setEditName(project.name);
    setEditWebsiteUrl(project.website_url ?? "");
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) {
      toast({ title: "Name required", description: "Project name cannot be empty." });
      return;
    }

    updateMutation.mutate({
      id,
      name: editName.trim(),
      websiteUrl: editWebsiteUrl.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <FilterBar
        title="Projects"
        subtitle="Create projects, copy API keys, and switch active projects used across all dashboards"
        onRefresh={async () => {
          await refetch();
        }}
      />

      <form onSubmit={onCreate} className="rounded-2xl border border-border bg-card shadow-card p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10"
          />
          <Input
            placeholder="https://yourwebsite.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="h-10"
          />
          <Button type="submit" className="h-10 gap-1.5" disabled={createMutation.isPending}>
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? "Creating..." : "New Project"}
          </Button>
        </div>
      </form>

      {data?.setupRequired && (
        <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4 text-sm">
          <div className="font-semibold text-warning">Database setup required</div>
          <div className="text-muted-foreground mt-1">
            {data.message ?? "Run supabase/schema.sql in your Supabase SQL editor, then restart backend."}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select one or more projects and click Apply to set active dashboard scope.
        </p>
        <Button variant="outline" onClick={applySelection}>Apply Selected Projects</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {isLoading && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading projects...</div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            <FolderKanban className="h-7 w-7 mx-auto mb-2 opacity-60" />
            No projects yet. Create your first project above.
          </div>
        )}

        {projects.map((project) => (
          <div key={project.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                {editingProjectId === project.id ? (
                  <div className="space-y-2 min-w-[240px]">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9" />
                    <Input value={editWebsiteUrl} onChange={(e) => setEditWebsiteUrl(e.target.value)} className="h-9" placeholder="https://yourwebsite.com" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-semibold tracking-tight">{project.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Globe className="h-3.5 w-3.5" />
                      {project.website_url ?? "No website URL"}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingProjectId === project.id ? (
                  <>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => saveEdit(project.id)}>
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProjectId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(project)}>
                    <PencilLine className="h-3.5 w-3.5" />
                  </Button>
                )}
                <label className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={activeSet.has(project.id)}
                    onChange={() => toggleProject(project.id)}
                    className="h-4 w-4 rounded"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-input bg-background px-3 py-2 text-xs flex items-center justify-between gap-3">
              <span className="font-mono truncate">{project.api_key}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  navigator.clipboard.writeText(project.api_key);
                  toast({ title: "API key copied" });
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">Page Views</div>
                <div className="text-xl font-bold mt-1">{project.stats.pageViews.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">Visitors</div>
                <div className="text-xl font-bold mt-1">{project.stats.visitors.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">Live</div>
                <div className="text-xl font-bold mt-1 text-primary">{project.stats.live.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStoredProjectIds(project.id);
                  navigate("/dashboard/realtime");
                }}
              >
                View Analytics
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(`<script src=\"https://YOUR_DOMAIN/sdk.js\" data-api-key=\"${project.api_key}\"></script>`);
                  toast({ title: "Integration snippet copied" });
                }}
              >
                Integration
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-destructive"
                onClick={() => deleteMutation.mutate(project.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
