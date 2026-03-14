import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2, Globe, FolderKanban, PencilLine, Save, X, Download } from "lucide-react";
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
  const [installProjectId, setInstallProjectId] = useState("");

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

  useEffect(() => {
    if (!installProjectId && projects.length > 0) {
      setInstallProjectId(projects[0].id);
    }
  }, [installProjectId, projects]);

  const activeSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedInstallProject = useMemo(() => {
    return projects.find((project) => project.id === installProjectId) ?? projects[0];
  }, [projects, installProjectId]);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const copyText = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: message });
  };

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
    <div className="space-y-8">
      <FilterBar
        title="Projects"
        subtitle="Manage projects, API keys, and control which projects power your analytics dashboards"
        onRefresh={async () => {
          await refetch();
        }}
      />

      {/* Create Project Form - Premium Card */}
      <form onSubmit={onCreate} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Create New Project</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr_auto]">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Project Name *</label>
            <Input
              placeholder="e.g., My Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Website URL</label>
            <Input
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" className="h-10 gap-2 mt-5 bg-green-600 hover:bg-green-700 text-white" disabled={createMutation.isPending}>
            <Plus className="h-4 w-4" />
            <span>{createMutation.isPending ? "Creating..." : "Create"}</span>
          </Button>
        </div>
      </form>

      {/* Setup Warning - Premium Style */}
      {data?.setupRequired && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Database Setup Required</h3>
              <p className="text-sm text-amber-800 mt-1">
                {data.message ?? "Run supabase/schema.sql in your Supabase SQL editor, then restart your backend server."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Install Tracker */}
      {!isLoading && projects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Quick Install Tracker</h2>
              <p className="text-xs text-gray-600 mt-1">Install quickly via npm link, then initialize with a selected project.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">Project</label>
              <select
                value={selectedInstallProject?.id ?? ""}
                onChange={(event) => setInstallProjectId(event.target.value)}
                className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-900"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-800 mb-2">Step 1: from TrackAura repo</div>
              <code className="block text-[11px] text-gray-700 whitespace-pre-wrap">npm run tracker:link:global</code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 h-7 text-xs"
                onClick={() => copyText("npm run tracker:link:global", "Step 1 command copied")}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-800 mb-2">Step 2: from your other app</div>
              <code className="block text-[11px] text-gray-700 whitespace-pre-wrap">npm link /absolute/path/to/TrackAura/packages/trackaura-tracker</code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 h-7 text-xs"
                onClick={() => copyText("npm link /absolute/path/to/TrackAura/packages/trackaura-tracker", "Step 2 command copied")}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="text-xs font-semibold text-green-900 mb-2">Init command (project ready)</div>
            <code className="block text-[11px] text-green-900 whitespace-pre-wrap">{`import { initTrackAuraTracker } from "@trackaura/tracker";\ninitTrackAuraTracker({ apiBaseUrl: "${apiBaseUrl}", projectId: "${selectedInstallProject?.id ?? ""}" });`}</code>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                onClick={() =>
                  copyText(
                    `import { initTrackAuraTracker } from "@trackaura/tracker";\ninitTrackAuraTracker({ apiBaseUrl: "${apiBaseUrl}", projectId: "${selectedInstallProject?.id ?? ""}" });`,
                    "Init command copied"
                  )
                }
              >
                <Download className="h-3.5 w-3.5 mr-1" /> Copy Init
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => copyText(selectedInstallProject?.id ?? "", "Project ID copied")}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy Project ID
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Table - Premium Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Active Projects</h2>
            <p className="text-sm text-gray-600 mt-0.5">Select projects to activate them across your dashboards</p>
          </div>
          {!isLoading && projects.length > 0 && (
            <Button variant="outline" onClick={applySelection} className="border-gray-300">
              Apply Changes
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-gray-500 text-sm">Loading projects...</div>
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 p-12 text-center">
            <FolderKanban className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium">No projects yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first project above to get started</p>
          </div>
        )}

        {!isLoading && projects.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="col-span-1">Select</div>
              <div className="col-span-3">Project Name</div>
              <div className="col-span-4">Website</div>
              <div className="col-span-2">Stats</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div key={project.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                  {/* Checkbox */}
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={activeSet.has(project.id)}
                      onChange={() => toggleProject(project.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Project Name & URL */}
                  <div className="col-span-3">
                    {editingProjectId === project.id ? (
                      <div className="space-y-2">
                        <Input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          className="h-8 text-sm border-gray-200"
                          autoFocus
                        />
                        <Input 
                          value={editWebsiteUrl} 
                          onChange={(e) => setEditWebsiteUrl(e.target.value)} 
                          className="h-8 text-sm border-gray-200"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{project.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Globe className="h-3 w-3" />
                          {project.website_url ? (
                            <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {project.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          ) : (
                            <span className="text-gray-400">No website URL</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* API Key */}
                  <div className="col-span-4">
                    <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-2 group">
                      <span className="font-mono text-xs text-gray-600 truncate">{project.api_key.substring(0, 20)}...</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(project.api_key);
                          toast({ title: "API key copied to clipboard" });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="col-span-2">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-semibold text-gray-900">{project.stats.pageViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-semibold text-gray-900">{project.stats.visitors.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {editingProjectId === project.id ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                          onClick={() => saveEdit(project.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600"
                          onClick={() => setEditingProjectId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600 hover:bg-gray-200"
                          onClick={() => startEdit(project)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => deleteMutation.mutate(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

