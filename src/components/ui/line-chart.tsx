"use client";
import React from 'react';

interface LineChartProps {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (value: number) => string;
}

export function LineChart({ title, data, color = '#3B82F6', formatValue = (value) => value.toString() }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow h-full flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  const values = data.map(item => item.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = maxValue - minValue;

  const svgWidth = 600;
  const svgHeight = 250;
  const padding = 40;

  // Function to get SVG coordinates
  const getSvgPoint = (item: { value: number }, index: number) => {
    const x = (index / (data.length - 1)) * (svgWidth - 2 * padding) + padding;
    const y = svgHeight - padding - (valueRange > 0 ? ((item.value - minValue) / valueRange) * (svgHeight - 2 * padding) : (svgHeight - 2 * padding) / 2);
    return { x, y };
  };

  const linePath = data.map((item, index) => {
    const { x, y } = getSvgPoint(item, index);
    return `${x},${y}`;
  }).join(' ');

  // Format date labels
  const weekLabelFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative" style={{ height: '280px', width: '100%' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
          {/* Grid lines */}
          <g stroke="#4A5568" strokeDasharray="4 4" strokeWidth="1">
            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} />
            <line x1={padding} y1={svgHeight - padding * 1.5} x2={svgWidth - padding} y2={svgHeight - padding * 1.5} />
            <line x1={padding} y1={svgHeight - padding * 2} x2={svgWidth - padding} y2={svgHeight - padding * 2} />
          </g>

          {/* Line and points */}
          <g>
            <polyline points={linePath} fill="none" stroke={color} strokeWidth="2" />
            {data.map((item, index) => {
              const { x, y } = getSvgPoint(item, index);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  stroke="#1F2937"
                  strokeWidth="2"
                />
              );
            })}
          </g>
        </svg>

        {/* Labels for Y-axis */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-400 pl-2 pb-6">
          <div>{formatValue(maxValue)}</div>
          <div className="self-start">{formatValue(minValue + valueRange * 0.5)}</div>
          <div>{formatValue(minValue)}</div>
        </div>

        {/* Labels for X-axis */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between px-10 text-xs text-gray-400 -mt-4">
          {data.map((item, index) => {
            const date = new Date(item.label);
            const formattedLabel = weekLabelFormatter.format(date);
            return (
              <div key={index} className="text-center flex-1 truncate">
                {formattedLabel}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}