import React from "react";

const HeatmapSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      {/* Controls skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-44 bg-gray-200 rounded-md" />
          <div className="h-3 w-64 bg-gray-100 rounded-md" />
          <div className="flex gap-1 mt-1">
            <div className="h-9 w-24 bg-gray-200 rounded-lg" />
            <div className="h-9 w-24 bg-gray-100 rounded-lg" />
            <div className="h-9 w-24 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-gray-100 rounded-lg" />
          <div className="h-9 w-32 bg-gray-100 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewer skeleton */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-8 bg-gray-100 flex items-center gap-2 px-3">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            </div>
            <div className="h-4 flex-1 bg-gray-200 rounded-md" />
          </div>
          <div className="h-[540px] bg-gray-50 flex flex-col gap-4 p-6">
            <div className="h-10 w-1/3 bg-gray-200 rounded" />
            <div className="h-6 w-2/3 bg-gray-100 rounded" />
            <div className="flex-1 bg-gray-100 rounded-xl" />
          </div>
        </div>

        {/* Side panels skeleton */}
        <div className="flex flex-col gap-6">
          {/* Insights skeleton */}
          <div className="rounded-2xl border border-gray-100 p-5">
            <div className="h-5 w-32 bg-gray-200 rounded-md mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="h-3.5 w-24 bg-gray-100 rounded-md" />
                </div>
                <div className="h-4 w-14 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>

          {/* Top elements skeleton */}
          <div className="rounded-2xl border border-gray-100 p-5">
            <div className="h-5 w-40 bg-gray-200 rounded-md mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="w-6 h-6 bg-gray-100 rounded-lg" />
                <div className="flex-1 h-3.5 bg-gray-100 rounded-md" />
                <div className="w-12 h-3 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapSkeleton;
