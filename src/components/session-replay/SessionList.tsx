import { Clock, Monitor, Play, Smartphone, Tablet } from "lucide-react";
import type { SessionListItem } from "@/lib/sessionReplayApi";
import { Button } from "@/components/ui/button";

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}m ${s}s`;
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile") return <Smartphone className="h-4 w-4 text-gray-500" />;
  if (device === "tablet") return <Tablet className="h-4 w-4 text-gray-500" />;
  return <Monitor className="h-4 w-4 text-gray-500" />;
}

export function SessionList({
  sessions,
  selectedSessionId,
  onReplay,
}: {
  sessions: SessionListItem[];
  selectedSessionId: string | null;
  onReplay: (session: SessionListItem) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Recorded Sessions</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-600">
              <th className="text-left px-5 py-3">Session ID</th>
              <th className="text-left px-5 py-3">Page</th>
              <th className="text-left px-5 py-3">Duration</th>
              <th className="text-left px-5 py-3">Events</th>
              <th className="text-left px-5 py-3">Device</th>
              <th className="text-right px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const selected = selectedSessionId === session.sessionId;
              return (
                <tr key={session.sessionId} className={`border-b border-gray-100 hover:bg-gray-50 ${selected ? "bg-green-50/60" : ""}`}>
                  <td className="px-5 py-3 font-mono text-xs text-gray-800">{session.sessionId.slice(0, 18)}...</td>
                  <td className="px-5 py-3 text-gray-700">{session.page}</td>
                  <td className="px-5 py-3 text-gray-700">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDuration(session.durationSec)}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{session.eventCount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-700"><span className="inline-flex items-center gap-1"><DeviceIcon device={session.deviceType} /> {session.deviceType}</span></td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => onReplay(session)}>
                      <Play className="h-3.5 w-3.5 mr-1" /> Replay
                    </Button>
                  </td>
                </tr>
              );
            })}

            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-600">
                  No sessions found yet. Integrate tracker and interact with your website.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
