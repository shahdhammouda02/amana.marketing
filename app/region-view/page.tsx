"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";
import { Navbar } from "../../src/components/ui/navbar";
import { CardMetric } from "../../src/components/ui/card-metric";
import { Footer } from "../../src/components/ui/footer";
import { MapPin, DollarSign, TrendingUp, Globe } from "lucide-react";
import { BubbleMap } from "../../src/components/ui/bubble-map";

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading marketing data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const regionalMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const regionalData: Record<string, any> = {};

    marketingData.campaigns.forEach((campaign) => {
      campaign.regional_performance?.forEach((region) => {
        const key = `${region.city}-${region.country}`;
        if (!regionalData[key]) {
          regionalData[key] = {
            revenue: 0,
            spend: 0,
            clicks: 0,
            conversions: 0,
            impressions: 0,
            city: region.city,
            country: region.country,
            lat: region.lat,
            lng: region.lng,
            ctr: 0,
            conversion_rate: 0,
            roi: 0,
          };
        }
        regionalData[key].revenue += region.revenue || 0;
        regionalData[key].spend += region.spend || 0;
        regionalData[key].clicks += region.clicks || 0;
        regionalData[key].conversions += region.conversions || 0;
        regionalData[key].impressions += region.impressions || 0;
      });
    });

    Object.values(regionalData).forEach((data: any) => {
      data.ctr =
        data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data.conversion_rate =
        data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
      data.roi =
        data.spend > 0 ? ((data.revenue - data.spend) / data.spend) * 100 : 0;
    });

    return {
      regions: Object.values(regionalData),
      totalRevenue: Object.values(regionalData).reduce(
        (sum, r: any) => sum + r.revenue,
        0
      ),
      totalSpend: Object.values(regionalData).reduce(
        (sum, r: any) => sum + r.spend,
        0
      ),
      totalClicks: Object.values(regionalData).reduce(
        (sum, r: any) => sum + r.clicks,
        0
      ),
      totalConversions: Object.values(regionalData).reduce(
        (sum, r: any) => sum + r.conversions,
        0
      ),
    };
  }, [marketingData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading regional data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Regional Performance View
                </h1>
              )}
            </div>
          </div>
        </section>

        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && regionalMetrics && (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <CardMetric
                  title="Total Regions"
                  value={regionalMetrics.regions.length.toString()}
                  icon={<Globe className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Revenue"
                  value={`$${regionalMetrics.totalRevenue.toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Spend"
                  value={`$${regionalMetrics.totalSpend.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Conversions"
                  value={regionalMetrics.totalConversions.toLocaleString()}
                  icon={<MapPin className="h-5 w-5" />}
                />
              </div>

              {/* Map Section – الكل هنا */}
              <div className="mb-8 w-full h-[500px]">
                <BubbleMap data={regionalMetrics.regions} />
              </div>

              {/* Regional Performance Table – بدون تغيير */}
              <div className="bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Regional Performance Details
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Impressions
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Conversions
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          CTR
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Conv. Rate
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Spend
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          ROI
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {regionalMetrics.regions.map((region, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {region.country}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {region.impressions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {region.clicks.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {region.conversions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {region.ctr.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {region.conversion_rate.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            ${region.spend.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            ${region.revenue.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {region.roi.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
