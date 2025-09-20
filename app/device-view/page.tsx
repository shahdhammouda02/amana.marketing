"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchMarketingData } from "../../src/lib/api";
import { Navbar } from "../../src/components/ui/navbar";
import { CardMetric } from "../../src/components/ui/card-metric";
import { Footer } from "../../src/components/ui/footer";
import { BarChart } from "../../src/components/ui/bar-chart";
import { Table } from "../../src/components/ui/table";
import { MousePointer, DollarSign, TrendingUp } from "lucide-react";
import { MarketingData, DevicePerformance } from "../../src/types/marketing";

export default function DeviceView() {
  const [deviceData, setDeviceData] = useState<DevicePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data: MarketingData = await fetchMarketingData();

        // Aggregate device performance across all campaigns
        const aggregated: Record<string, DevicePerformance> = {};

        data.campaigns.forEach((campaign) => {
          campaign.device_performance.forEach((device) => {
            if (!aggregated[device.device]) {
              aggregated[device.device] = { ...device }; // copy initial values
            } else {
              const d = aggregated[device.device];
              d.impressions += device.impressions;
              d.clicks += device.clicks;
              d.conversions += device.conversions;
              d.spend += device.spend;
              d.revenue += device.revenue;
              d.ctr = d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0;
              d.conversion_rate =
                d.clicks > 0 ? (d.conversions / d.clicks) * 100 : 0;
              d.percentage_of_traffic = 0; // you can calculate later if needed
            }
          });
        });

        setDeviceData(Object.values(aggregated));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load device data"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const metrics = useMemo(() => {
    const desktop = deviceData.find((d) => d.device === "Desktop") || {
      clicks: 0,
      spend: 0,
      revenue: 0,
      conversions: 0,
    };
    const mobile = deviceData.find((d) => d.device === "Mobile") || {
      clicks: 0,
      spend: 0,
      revenue: 0,
      conversions: 0,
    };
    return { desktop, mobile };
  }, [deviceData]);

  if (loading)
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">
          Loading device performance...
        </div>
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            {error ? (
              <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-3 rounded mb-4 max-w-2xl mx-auto">
                Error loading data: {error}
              </div>
            ) : (
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                Device View: Desktop vs Mobile
              </h1>
            )}
          </div>
        </section>

        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {metrics && (
            <>
              <div className="mb-6 sm:mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardMetric
                  title="Desktop Clicks"
                  value={metrics.desktop.clicks.toLocaleString()}
                  icon={<MousePointer className="h-5 w-5" />}
                />
                <CardMetric
                  title="Mobile Clicks"
                  value={metrics.mobile.clicks.toLocaleString()}
                  icon={<MousePointer className="h-5 w-5" />}
                />
                <CardMetric
                  title="Desktop Spend"
                  value={`$${metrics.desktop.spend.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                <CardMetric
                  title="Mobile Spend"
                  value={`$${metrics.mobile.spend.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                <CardMetric
                  title="Desktop Revenue"
                  value={`$${metrics.desktop.revenue.toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <CardMetric
                  title="Mobile Revenue"
                  value={`$${metrics.mobile.revenue.toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <BarChart
                  title="Clicks Comparison"
                  data={[
                    {
                      label: "Desktop",
                      value: metrics.desktop.clicks,
                      color: "#3B82F6",
                    },
                    {
                      label: "Mobile",
                      value: metrics.mobile.clicks,
                      color: "#10B981",
                    },
                  ]}
                />
                <BarChart
                  title="Conversions Comparison"
                  data={[
                    {
                      label: "Desktop",
                      value: metrics.desktop.conversions,
                      color: "#3B82F6",
                    },
                    {
                      label: "Mobile",
                      value: metrics.mobile.conversions,
                      color: "#10B981",
                    },
                  ]}
                />
              </div>

              <Table
                title="Device Performance Details"
                columns={[
                  {
                    key: "device",
                    header: "Device",
                    width: "20%",
                    sortable: true,
                  },
                  {
                    key: "impressions",
                    header: "Impressions",
                    width: "15%",
                    align: "right",
                    sortable: true,
                    render: (v) => v.toLocaleString(),
                  },
                  {
                    key: "clicks",
                    header: "Clicks",
                    width: "15%",
                    align: "right",
                    sortable: true,
                    render: (v) => v.toLocaleString(),
                  },
                  {
                    key: "conversions",
                    header: "Conversions",
                    width: "15%",
                    align: "right",
                    sortable: true,
                    render: (v) => v.toLocaleString(),
                  },
                  {
                    key: "spend",
                    header: "Spend",
                    width: "15%",
                    align: "right",
                    sortable: true,
                    render: (v) => `$${v.toLocaleString()}`,
                  },
                  {
                    key: "revenue",
                    header: "Revenue",
                    width: "15%",
                    align: "right",
                    sortable: true,
                    render: (v) => `$${v.toLocaleString()}`,
                  },
                  {
                    key: "roas",
                    header: "ROAS",
                    width: "10%",
                    align: "right",
                    sortable: true,
                    render: (v) =>
                      v !== undefined && v !== null ? v.toFixed(2) : "-",
                  },
                ]}
                data={deviceData}
                defaultSort={{ key: "clicks", direction: "desc" }}
              />
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
