import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";

interface ComparisonData {
  country: string;
  emigrants: number;
  year: number;
}

interface UseComparisonDataReturn {
  data: ComparisonData[];
  loading: boolean;
  error: string | null;
  years: number[];
}

export const useComparisonData = (
  selectedYear?: number
): UseComparisonDataReturn => {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // UPDATED: Use simpler collection path
        const destinationQuery = query(
          collection(db, "emigrantData_destination"),
          orderBy("Year")
        );
        const snapshot = await getDocs(destinationQuery);

        const allData: ComparisonData[] = [];
        const availableYears = new Set<number>();

        // UPDATED: Handle nested structure
        // Data structure: { Year: 2020, "COUNTRY_NAME": { emigrants: 12345 }, ... }
        
        // If no year selected, aggregate by country across all years
        // Otherwise, show data for specific year
        const countryAggregates = new Map<string, { emigrants: number; year: number }>();
        
        snapshot.docs.forEach((doc) => {
          const docData = doc.data();
          const year = docData.Year;
          availableYears.add(year);

          if (!selectedYear || year === selectedYear) {
            Object.entries(docData).forEach(([key, value]) => {
              if (key === "Year") return;

              const emigrants =
                typeof value === "object" &&
                value !== null &&
                "emigrants" in value
                  ? (value as { emigrants: number }).emigrants
                  : null;

              if (emigrants && typeof emigrants === "number" && emigrants > 0) {
                if (selectedYear) {
                  // Specific year: create entry for that year
                  allData.push({
                    country: key,
                    emigrants: emigrants,
                    year: year,
                  });
                } else {
                  // No year selected: aggregate across all years
                  const existing = countryAggregates.get(key);
                  if (existing) {
                    existing.emigrants += emigrants;
                    // Keep the most recent year
                    if (year > existing.year) {
                      existing.year = year;
                    }
                  } else {
                    countryAggregates.set(key, {
                      emigrants: emigrants,
                      year: year,
                    });
                  }
                }
              }
            });
          }
        });

        // If aggregating, convert map to array
        if (!selectedYear) {
          countryAggregates.forEach((value, country) => {
            allData.push({
              country,
              emigrants: value.emigrants,
              year: value.year,
            });
          });
        }

        // Sort by emigrants count (descending) and take top 10
        const sortedData = allData
          .sort((a, b) => b.emigrants - a.emigrants)
          .slice(0, 10);

        setData(sortedData);
        setYears(Array.from(availableYears).sort());
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  return { data, loading, error, years };
};
