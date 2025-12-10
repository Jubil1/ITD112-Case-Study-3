import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import ChoroplethMap from "../components/charts/choroplethMap";
import PHOriginChoropleth from "../components/charts/originChoropleth";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useComparisonData } from "../hooks/useComparisonData";

export const Route = createFileRoute("/geographic")({
  component: GeographicVisualization,
});

const choroplethComponents = {
  destination: <ChoroplethMap />,
  origin: <PHOriginChoropleth />,
};

type ChoroplethKey = keyof typeof choroplethComponents;

function GeographicVisualization() {
  const [selectedMap, setSelectedMap] = useState<ChoroplethKey>("destination");
  const stats = useDashboardStats();
  const { data: topDestinations } = useComparisonData();

  // Ensure unique countries and take top 4
  const topFour = useMemo(() => {
    const unique = new Map<string, (typeof topDestinations)[0]>();
    topDestinations.forEach((item) => {
      if (!unique.has(item.country)) {
        unique.set(item.country, item);
      }
    });
    return Array.from(unique.values()).slice(0, 4);
  }, [topDestinations]);

  return (
    <div className="p-8 bg-primary min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            Geographic Visualization
          </h1>
          <p className="text-gray-300 text-base">
            Interactive choropleth maps showing Filipino emigrant data by destination countries and origin provinces
          </p>
        </div>

        {/* Map Type Selector - Simplified */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-gray-300">View:</span>
          <select
            value={selectedMap}
            onChange={(e) => setSelectedMap(e.target.value as ChoroplethKey)}
            className="p-2 border border-gray-600 rounded-lg text-white bg-secondary focus:ring-highlights focus:border-highlights"
          >
            <option value="destination">Destination Countries</option>
            <option value="origin">Origin Provinces</option>
          </select>
        </div>

        {/* Map Display */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-8">
          <div className="bg-primary rounded-lg p-4">
            {choroplethComponents[selectedMap]}
          </div>
        </div>

        {/* Statistics as Text Statements */}
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-base">
            Our database covers emigration data from <span className="text-highlights font-semibold">{stats.isLoading ? "..." : stats.totalCountries} countries</span> and <span className="text-highlights font-semibold">{stats.isLoading ? "..." : stats.totalProvinces} Philippine provinces</span>, spanning <span className="text-highlights font-semibold">{stats.isLoading ? "..." : stats.dataYears}</span> and tracking a total of <span className="text-highlights font-semibold">{stats.isLoading ? "..." : `${stats.totalEmigrants}M`} emigrants</span>.
          </p>

          <p className="text-base">
            The top destination countries for Filipino emigrants are {topFour.length > 0 ? (
              <>
                <span className="text-highlights font-semibold">{topFour[0]?.country}</span> ({typeof topFour[0]?.emigrants === "number" ? topFour[0].emigrants.toLocaleString() : "N/A"}),{" "}
                {topFour[1] && <><span className="text-highlights font-semibold">{topFour[1].country}</span> ({typeof topFour[1].emigrants === "number" ? topFour[1].emigrants.toLocaleString() : "N/A"}),{" "}</>}
                {topFour[2] && <><span className="text-highlights font-semibold">{topFour[2].country}</span> ({typeof topFour[2].emigrants === "number" ? topFour[2].emigrants.toLocaleString() : "N/A"}),{" "}</>}
                {topFour[3] && <>and <span className="text-highlights font-semibold">{topFour[3].country}</span> ({typeof topFour[3].emigrants === "number" ? topFour[3].emigrants.toLocaleString() : "N/A"})</>}.
              </>
            ) : "currently being loaded"}.
          </p>

          <p className="text-base">
            {selectedMap === "destination"
              ? "The map above visualizes emigrant distribution across destination countries, with darker shades indicating higher concentrations of Filipino emigrants."
              : "The map above shows emigrant origins within the Philippines, with darker regions representing provinces with higher emigration rates."}
          </p>
        </div>
      </div>
    </div>
  );
}