import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useDashboardStats } from "../hooks/useDashboardStats";

export const Route = createFileRoute("/")({
  component: Index,
});

const visualizationLinks = [
  { name: "Geographic Visualization", path: "/geographic", description: "Interactive choropleth maps" },
  { name: "Comparison Charts", path: "/comparison", description: "Compare data across categories" },
  { name: "Composition Charts", path: "/composition", description: "View data composition" },
  { name: "Trend Analysis", path: "/trends", description: "Analyze trends over time" },
  { name: "Distribution Charts", path: "/distribution", description: "Visualize distribution patterns" },
  { name: "Relationship Analysis", path: "/relationships", description: "Explore correlations" },
  { name: "Ranking", path: "/radar", description: "Compare multiple dimensions" },
  { name: "Flow/Process", path: "/parallel", description: "Visualize data flow" },
  { name: "Upload Data", path: "/upload", description: "Upload CSV files" },
  { name: "Data Management", path: "/crud", description: "Manage data records" },
];

function Index() {
  const stats = useDashboardStats();

  if (stats.isLoading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading dashboard data...</div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-red-400">
          Error loading dashboard: {stats.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-primary min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Introduction Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome to the Filipino Emigration Dashboard
          </h1>
          <div className="text-gray-300 text-lg leading-relaxed space-y-4">
            <p>
              This comprehensive dashboard provides detailed insights into Filipino emigration patterns 
              spanning from 1982 to 2020. Our dataset covers {stats.totalCountries} countries and tracks 
              the movement of {stats.totalEmigrants}M Filipino emigrants across nearly four decades.
            </p>
            <p>
              Through various visualization tools and analytical methods, you can explore demographic 
              trends, geographic distributions, and key factors influencing Filipino emigration. 
              Each visualization offers unique perspectives on this significant socioeconomic phenomenon.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12 pb-8 border-b border-gray-700">
          <div className="text-center">
            <div className="text-4xl font-bold text-highlights mb-2">{stats.totalCountries}</div>
            <div className="text-gray-400 text-sm">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-highlights mb-2">{stats.dataYears}</div>
            <div className="text-gray-400 text-sm">Years of Data</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-highlights mb-2">{stats.totalEmigrants}M</div>
            <div className="text-gray-400 text-sm">Total Emigrants</div>
          </div>
        </div>

        {/* Visualizations Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Explore Visualizations
          </h2>
          <div className="space-y-3">
            {visualizationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block group"
              >
                <div className="flex items-baseline justify-between p-4 rounded-lg bg-secondary/50 border border-gray-700 hover:border-highlights hover:bg-secondary transition-all duration-300">
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-medium text-white group-hover:text-highlights transition-colors">
                      {link.name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {link.description}
                    </span>
                  </div>
                  <span className="text-highlights opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}