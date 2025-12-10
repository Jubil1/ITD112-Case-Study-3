import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ResponsiveRadar } from "@nivo/radar";
import { useYearFilter } from "../hooks/useYearFilter";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export const Route = createFileRoute("/radar")({
  component: RadarPage,
});

interface RadarData {
  category: string;
  [key: string]: string | number;
}

interface CountryData {
  country: string;
  total: number;
}

function RadarPage() {
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [rankedCountries, setRankedCountries] = useState<CountryData[]>([]);
  const [showCount, setShowCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedYear, setSelectedYear } = useYearFilter();
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    fetchRadarData();
  }, [selectedYear]);

  const fetchRadarData = async () => {
    try {
      setLoading(true);
      setError(null);

      const destinationQuery = query(
        collection(db, "emigrantData_destination"),
        orderBy("Year")
      );
      const destinationSnapshot = await getDocs(destinationQuery);

      const destinationData =
        destinationSnapshot.docs.length > 0
          ? destinationSnapshot.docs.map((doc) => doc.data())
          : [];
      
      const countryTotals: Record<string, number> = {};

      destinationData.forEach((data: any) => {
        if (
          !selectedYear ||
          selectedYear === "all" ||
          data.Year === selectedYear
        ) {
          Object.entries(data).forEach(([key, value]) => {
            if (key === "Year") return;

            const emigrants =
              typeof value === "object" &&
              value !== null &&
              "emigrants" in value
                ? (value as { emigrants: number }).emigrants
                : null;

            if (emigrants && typeof emigrants === "number" && emigrants > 0) {
              countryTotals[key] = (countryTotals[key] || 0) + emigrants;
            }
          });
        }
      });

      // Get top 5 countries for radar
      const topCountries = Object.entries(countryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      // Create radar data
      const radarDataArray: RadarData[] = topCountries.map(([country, total]) => ({
        category: country,
        "Total Emigrants": typeof total === "number" && !isNaN(total) ? total : 0,
      }));

      // Create ranked list (all countries, sorted)
      const rankedList: CountryData[] = Object.entries(countryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([country, total]) => ({
          country,
          total: typeof total === "number" && !isNaN(total) ? total : 0,
        }));

      // Extract available years
      const years = new Set<number>();
      destinationSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.Year && typeof data.Year === "number") {
          years.add(data.Year);
        }
      });
      setAvailableYears(Array.from(years).sort((a, b) => a - b));

      setRadarData(radarDataArray);
      setRankedCountries(rankedList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setRadarData([]);
      setRankedCountries([]);
      setAvailableYears([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-gray-300">Loading ranking data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  // Medal emojis for top 3
  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Ranking Analysis
          </h1>
          <p className="text-gray-300 text-lg">
            Compare and rank emigrant destinations
          </p>
        </div>

        {/* Year Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Year:
          </label>
          <select
            value={selectedYear || "all"}
            onChange={(e) =>
              setSelectedYear(
                e.target.value === "all" ? "all" : parseInt(e.target.value)
              )
            }
            className="px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
          >
            <option value="all">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Radar Chart */}
        {radarData.length > 0 && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Top 5 Countries (Radar View)
            </h2>
            <div className="h-96">
              <ResponsiveRadar
                data={radarData}
                keys={["Total Emigrants"]}
                indexBy="category"
                valueFormat=">-.0f"
                margin={{ top: 70, right: 80, bottom: 70, left: 80 }}
                borderColor={{ from: "color" }}
                gridLabelOffset={36}
                dotSize={10}
                dotColor={{ theme: "background" }}
                dotBorderWidth={2}
                colors={{ scheme: "nivo" }}
                blendMode="multiply"
                motionConfig="gentle"
                theme={{
                  axis: {
                    domain: { line: { stroke: "#fff", strokeWidth: 1 } },
                    legend: { text: { fill: "#fff", fontSize: 14 } },
                    ticks: {
                      line: { stroke: "#fff", strokeWidth: 1 },
                      text: { fill: "#fff", fontSize: 12 },
                    },
                  },
                  legends: {
                    text: { fill: "#fff" },
                  },
                  grid: {
                    line: { stroke: "#fff", strokeWidth: 0.6, opacity: 0.4 },
                  },
                  labels: {
                    text: { fill: "#fff" },
                  },
                }}
                legends={[
                  {
                    anchor: "top-left",
                    direction: "column",
                    translateX: -50,
                    translateY: -40,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemTextColor: "#fff",
                    symbolSize: 12,
                    symbolShape: "circle",
                  },
                ]}
              />
            </div>
          </div>
        )}

        {/* Ranked Table */}
        {rankedCountries.length > 0 && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-white">
                Complete Rankings
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">Show:</label>
                <select
                  value={showCount}
                  onChange={(e) => setShowCount(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-primary text-white text-sm focus:ring-highlights focus:border-highlights"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={rankedCountries.length}>All Countries</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Country
                    </th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                      Total Emigrants
                    </th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankedCountries.slice(0, showCount).map((item, index) => {
                    const totalAll = rankedCountries.reduce(
                      (sum, c) => sum + c.total,
                      0
                    );
                    const percentage = ((item.total / totalAll) * 100).toFixed(
                      1
                    );
                    return (
                      <tr
                        key={item.country}
                        className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-bold">
                          {getMedal(index + 1)} {index + 1}
                        </td>
                        <td className="py-3 px-4 text-white">{item.country}</td>
                        <td className="py-3 px-4 text-white text-right font-semibold">
                          {item.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-highlights h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-300 text-sm w-12">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {rankedCountries.length === 0 && !loading && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 text-center">
            <p className="text-gray-400">No ranking data available</p>
          </div>
        )}
      </div>
    </div>
  );
}