import { Link } from "react-router-dom";
import { Lock, FolderKanban } from "lucide-react";

export function ProjectLockedState({ hasProjects = false }: { hasProjects?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Lock className="h-6 w-6 text-amber-700" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Analytics Locked</h2>
        <p className="mt-2 text-sm text-gray-600">
          {hasProjects
            ? "Project created, but no tracking data received yet. Integrate tracker in your website to unlock analytics."
            : "Create your first project to unlock analytics pages."}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/dashboard/projects"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <FolderKanban className="h-4 w-4" />
            {hasProjects ? "Open Project Integration" : "Create Project"}
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-left">
          <h3 className="text-sm font-semibold text-gray-900">How to unlock</h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-700">
            <li>Create/select a project in Projects page.</li>
            <li>Use Quick Install Tracker and copy init command.</li>
            <li>Integrate tracker in your other project.</li>
            <li>Generate interactions (click/scroll/input/navigation).</li>
            <li>Return and refresh dashboards.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
