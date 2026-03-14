import React, { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

interface WebpagePreviewProps {
  previewUrl?: string | null;
  previewTitle?: string;
}

function normalizePreviewUrl(raw?: string | null) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

const WebpagePreview: React.FC<WebpagePreviewProps> = ({ previewUrl, previewTitle }) => {
  const [loaded, setLoaded] = useState(false);
  const normalizedUrl = useMemo(() => normalizePreviewUrl(previewUrl), [previewUrl]);

  if (!normalizedUrl) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center px-8">
          <h3 className="text-base font-semibold text-gray-900">No website preview available</h3>
          <p className="text-sm text-gray-600 mt-2">
            Add your website URL on the Projects page to preview your real interface under the heatmap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
      {!loaded && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-gray-50">
          <div className="text-center px-8">
            <h3 className="text-sm font-semibold text-gray-900">Loading {previewTitle || "project"} preview...</h3>
            <p className="text-xs text-gray-600 mt-2">
              If the website blocks embedding (X-Frame-Options), open it in a new tab.
            </p>
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Open website
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      <iframe
        title={`${previewTitle || "project"} preview`}
        src={normalizedUrl}
        className="w-full h-full border-0"
        onLoad={() => setLoaded(true)}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default WebpagePreview;
