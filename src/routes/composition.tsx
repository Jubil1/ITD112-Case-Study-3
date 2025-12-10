import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { useCompositionData } from "../hooks/useCompositionData";

export const Route = createFileRoute("/composition")({
  component: CompositionCharts,
});

type ChartTab = "destination" | "ageGroup" | "civilStatus";

function CompositionCharts() {
  const [selectedYear, setSelectedYear] = useState<number>(1981);
  const [activeTab, setActiveTab] = useState<ChartTab>("destination");
  
  const {
    destinationData,
    ageGroupData,
    civilStatusData,
    loading,
    error,
    years,
  } = useCompositionData(selectedYear);

  if (loading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading composition data...</div>
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

  // Get current chart data based on active tab
  const getCurrentChartData = () => {
    switch (activeTab) {
      case "destination":
        return destinationData;
      case "ageGroup":
        return ageGroupData;
      case "civilStatus":
        return civilStatusData;
    }
  };

  const getCurrentChartTitle = () => {
    switch (activeTab) {
      case "destination":
        return "Destination Countries Distribution";
      case "ageGroup":
        return "Age Groups Distribution";
      case "civilStatus":
        return "Civil Status Distribution";
    }
  };

  const currentData = getCurrentChartData();

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Composition Charts
          </h1>
          <p className="text-gray-300 text-lg">
            View data composition and proportions across different categories
          </p>
        </div>

        {/* Filters */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                    className="bg-primary text-white"
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("destination")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === "destination"
                ? "bg-highlights text-white"
                : "bg-secondary text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            Destination Countries
          </button>
          <button
            onClick={() => setActiveTab("ageGroup")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === "ageGroup"
                ? "bg-highlights text-white"
                : "bg-secondary text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            Age Groups
          </button>
          <button
            onClick={() => setActiveTab("civilStatus")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === "civilStatus"
                ? "bg-highlights text-white"
                : "bg-secondary text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            Civil Status
          </button>
        </div>

        {/* Single Large Chart */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {getCurrentChartTitle()} ({selectedYear})
          </h2>
          <div className="h-[600px]">
            {currentData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-lg">
                  No data available for {selectedYear}
                </p>
              </div>
            ) : (
              <ResponsivePie
                data={currentData}
                margin={{ top: 40, right: 120, bottom: 80, left: 120 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 0.2]],
                }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#ffffff"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                legends={[
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 10,
                    itemWidth: 120,
                    itemHeight: 18,
                    itemTextColor: "#ffffff",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: "circle",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: "#fbbf24",
                        },
                      },
                    ],
                  },
                ]}
              />
            )}
          </div>
        </div>

        {/* Data Summary - In a Line */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Total Destinations:</span>
            <span className="text-3xl font-bold text-white">
              {destinationData.length}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Age Groups:</span>
            <span className="text-3xl font-bold text-white">
              {ageGroupData.length}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Civil Statuses:</span>
            <span className="text-3xl font-bold text-white">
              {civilStatusData.length}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Top Destination:</span>
            <span className="text-3xl font-bold text-white">
              {destinationData.length > 0 ? destinationData[0].label : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}