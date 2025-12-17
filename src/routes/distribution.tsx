import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useDistributionData } from "../hooks/useDistributionData";

export const Route = createFileRoute("/distribution")({
  component: DistributionCharts,
});

function DistributionCharts() {
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const { distributionData, loading, error, years, statistics } =
    useDistributionData(selectedYear);

  // Convert country distribution data to density curves
  const countryDensityData = useMemo(() => {
    return distributionData.slice(0, 5).map((series) => ({
      id: series.id,
      data: series.data.map((point) => ({
        x: point.x,
        y: point.y,
      })),
    }));
  }, [distributionData]);

  if (loading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading distribution data...</div>
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
          <h1 className="text-4xl font-bold text-white mb-2">
            Distribution Density Plots
          </h1>
          <p className="text-gray-300 text-lg">
            Visualize country distribution patterns using density curves
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
            <div className="flex items-end">
              <p className="text-sm text-gray-400">
                Select a year to view the country distribution for that period.
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Country Distribution Density Plot */}
          <div className="bg-secondary rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Country Distribution Density Over Time
            </h2>
            <div className="h-96">
              <ResponsiveLine
                data={countryDensityData}
                margin={{ top: 50, right: 200, bottom: 70, left: 80 }}
                xScale={{ type: "linear", min: 1980, max: 2020 }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                }}
                curve="monotoneX"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 10,
                  tickRotation: 0,
                  legend: "Year",
                  legendOffset: 50,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 10,
                  tickRotation: 0,
                  legend: "Count",
                  legendOffset: -60,
                  legendPosition: "middle",
                }}
                enablePoints={false}
                enableArea={true}
                areaOpacity={0.15}
                colors={{ scheme: "nivo" }}
                lineWidth={3}
                enableGridX={false}
                enableGridY={true}
                gridYValues={5}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fill: "#9ca3af",
                      },
                    },
                    legend: {
                      text: {
                        fill: "#d1d5db",
                      },
                    },
                  },
                  grid: {
                    line: {
                      stroke: "#374151",
                      strokeWidth: 1,
                    },
                  },
                  legends: {
                    text: {
                      fill: "#d1d5db",
                    },
                  },
                }}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 140,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemDirection: "left-to-right",
                    itemWidth: 120,
                    itemHeight: 20,
                    itemOpacity: 0.85,
                    symbolSize: 12,
                    symbolShape: "circle",
                  },
                ]}
                useMesh={true}
              />
            </div>
          </div>
        </div>

        {/* Statistical Summary - Simplified Inline */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Mean:</span>
            <span className="text-3xl font-bold text-white">
              {statistics.mean.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Median:</span>
            <span className="text-3xl font-bold text-white">
              {statistics.median.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Standard Deviation:</span>
            <span className="text-3xl font-bold text-white">
              {statistics.standardDeviation.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Range:</span>
            <span className="text-3xl font-bold text-white">
              {statistics.range.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}