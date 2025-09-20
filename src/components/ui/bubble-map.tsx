"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Circle, useMap } from "react-leaflet"; // استدعاء مباشر
import "leaflet/dist/leaflet.css";

// Dynamic Import فقط للخريطة و TileLayer
const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
);

let L: any;
if (typeof window !== "undefined") {
  L = require("leaflet");
  require("leaflet.heat");
}

interface MapBubbleHeatProps {
  data: {
    lat?: number;
    lng?: number;
    [key: string]: any;
  }[];
  bubbles: {
    valueKey: string;
    color: string;
    sizeMultiplier: number;
  }[];
  heatValueKey?: string;
}

const HeatLayer = ({
  data,
  heatValueKey,
}: {
  data: MapBubbleHeatProps["data"];
  heatValueKey?: string;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !L) return;

    const points = data
      .filter(d => d.lat && d.lng)
      .map(d => [d.lat, d.lng, heatValueKey && d[heatValueKey] ? d[heatValueKey] : 1]);

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      gradient: { 0.2: "#ccc", 0.4: "#aaa", 0.6: "#888", 0.8: "#555", 1.0: "#333" },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data, heatValueKey]);

  return null;
};

export const BubbleHeatMap = ({ data, bubbles, heatValueKey }: MapBubbleHeatProps) => {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={false}
      className="w-full h-96 rounded-lg"
    >
      {/* خريطة فاتحة (أبيض/رمادي) */}
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution="&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap contributors"
      />

      {/* Heat Layer */}
      {L && <HeatLayer data={data} heatValueKey={heatValueKey} />}

      {/* Bubbles */}
      {data.map((d, i) =>
        bubbles.map(
          (bubble, idx) =>
            d.lat &&
            d.lng &&
            d[bubble.valueKey] && (
              <Circle
                key={`${i}-${idx}`}
                center={[d.lat, d.lng]}
                radius={Math.sqrt(d[bubble.valueKey]) * bubble.sizeMultiplier}
                pathOptions={{
                  color: bubble.color,
                  fillColor: bubble.color,
                  fillOpacity: 0.6,
                }}
              />
            )
        )
      )}
    </MapContainer>
  );
};
