import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { useComparisonData } from "../hooks/useComparisonData";

export const Route = createFileRoute("/comparison")({
  component: ComparisonCharts,
});

function ComparisonCharts() {
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const { data, loading, error, years } = useComparisonData(selectedYear);

  if (loading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading comparison data...</div>
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
            Comparison Charts
          </h1>
          <p className="text-gray-300 text-lg">
            Compare emigrant data across different countries and categories
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

        {/* Chart - NOW HORIZONTAL */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Top Countries by Emigrants ({selectedYear})
          </h2>
          <div className="h-[600px]">
            <ResponsiveBar
              data={[...data].reverse() as any}  // REVERSE THE DATA HERE
              keys={["emigrants"]}
              indexBy="country"
              layout="horizontal"
              margin={{ top: 20, right: 130, bottom: 50, left: 180 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={["#10b981", "#059669", "#047857", "#065f46"]}  // Green gradient
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: "#ffffff"
                    }
                  },
                  legend: {
                    text: {
                      fill: "#ffffff"
                    }
                  }
                },
                labels: {
                  text: {
                    fill: "#ffffff"
                  }
                }
              }}
              borderColor={{
                from: "color",
                modifiers: [["darker", 1.6]],
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Number of Emigrants",
                legendPosition: "middle",
                legendOffset: 40,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "",
                legendPosition: "middle",
                legendOffset: 0,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: "color",
                modifiers: [["darker", 1.6]],
              }}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: "left-to-right",
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
              role="application"
              ariaLabel="Emigrants comparison chart"
              barAriaLabel={(e) =>
                `Country: ${e.id}, Emigrants: ${e.formattedValue}`
              }
            />
          </div>
        </div>

        {/* Data Summary - NOW IN A LINE */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Total Countries:</span>
            <span className="text-3xl font-bold text-white">{data.length}</span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Total Emigrants:</span>
            <span className="text-3xl font-bold text-white">
              {data
                .reduce((sum, item) => sum + item.emigrants, 0)
                .toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">Top Country:</span>
            <span className="text-3xl font-bold text-white">
              {data.length > 0 ? data[0].country : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}