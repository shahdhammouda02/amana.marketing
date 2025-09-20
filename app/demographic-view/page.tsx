"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, DemographicBreakdown } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Footer } from '../../src/components/ui/footer';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Users, UserCheck, TrendingUp, Target, DollarSign, MousePointer, BarChart3 } from 'lucide-react';

export default function DemographicView() {
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

  // Calculate demographic metrics
  const demographicMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    let totalMaleClicks = 0;
    let totalMaleSpend = 0;
    let totalMaleRevenue = 0;
    let totalFemaleClicks = 0;
    let totalFemaleSpend = 0;
    let totalFemaleRevenue = 0;

    const ageGroupSpend: { [key: string]: number } = {};
    const ageGroupRevenue: { [key: string]: number } = {};
    const maleAgePerformance: { [key: string]: any } = {};
    const femaleAgePerformance: { [key: string]: any } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown?.forEach(demographic => {
        const { gender, age_group, performance } = demographic;
        
        if (gender === 'Male') {
          totalMaleClicks += performance.clicks || 0;
          totalMaleSpend += performance.clicks * campaign.cpc || 0;
          totalMaleRevenue += performance.conversions * campaign.average_order_value || 0;

          // Initialize age group data if not exists
          if (!maleAgePerformance[age_group]) {
            maleAgePerformance[age_group] = {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              ctr: 0,
              conversion_rate: 0
            };
          }

          maleAgePerformance[age_group].impressions += performance.impressions || 0;
          maleAgePerformance[age_group].clicks += performance.clicks || 0;
          maleAgePerformance[age_group].conversions += performance.conversions || 0;
        }

        if (gender === 'Female') {
          totalFemaleClicks += performance.clicks || 0;
          totalFemaleSpend += performance.clicks * campaign.cpc || 0;
          totalFemaleRevenue += performance.conversions * campaign.average_order_value || 0;

          // Initialize age group data if not exists
          if (!femaleAgePerformance[age_group]) {
            femaleAgePerformance[age_group] = {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              ctr: 0,
              conversion_rate: 0
            };
          }

          femaleAgePerformance[age_group].impressions += performance.impressions || 0;
          femaleAgePerformance[age_group].clicks += performance.clicks || 0;
          femaleAgePerformance[age_group].conversions += performance.conversions || 0;
        }

        // Age group metrics
        if (!ageGroupSpend[age_group]) ageGroupSpend[age_group] = 0;
        if (!ageGroupRevenue[age_group]) ageGroupRevenue[age_group] = 0;

        ageGroupSpend[age_group] += performance.clicks * campaign.cpc || 0;
        ageGroupRevenue[age_group] += performance.conversions * campaign.average_order_value || 0;
      });
    });

    // Calculate CTR and conversion rates
    Object.keys(maleAgePerformance).forEach(ageGroup => {
      const data = maleAgePerformance[ageGroup];
      data.ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data.conversion_rate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    });

    Object.keys(femaleAgePerformance).forEach(ageGroup => {
      const data = femaleAgePerformance[ageGroup];
      data.ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data.conversion_rate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    });

    return {
      totalMaleClicks,
      totalMaleSpend,
      totalMaleRevenue,
      totalFemaleClicks,
      totalFemaleSpend,
      totalFemaleRevenue,
      ageGroupSpend,
      ageGroupRevenue,
      maleAgePerformance,
      femaleAgePerformance
    };
  }, [marketingData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading demographic data...</div>
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
                  Demographic View
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && demographicMetrics && (
            <>
              {/* Male Demographic Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-blue-400" />
                  Male Demographic Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <CardMetric
                    title="Total Clicks by Males"
                    value={demographicMetrics.totalMaleClicks.toLocaleString()}
                    icon={<MousePointer className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Spend by Males"
                    value={`$${demographicMetrics.totalMaleSpend.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Revenue by Males"
                    value={`$${demographicMetrics.totalMaleRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Female Demographic Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-pink-400" />
                  Female Demographic Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <CardMetric
                    title="Total Clicks by Females"
                    value={demographicMetrics.totalFemaleClicks.toLocaleString()}
                    icon={<MousePointer className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Spend by Females"
                    value={`$${demographicMetrics.totalFemaleSpend.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Revenue by Females"
                    value={`$${demographicMetrics.totalFemaleRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Age Group Performance Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Total Spend by Age Group */}
                <BarChart
                  title="Total Spend by Age Group"
                  data={Object.entries(demographicMetrics.ageGroupSpend).map(([ageGroup, spend]) => ({
                    label: ageGroup,
                    value: spend,
                    color: '#3B82F6'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                {/* Total Revenue by Age Group */}
                <BarChart
                  title="Total Revenue by Age Group"
                  data={Object.entries(demographicMetrics.ageGroupRevenue).map(([ageGroup, revenue]) => ({
                    label: ageGroup,
                    value: revenue,
                    color: '#10B981'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
              </div>

              {/* Campaign Performance Tables */}
              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                {/* Male Age Groups Performance */}
                <Table
                  title="Campaign Performance by Male Age Groups"
                  columns={[
                    {
                      key: 'age_group',
                      header: 'Age Group',
                      width: '15%',
                      sortable: true,
                      sortType: 'string'
                    },
                    {
                      key: 'impressions',
                      header: 'Impressions',
                      width: '15%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'clicks',
                      header: 'Clicks',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'conversions',
                      header: 'Conversions',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'ctr',
                      header: 'CTR',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'conversion_rate',
                      header: 'Conversion Rate',
                      width: '15%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    }
                  ]}
                  data={Object.entries(demographicMetrics.maleAgePerformance).map(([ageGroup, data]) => ({
                    age_group: ageGroup,
                    ...data
                  }))}
                  defaultSort={{ key: 'conversions', direction: 'desc' }}
                />

                {/* Female Age Groups Performance */}
                <Table
                  title="Campaign Performance by Female Age Groups"
                  columns={[
                    {
                      key: 'age_group',
                      header: 'Age Group',
                      width: '15%',
                      sortable: true,
                      sortType: 'string'
                    },
                    {
                      key: 'impressions',
                      header: 'Impressions',
                      width: '15%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'clicks',
                      header: 'Clicks',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'conversions',
                      header: 'Conversions',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'ctr',
                      header: 'CTR',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'conversion_rate',
                      header: 'Conversion Rate',
                      width: '15%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    }
                  ]}
                  data={Object.entries(demographicMetrics.femaleAgePerformance).map(([ageGroup, data]) => ({
                    age_group: ageGroup,
                    ...data
                  }))}
                  defaultSort={{ key: 'conversions', direction: 'desc' }}
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}