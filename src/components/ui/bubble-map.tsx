"use client";

interface BubbleMapProps {
  data: { city: string; country: string; revenue: number; spend: number }[];
  valueKey: "revenue" | "spend";
  sizeMultiplier?: number;
  color?: string;
}

export function BubbleMap({
  data,
  valueKey,
  sizeMultiplier = 0.00005,
  color = "#EF4444",
}: BubbleMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <div className="text-gray-400 text-center">No regional data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item[valueKey]));

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex flex-wrap justify-center items-center gap-6 p-6">
        {data.map((region, index) => {
          const normalizedValue = region[valueKey] / maxValue;
          const size = Math.max(40, normalizedValue * 120);

          return (
            <div
              key={index}
              className="flex flex-col items-center"
              title={`${region.city}, ${region.country}: ${valueKey} $${region[
                valueKey
              ].toLocaleString()}`}
            >
              <div
  className="rounded-full flex items-center justify-center text-white font-semibold transition-transform duration-300 hover:scale-110"
  style={{
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    opacity: 0.8,
    fontSize: `${Math.max(10, Math.min(18, size / 6))}px`,
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  }}
>
  {(region.city || region.country || "").substring(0, 3).toUpperCase()}
</div>

              <span className="mt-2 text-xs text-gray-300">
                ${region[valueKey].toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-400 mt-4">
        Circle size represents {valueKey}
      </div>
    </div>
  );
}
