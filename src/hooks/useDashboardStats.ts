import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface DashboardStats {
  totalCountries: number;
  totalProvinces: number;
  dataYears: string; // e.g., "1981-2020" or "No data"
  totalEmigrants: number;
  visualizationTypes: number;
  isLoading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCountries: 0,
    totalProvinces: 0,
    dataYears: "No data",
    totalEmigrants: 0,
    visualizationTypes: 7,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, isLoading: true, error: null }));

        // Fetch destination data - UPDATED: Use simpler collection path
        const destinationQuery = query(
          collection(db, "emigrantData_destination"),
          orderBy("Year")
        );
        const destinationSnapshot = await getDocs(destinationQuery);

        // Fetch origin province data - UPDATED: Use simpler collection path
        const provinceQuery = query(
          collection(db, "emigrantData_province"),
          orderBy("Year")
        );
        const provinceSnapshot = await getDocs(provinceQuery);

        // Fetch uploaded CSV files for additional stats
        const csvQuery = query(collection(db, "uploadedCSVFiles"));
        const csvSnapshot = await getDocs(csvQuery);

        // Process destination data - UPDATED: Handle nested structure
        // Data structure: { Year: 2020, "COUNTRY_NAME": { emigrants: 12345 }, ... }
        const destinationData = destinationSnapshot.docs.map((doc) =>
          doc.data()
        );
        const countries = new Set<string>();
        const years = new Set<number>();
        let totalEmigrants = 0;

        destinationData.forEach((data: any) => {
          years.add(data.Year);
          Object.entries(data).forEach(([key, value]) => {
            if (key === "Year") return;

            const emigrants =
              typeof value === "object" &&
              value !== null &&
              "emigrants" in value
                ? (value as { emigrants: number }).emigrants
                : null;

            if (emigrants && typeof emigrants === "number") {
              countries.add(key);
              totalEmigrants += emigrants;
            }
          });
        });

        // Process province data - UPDATED: Handle nested structure
        // Data structure: { Year: 2020, "PROVINCE_NAME": { emigrants: 12345 }, ... }
        const provinceData = provinceSnapshot.docs.map((doc) => doc.data());
        const provinces = new Set<string>();

        provinceData.forEach((data: any) => {
          Object.entries(data).forEach(([key, value]) => {
            if (key === "Year") return;

            const emigrants =
              typeof value === "object" &&
              value !== null &&
              "emigrants" in value
                ? (value as { emigrants: number }).emigrants
                : null;

            if (emigrants && typeof emigrants === "number") {
              provinces.add(key);
            }
          });
        });

        // Calculate years range
        const sortedYears = Array.from(years).sort();
        const yearRange =
          sortedYears.length > 0
            ? `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`
            : "No data";

        setStats({
          totalCountries: countries.size,
          totalProvinces: provinces.size,
          dataYears: yearRange,
          totalEmigrants: Math.round((totalEmigrants / 1000000) * 100) / 100, // Convert to millions
          visualizationTypes: 7,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch stats",
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};
