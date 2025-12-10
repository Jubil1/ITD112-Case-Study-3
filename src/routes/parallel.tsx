import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useYearFilter } from "../hooks/useYearFilter";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export const Route = createFileRoute("/parallel")({
  component: ParallelSetsPage,
});

// Cache for Firebase data
const dataCache = new Map<string, any[]>();
const cacheTimestamp = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000;

// Color palette for age groups
const AGE_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", 
  "#9b59b6", "#1abc9c", "#e67e22", "#34495e"
];

const EDUCATION_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"
];

function ParallelSetsPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<
    "destination-age" | "destination-education" | "age-education"
  >("destination-age");

  const { selectedYear, setSelectedYear } = useYearFilter();
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [countryLimit, setCountryLimit] = useState<number>(8);
  const [categoryLimit, setCategoryLimit] = useState<number>(8);
  const [excludedCountriesInput, setExcludedCountriesInput] = useState<string>("");

  const excludedCountries = useMemo(() => {
    return excludedCountriesInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [excludedCountriesInput]);

  const fetchCachedData = useCallback(async (collectionPath: string) => {
    const cacheKey = collectionPath;
    const now = Date.now();

    if (dataCache.has(cacheKey) && cacheTimestamp.has(cacheKey)) {
      const cacheAge = now - cacheTimestamp.get(cacheKey)!;
      if (cacheAge < CACHE_DURATION) {
        return dataCache.get(cacheKey)!;
      }
    }

    const q = query(collection(db, collectionPath), orderBy("Year"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.length > 0 ? snapshot.docs.map((doc) => doc.data()) : [];

    dataCache.set(cacheKey, data);
    cacheTimestamp.set(cacheKey, now);

    return data;
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedFlow, countryLimit, categoryLimit, excludedCountries]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [destinationData, ageData, educationData] = await Promise.all([
        fetchCachedData("emigrantData_destination"),
        fetchCachedData("emigrantData_age"),
        fetchCachedData("emigrantData_education"),
      ]);

      // Helper function to aggregate data by year filter
      const aggregateData = (data: any[], yearFilter: number | "all") => {
        const aggregated = new Map<string, number>();

        data.forEach((doc: any) => {
          if (yearFilter === "all" || doc.Year === yearFilter) {
            Object.entries(doc).forEach(([key, value]) => {
              if (key === "Year") return;

              const emigrants =
                typeof value === "object" &&
                value !== null &&
                "emigrants" in value
                  ? (value as { emigrants: number }).emigrants
                  : null;

              if (emigrants && typeof emigrants === "number" && emigrants > 0) {
                aggregated.set(key, (aggregated.get(key) || 0) + emigrants);
              }
            });
          }
        });

        return aggregated;
      };

      const destTotals = aggregateData(destinationData, selectedYear);
      const ageTotals = aggregateData(ageData, selectedYear);
      const eduTotals = aggregateData(educationData, selectedYear);

      let barData: any[] = [];

      if (selectedFlow === "destination-age") {
        // Get top destinations
        const topDestinations = Array.from(destTotals.entries())
          .filter(([country]) => !excludedCountries.includes(country))
          .sort(([, a], [, b]) => b - a)
          .slice(0, countryLimit);

        // Get top age groups
        const topAges = Array.from(ageTotals.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, categoryLimit);

        const totalAgeValue = topAges.reduce((sum, [, val]) => sum + val, 0);

        // Create stacked bar data
        topDestinations.forEach(([dest, destTotal]) => {
          const barItem: any = { destination: dest };

          topAges.forEach(([age, ageTotal]) => {
            const flowValue = (destTotal * ageTotal) / totalAgeValue;
            barItem[age] = Math.round(flowValue);
          });

          barData.push(barItem);
        });
      } else if (selectedFlow === "destination-education") {
        const topDestinations = Array.from(destTotals.entries())
          .filter(([country]) => !excludedCountries.includes(country))
          .sort(([, a], [, b]) => b - a)
          .slice(0, countryLimit);

        const topEducation = Array.from(eduTotals.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, categoryLimit);

        const totalEduValue = topEducation.reduce((sum, [, val]) => sum + val, 0);

        topDestinations.forEach(([dest, destTotal]) => {
          const barItem: any = { destination: dest };

          topEducation.forEach(([edu, eduTotal]) => {
            const flowValue = (destTotal * eduTotal) / totalEduValue;
            barItem[edu] = Math.round(flowValue);
          });

          barData.push(barItem);
        });
      } else if (selectedFlow === "age-education") {
        const topAges = Array.from(ageTotals.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, categoryLimit);

        const topEducation = Array.from(eduTotals.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, categoryLimit);

        const totalEduValue = topEducation.reduce((sum, [, val]) => sum + val, 0);

        topAges.forEach(([age, ageTotal]) => {
          const barItem: any = { destination: age };

          topEducation.forEach(([edu, eduTotal]) => {
            const flowValue = (ageTotal * eduTotal) / totalEduValue;
            barItem[edu] = Math.round(flowValue);
          });

          barData.push(barItem);
        });
      }

      // Extract available years
      const years = new Set<number>();
      [...destinationData, ...ageData, ...educationData].forEach((data: any) => {
        if (data.Year && typeof data.Year === "number") {
          years.add(data.Year);
        }
      });
      setAvailableYears(Array.from(years).sort((a, b) => a - b));

      setChartData(barData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setChartData([]);
      setAvailableYears([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-gray-300">Loading flow data...</div>
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

  // Get categories for bars based on selected flow
  const categories = chartData.length > 0 
    ? Object.keys(chartData[0]).filter(key => key !== "destination")
    : [];

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Flow/Process Analysis
          </h1>
          <p className="text-gray-300 text-lg">
            Visualize emigrant distribution across categories using stacked bar charts
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-secondary rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Select Year:
              </label>
              <select
                value={selectedYear || "all"}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value === "all" ? "all" : parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
              >
                <option value="all">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Select Flow Type:
              </label>
              <select
                value={selectedFlow}
                onChange={(e) => setSelectedFlow(e.target.value as any)}
                className="w-full px-4 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
              >
                <option value="destination-age">Destination → Age</option>
                <option value="destination-education">
                  Destination → Education
                </option>
                <option value="age-education">Age → Education</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Max Destinations: {countryLimit}
              </label>
              <input
                type="range"
                min={3}
                max={15}
                value={countryLimit}
                onChange={(e) => setCountryLimit(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Max Categories: {categoryLimit}
              </label>
              <input
                type="range"
                min={3}
                max={12}
                value={categoryLimit}
                onChange={(e) => setCategoryLimit(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Exclude Countries:
              </label>
              <input
                type="text"
                placeholder="e.g., USA, CANADA"
                value={excludedCountriesInput}
                onChange={(e) => setExcludedCountriesInput(e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
              />
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        {chartData.length > 0 && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Distribution Breakdown
            </h2>
            <div className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 80, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="destination"
                    stroke="#ffffff"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: "#ffffff", fontSize: 12 }}
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => value.toLocaleString()}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="square"
                  />
                  {categories.map((category, index) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      stackId="a"
                      fill={selectedFlow === "destination-education" || selectedFlow === "age-education" 
                        ? EDUCATION_COLORS[index % EDUCATION_COLORS.length]
                        : AGE_COLORS[index % AGE_COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Simple Explanation */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-3">
            How to Read This Chart
          </h3>
          <div className="text-gray-300 space-y-2">
            <p>
              • <strong>Each bar represents a destination/category:</strong> The total height shows the total number of emigrants
            </p>
            <p>
              • <strong>Colored segments show the breakdown:</strong> Each color represents a different age group or education level
            </p>
            <p>
              • <strong>Compare bars easily:</strong> Taller bars = more emigrants, segment sizes show distribution
            </p>
            <p>
              • <strong>Hover for details:</strong> Mouse over any segment to see exact numbers
            </p>
          </div>
        </div>

        {/* No Data Message */}
        {chartData.length === 0 && !loading && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 text-center">
            <p className="text-gray-400">No data available for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}