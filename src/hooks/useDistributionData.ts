import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface DistributionData {
  id: string;
  data: Array<{ x: number; y: number }>;
}

interface AgeDistributionData {
  age: string;
  count: number;
  percentage: number;
}

interface UseDistributionDataReturn {
  distributionData: DistributionData[];
  ageDistributionData: AgeDistributionData[];
  loading: boolean;
  error: string | null;
  years: number[];
  statistics: {
    mean: number;
    median: number;
    standardDeviation: number;
    range: number;
  };
}

export const useDistributionData = (
  selectedYear?: number
): UseDistributionDataReturn => {
  const [distributionData, setDistributionData] = useState<DistributionData[]>(
    []
  );
  const [ageDistributionData, setAgeDistributionData] = useState<
    AgeDistributionData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [statistics, setStatistics] = useState({
    mean: 0,
    median: 0,
    standardDeviation: 0,
    range: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch destination data - UPDATED: Use simpler collection path
        const destinationQuery = query(
          collection(db, "emigrantData_destination"),
          orderBy("Year")
        );
        const destinationSnapshot = await getDocs(destinationQuery);

        // Fetch age data - UPDATED: Use simpler collection path
        const ageQuery = query(
          collection(db, "emigrantData_age"),
          orderBy("Year")
        );
        const ageSnapshot = await getDocs(ageQuery);

        const destinationMap = new Map<string, Map<number, number>>();
        const ageMap = new Map<string, number>();
        const availableYears = new Set<number>();
        const allValues: number[] = [];

        // Process destination data - UPDATED: Handle nested structure
        // Data structure: { Year: 2020, "COUNTRY_NAME": { emigrants: 12345 }, ... }
        destinationSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          const year = docData.Year;
          availableYears.add(year);

          Object.entries(docData).forEach(([key, value]) => {
            if (key === "Year") return;

            const emigrants =
              typeof value === "object" && value !== null && "emigrants" in value
                ? (value as { emigrants: number }).emigrants
                : null;

            if (emigrants && typeof emigrants === "number" && emigrants > 0) {
              if (!destinationMap.has(key)) {
                destinationMap.set(key, new Map());
              }
              destinationMap.get(key)!.set(year, emigrants);

              if (!selectedYear || year === selectedYear) {
                allValues.push(emigrants);
              }
            }
          });
        });

        // Process age data - UPDATED: Handle nested structure
        // Data structure: { Year: 2020, "AGE_GROUP_NAME": { emigrants: 12345 }, ... }
        ageSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          const year = docData.Year;

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
                const currentValue = ageMap.get(key) || 0;
                ageMap.set(key, currentValue + emigrants);
              }
            });
          }
        });

        // Convert destination data to distribution format
        const distributionArray: DistributionData[] = [];
        destinationMap.forEach((yearData, country) => {
          const trendData = Array.from(yearData.entries())
            .sort(([a], [b]) => a - b)
            .map(([year, value]) => ({ x: year, y: value }));

          distributionArray.push({
            id: country,
            data: trendData,
          });
        });

        // Convert age data to distribution format
        const totalAgeCount = Array.from(ageMap.values()).reduce(
          (sum, count) => sum + count,
          0
        );
        const ageDistributionArray: AgeDistributionData[] = Array.from(
          ageMap.entries()
        )
          .map(([age, count]) => ({
            age,
            count,
            percentage: Math.round((count / totalAgeCount) * 100),
          }))
          .sort((a, b) => b.count - a.count);

        // Calculate statistics
        if (allValues.length > 0) {
          const sortedValues = [...allValues].sort((a, b) => a - b);
          const mean =
            allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
          const median =
            sortedValues.length % 2 === 0
              ? (sortedValues[sortedValues.length / 2 - 1] +
                  sortedValues[sortedValues.length / 2]) /
                2
              : sortedValues[Math.floor(sortedValues.length / 2)];
          const variance =
            allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            allValues.length;
          const standardDeviation = Math.sqrt(variance);
          const range = sortedValues[sortedValues.length - 1] - sortedValues[0];

          setStatistics({
            mean: Math.round(mean),
            median: Math.round(median),
            standardDeviation: Math.round(standardDeviation),
            range: Math.round(range),
          });
        }

        setDistributionData(
          distributionArray.sort(
            (a, b) =>
              b.data[b.data.length - 1]?.y - a.data[a.data.length - 1]?.y
          )
        );
        setAgeDistributionData(ageDistributionArray);
        setYears(Array.from(availableYears).sort());
      } catch (err) {
        console.error("Error fetching distribution data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  return {
    distributionData,
    ageDistributionData,
    loading,
    error,
    years,
    statistics,
  };
};
