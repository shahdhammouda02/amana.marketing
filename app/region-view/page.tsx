"use client";

import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Footer } from '../../src/components/ui/footer';
import { BubbleMap } from '../../src/components/ui/bubble-map';
import { MapPin, DollarSign, TrendingUp, Globe } from 'lucide-react';

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
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

  // Calculate regional metrics
  const regionalMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const regionalData: { [key: string]: { 
      revenue: number; 
      spend: number; 
      clicks: number; 
      conversions: number;
      impressions: number;
      city: string; 
      country: string;
       ctr: number; // Add this line
  conversion_rate: number; // Add this line
  roi: number;
    } } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.regional_performance?.forEach(region => {
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
             ctr: 0, // Add this line
    conversion_rate: 0, // Add this line
    roi: 0 
          };
        }

        regionalData[key].revenue += region.revenue || 0;
        regionalData[key].spend += region.spend || 0;
        regionalData[key].clicks += region.clicks || 0;
        regionalData[key].conversions += region.conversions || 0;
        regionalData[key].impressions += region.impressions || 0;
      });
    });

    // Calculate CTR and conversion rates
    Object.keys(regionalData).forEach(key => {
      const data = regionalData[key];
      data['ctr'] = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data['conversion_rate'] = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
      data['roi'] = data.spend > 0 ? ((data.revenue - data.spend) / data.spend) * 100 : 0;
    });

    // Convert to array
    const regions = Object.values(regionalData).map(region => {
  // If city is actually a country name, swap them
  if (region.city && region.country && region.city.length > region.country.length) {
    // This might be the case where city field contains country name
    return {
      ...region,
      city: region.country,
      country: region.city
    };
  }
  return region;
});

    return {
      regions,
      totalRevenue: regions.reduce((sum, region) => sum + region.revenue, 0),
      totalSpend: regions.reduce((sum, region) => sum + region.spend, 0),
      totalClicks: regions.reduce((sum, region) => sum + region.clicks, 0),
      totalConversions: regions.reduce((sum, region) => sum + region.conversions, 0),
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
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        {/* Hero Section */}
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

        {/* Content Area */}
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

              {/* Regional Performance Maps */}
              <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {/* Revenue by Region */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Revenue by Region
                  </h2>
                  <BubbleMap
                    data={regionalMetrics.regions}
                    valueKey="revenue"
                    sizeMultiplier={0.0005}
                    color="#10B981"
                  />
                </div>

                {/* Spend by Region */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
                    Spend by Region
                  </h2>
                  <BubbleMap
                    data={regionalMetrics.regions}
                    valueKey="spend"
                    sizeMultiplier={0.001}
                    color="#3B82F6"
                  />
                </div>
              </div>

              {/* Regional Performance Table */}
              <div className="bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-white mb-4">Regional Performance Details</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">City</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Impressions</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Clicks</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Conversions</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">CTR</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Conv. Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Spend</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">ROI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {regionalMetrics.regions.map((region, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{region.city}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{region.country}</td>
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