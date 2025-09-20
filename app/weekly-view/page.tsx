"use client";

import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Footer } from '../../src/components/ui/footer';
import { LineChart } from '../../src/components/ui/line-chart';
import { Calendar, DollarSign, TrendingUp, MousePointer } from 'lucide-react';

export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading marketing data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const weeklyMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const weeklyData: { [key: string]: {
      revenue: number;
      spend: number;
      clicks: number;
      conversions: number;
      impressions: number;
      ctr: number;
      conversion_rate: number;
    } } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.weekly_performance?.forEach(week => {
        // Use week_start as the key
        const weekKey = week.week_start;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            revenue: 0,
            spend: 0,
            clicks: 0,
            conversions: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0
          };
        }

        weeklyData[weekKey].revenue += week.revenue || 0;
        weeklyData[weekKey].spend += week.spend || 0;
        weeklyData[weekKey].clicks += week.clicks || 0;
        weeklyData[weekKey].conversions += week.conversions || 0;
        weeklyData[weekKey].impressions += week.impressions || 0;
      });
    });

    const weeks = Object.keys(weeklyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // Calculate CTR and conversion rates
    weeks.forEach(week => {
      const data = weeklyData[week];
      data['ctr'] = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data['conversion_rate'] = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    });

    const revenueData = weeks.map(week => ({
      label: week,
      value: weeklyData[week].revenue
    }));
    
    const spendData = weeks.map(week => ({
      label: week,
      value: weeklyData[week].spend
    }));

    const clicksData = weeks.map(week => ({
      label: week,
      value: weeklyData[week].clicks
    }));

    return {
      weeklyData,
      weeks,
      revenueData,
      spendData,
      clicksData
    };
  }, [marketingData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading weekly data...</div>
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
                  Weekly Performance View
                </h1>
              )}
            </div>
          </div>
        </section>

        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && weeklyMetrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <CardMetric
                  title="Total Weeks"
                  value={weeklyMetrics.weeks.length.toString()}
                  icon={<Calendar className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Revenue"
                  value={`$${weeklyMetrics.revenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Spend"
                  value={`$${weeklyMetrics.spendData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Clicks"
                  value={weeklyMetrics.clicksData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  icon={<MousePointer className="h-5 w-5" />}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <LineChart
                  title="Revenue by Week"
                  data={weeklyMetrics.revenueData}
                  color="#10B981"
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                <LineChart
                  title="Spend by Week"
                  data={weeklyMetrics.spendData}
                  color="#3B82F6"
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow mb-6 sm:mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Weekly Performance Details</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Week</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Impressions</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Clicks</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Conversions</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">CTR</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Conv. Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Spend</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {weeklyMetrics.weeks.map(week => (
                        <tr key={week}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{week}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {weeklyMetrics.weeklyData[week].impressions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {weeklyMetrics.weeklyData[week].clicks.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {weeklyMetrics.weeklyData[week].conversions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {weeklyMetrics.weeklyData[week].ctr.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            {weeklyMetrics.weeklyData[week].conversion_rate.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            ${weeklyMetrics.weeklyData[week].spend.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">
                            ${weeklyMetrics.weeklyData[week].revenue.toLocaleString()}
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