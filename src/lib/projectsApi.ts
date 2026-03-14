import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/apiClient";

export interface Project {
  id: string;
  name: string;
  website_url: string | null;
  api_key: string;
  created_at: string;
  stats: {
    pageViews: number;
    visitors: number;
    live: number;
  };
}

export interface ProjectsListResponse {
  projects: Project[];
  setupRequired?: boolean;
  message?: string;
}

export function fetchProjects() {
  return apiGet<ProjectsListResponse>("/api/projects");
}

export function createProject(payload: { name: string; websiteUrl?: string }) {
  return apiPost<typeof payload, { project: Project }>("/api/projects", payload);
}

export function updateProject(projectId: string, payload: { name?: string; websiteUrl?: string }) {
  return apiPatch<typeof payload, { project: Project }>(`/api/projects/${projectId}`, payload);
}

export function deleteProject(projectId: string) {
  return apiDelete(`/api/projects/${projectId}`);
}
