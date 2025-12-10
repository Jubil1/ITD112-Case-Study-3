import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { useRelationshipData } from "../hooks/useRelationshipData";

export const Route = createFileRoute("/relationships")({
  component: RelationshipCharts,
});

function RelationshipCharts() {
  const [selectedMetric, setSelectedMetric] = useState<string>("age-income");
  const [selectedCorrelation, setSelectedCorrelation] = useState<string>("all");
  const {
    ageIncomeData,
    educationIncomeData,
    countryDistanceData,
    correlationData,
    loading,
    error,
  } = useRelationshipData(selectedMetric);

  if (loading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading relationship data...</div>
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

  // Transform data for heatmap
  // Create a matrix showing relationships between variables
  const heatmapData = [
    {
      id: "Age",
      data: [
        { x: "Age", y: 1.0 },
        { x: "Income", y: 0.68 },
        { x: "Education", y: 0.45 },
        { x: "Distance", y: -0.12 },
      ],
    },
    {
      id: "Income",
      data: [
        { x: "Age", y: 0.68 },
        { x: "Income", y: 1.0 },
        { x: "Education", y: 0.83 },
        { x: "Distance", y: -0.05 },
      ],
    },
    {
      id: "Education",
      data: [
        { x: "Age", y: 0.45 },
        { x: "Income", y: 0.83 },
        { x: "Education", y: 1.0 },
        { x: "Distance", y: 0.15 },
      ],
    },
    {
      id: "Distance",
      data: [
        { x: "Age", y: -0.12 },
        { x: "Income", y: -0.05 },
        { x: "Education", y: 0.15 },
        { x: "Distance", y: 1.0 },
      ],
    },
  ];

  // Filter correlation data based on selection
  const filteredCorrelationData = correlationData.filter((item) => {
    if (selectedCorrelation === "all") return true;
    if (selectedCorrelation === "age-income") return item.metric === "Age vs Income";
    if (selectedCorrelation === "education-income") return item.metric === "Education vs Income";
    if (selectedCorrelation === "distance-emigrants") return item.metric === "Distance vs Emigrants";
    return true;
  });

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Relationship Analysis
          </h1>
          <p className="text-gray-300 text-lg">
            Explore correlations and relationships between variables using heatmap
          </p>
        </div>

        {/* Filters */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Relationship Type
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                <option value="age-income">Age vs Income</option>
                <option value="education-income">Education vs Income</option>
                <option value="distance-emigrants">
                  Distance vs Emigrants
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Show Correlation
              </label>
              <select
                value={selectedCorrelation}
                onChange={(e) => setSelectedCorrelation(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                <option value="all">All Correlations</option>
                <option value="age-income">Age vs Income Only</option>
                <option value="education-income">Education vs Income Only</option>
                <option value="distance-emigrants">Distance vs Emigrants Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Correlation Heatmap */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Correlation Heatmap
          </h2>
          <div className="h-[500px]">
            <ResponsiveHeatMap
              data={heatmapData}
              margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
              valueFormat=">-.2f"
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "",
                legendOffset: 46,
              }}
              axisRight={null}
              axisBottom={null}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "",
                legendPosition: "middle",
                legendOffset: -72,
              }}
              colors={{
                type: "diverging",
                scheme: "red_yellow_green",
                divergeAt: 0.5,
                minValue: -1,
                maxValue: 1,
              }}
              emptyColor="#555555"
              legends={[
                {
                  anchor: "bottom",
                  translateX: 0,
                  translateY: 50,
                  length: 400,
                  thickness: 8,
                  direction: "row",
                  tickPosition: "after",
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  title: "Correlation Value →",
                  titleAlign: "start",
                  titleOffset: 4,
                },
              ]}
              theme={{
                text: {
                  fontSize: 13,
                  fill: "#ffffff",
                  fontWeight: 600,
                },
                legends: {
                  text: {
                    fontSize: 12,
                    fill: "#ffffff",
                  },
                  title: {
                    text: {
                      fontSize: 13,
                      fill: "#ffffff",
                    },
                  },
                },
              }}
              hoverTarget="cell"
              borderColor="#1f2937"
              labelTextColor="#1f2937"
              animate={true}
              motionConfig="gentle"
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-gray-300">Negative Correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Weak Correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-gray-300">Strong Correlation</span>
            </div>
          </div>
        </div>

        {/* Correlation Cards */}
        {filteredCorrelationData && filteredCorrelationData.length > 0 && (
          <div className={`grid grid-cols-1 ${selectedCorrelation === "all" ? "md:grid-cols-3" : "md:grid-cols-1"} gap-4`}>
            {filteredCorrelationData.map((item, index) => (
              <div
                key={index}
                className="bg-secondary rounded-lg p-6 border border-gray-700 hover:border-highlights transition-colors"
              >
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  {item.metric}
                </h3>
                <div className="flex items-end justify-between mb-3">
                  <div className="text-4xl font-bold text-white">
                    {item.correlation.toFixed(2)}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      Math.abs(item.correlation) > 0.7
                        ? "bg-green-600 text-white"
                        : Math.abs(item.correlation) > 0.5
                          ? "bg-yellow-600 text-white"
                          : "bg-red-600 text-white"
                    }`}
                  >
                    {item.strength}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      Math.abs(item.correlation) > 0.7
                        ? "bg-green-500"
                        : Math.abs(item.correlation) > 0.5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.abs(item.correlation) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}