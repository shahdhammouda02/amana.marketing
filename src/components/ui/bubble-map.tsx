"use client";

import React from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
import "leaflet/dist/leaflet.css";

interface BubbleMapProps {
  data: {
    lat?: number;
    lng?: number;
    city: string;
    country: string;
    revenue: number;
    spend: number;
  }[];
}

export const BubbleMap: React.FC<BubbleMapProps> = ({ data }) => {
  const center = data.length ? [data[0].lat || 0, data[0].lng || 0] : [0, 0];

  const colors = ["#EC4899", "#10B981", "#3B82F6", "#FACC15"];
  const countryColorMap: Record<string, string> = {};
  let colorIndex = 0;

  // تجميع البيانات حسب الدولة
  const countryData: Record<
    string,
    { lat: number; lng: number; revenue: number; spend: number }
  > = {};

  data.forEach((city) => {
    if (!countryData[city.country]) {
      countryData[city.country] = {
        lat: city.lat || 0,
        lng: city.lng || 0,
        revenue: 0,
        spend: 0,
      };
      countryColorMap[city.country] = colors[colorIndex % colors.length];
      colorIndex++;
    }
    countryData[city.country].revenue += city.revenue;
    countryData[city.country].spend += city.spend;
  });

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {Object.entries(countryData).map(([country, metrics], idx) => {
        const color = countryColorMap[country];

        // إزاحة منظمة لكل فقاعة
        const offsetDegree = 0.3; // المسافة بين Revenue و Spend
        const revenueLat = metrics.lat;
        const revenueLng = metrics.lng + offsetDegree;
        const spendLat = metrics.lat;
        const spendLng = metrics.lng - offsetDegree;

        const revenueRadius = Math.sqrt(metrics.revenue) * 1000;
        const spendRadius = Math.sqrt(metrics.spend) * 1000;

        return (
          <React.Fragment key={idx}>
            {/* Revenue */}
            <Circle
              center={[revenueLat, revenueLng]}
              radius={revenueRadius}
              color={color}
              fillColor={color}
              fillOpacity={0.5}
            >
              <Popup>
                <div>
                  <strong>{country}</strong>
                  <br />
                  Revenue: ${metrics.revenue.toLocaleString()}
                </div>
              </Popup>
            </Circle>

            {/* Spend */}
            <Circle
              center={[spendLat, spendLng]}
              radius={spendRadius}
              color={color}
              fillColor={color}
              fillOpacity={0.5}
            >
              <Popup>
                <div>
                  <strong>{country}</strong>
                  <br />
                  Spend: ${metrics.spend.toLocaleString()}
                </div>
              </Popup>
            </Circle>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};
