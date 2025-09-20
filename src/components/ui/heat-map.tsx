"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import "leaflet.heat";

interface HeatMapProps {
  data: {
    lat?: number;
    lng?: number;
    value: number;
  }[];
}

const HeatLayer = ({ data }: { data: HeatMapProps["data"] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const points = data
      .filter(d => d.lat && d.lng)
      .map(d => [d.lat, d.lng, d.value]);

    const heat = (L as any).heatLayer(points, { radius: 25, blur: 15 }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]);

  return null;
};

export const HeatMap = ({ data }: HeatMapProps) => {
  return (
    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} className="w-full h-96 rounded-lg">
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        attribution="&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap contributors"
      />
      <HeatLayer data={data} />
    </MapContainer>
  );
};
