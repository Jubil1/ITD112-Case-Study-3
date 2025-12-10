import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTrendData } from "../hooks/useTrendData";

export const Route = createFileRoute("/trends")({
  component: TrendAnalysis,
});

function TrendAnalysis() {
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");

  const {
    countryTrends,
    ageGroupTrends,
    loading,
    error,
    countries,
    ageGroups,
  } = useTrendData(selectedCountry);

  // Set default age group when data loads
  if (!selectedAgeGroup && ageGroups.length > 0) {
    setSelectedAgeGroup(ageGroups[0]);
  }

  // Get the selected age group data
  const selectedAgeData = ageGroupTrends.find(
    (trend) => trend.id === selectedAgeGroup
  );

  // Transform data for the line chart
  const lineChartData = selectedAgeData
    ? selectedAgeData.data.map((point: any) => ({
        year: point.x,
        emigrants: point.y,
      }))
    : [];

  if (loading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading trend data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Trend Analysis</h1>
          <p className="text-gray-300 text-lg">
            Analyze trends over time across different countries and categories
          </p>
        </div>

        {/* Filters */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                    className="bg-primary text-white"
                  >
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age Group
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                {ageGroups.map((ageGroup) => (
                  <option
                    key={ageGroup}
                    value={ageGroup}
                    className="bg-primary text-white"
                  >
                    {ageGroup}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Emigration Trend - {selectedAgeGroup}
          </h2>
          <div style={{ width: "100%", height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="year"
                  stroke="#ffffff"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fill: "#ffffff", fontSize: 12 }}
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#ffffff",
                  }}
                />
                <YAxis
                  stroke="#ffffff"
                  tick={{ fill: "#ffffff", fontSize: 12 }}
                  label={{
                    value: "Number of Emigrants",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#ffffff",
                  }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: any) => [
                    value.toLocaleString(),
                    "Emigrants",
                  ]}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="emigrants"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Emigrants"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Summary - In a Line */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Countries Tracked:</span>
            <span className="text-3xl font-bold text-white">
              {countries.length}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Age Groups:</span>
            <span className="text-3xl font-bold text-white">
              {ageGroups.length}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Selected Country:</span>
            <span className="text-3xl font-bold text-white">{selectedCountry}</span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Selected Age Group:</span>
            <span className="text-3xl font-bold text-white">
              {selectedAgeGroup}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}