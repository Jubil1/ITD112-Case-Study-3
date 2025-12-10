import { useCallback, useMemo } from "react";
import { ResponsiveChoropleth } from "@nivo/geo";
import { useParseOriginProvinceData } from "../../hooks/useParseOriginProvinceData";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useGeoJSON } from "../../hooks/useGeoJSON";
import { useYearFilter } from "../../hooks/useYearFilter";
import LoadingScreen from "../loadingScreen";
import normalizeProvinceName from "../../utils/normalizeProvince";

const normalizeName = (s: string) => normalizeProvinceName(s);

const regionToProvinces: Record<string, string[]> = {
  "REGION I ILOCOS REGION": [
    "Ilocos Norte",
    "Ilocos Sur",
    "La Union",
    "Pangasinan",
  ],
  "REGION II CAGAYAN VALLEY": [
    "Batanes",
    "Cagayan",
    "Isabela",
    "Nueva Vizcaya",
    "Quirino",
  ],
  "REGION III CENTRAL LUZON": [
    "Aurora",
    "Bataan",
    "Bulacan",
    "Nueva Ecija",
    "Pampanga",
    "Tarlac",
    "Zambales",
  ],
  "REGION IV A CALABARZON": ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"],
  "REGION IV B MIMAROPA": [
    "Marinduque",
    "Occidental Mindoro",
    "Oriental Mindoro",
    "Palawan",
    "Romblon",
  ],
  "REGION V BICOL REGION": [
    "Albay",
    "Camarines Norte",
    "Camarines Sur",
    "Catanduanes",
    "Masbate",
    "Sorsogon",
  ],
  "REGION VI WESTERN VISAYAS": [
    "Aklan",
    "Antique",
    "Capiz",
    "Guimaras",
    "Iloilo",
    "Negros Occidental",
  ],
  "REGION VII CENTRAL VISAYAS": [
    "Bohol",
    "Cebu",
    "Negros Oriental",
    "Siquijor",
  ],
  "REGION VIII EASTERN VISAYAS": [
    "Biliran",
    "Eastern Samar",
    "Leyte",
    "Northern Samar",
    "Samar",
    "Southern Leyte",
  ],
  "REGION IX ZAMBOANGA PENINSULA": [
    "Zamboanga del Norte",
    "Zamboanga del Sur",
    "Zamboanga Sibugay",
  ],
  "REGION X NORTHERN MINDANAO": [
    "Bukidnon",
    "Camiguin",
    "Lanao del Norte",
    "Misamis Occidental",
    "Misamis Oriental",
  ],
  "REGION XI DAVAO REGION": [
    "Davao de Oro",
    "Davao del Norte",
    "Davao del Sur",
    "Davao Occidental",
    "Davao Oriental",
  ],
  "REGION XII SOCCSKSARGEN": [
    "Cotabato",
    "Sarangani",
    "South Cotabato",
    "Sultan Kudarat",
  ],
  "REGION XIII CARAGA": [
    "Agusan del Norte",
    "Agusan del Sur",
    "Dinagat Islands",
    "Surigao del Norte",
    "Surigao del Sur",
  ],
  "CORDILLERA ADMINISTRATIVE REGION": [
    "Abra",
    "Apayao",
    "Benguet",
    "Ifugao",
    "Kalinga",
    "Mountain Province",
  ],
  "NATIONAL CAPITAL REGION": ["Metro Manila"],
  "AUTONOMOUS REGION IN MUSLIM MINDANAO": [
    "Basilan",
    "Lanao del Sur",
    "Maguindanao del Norte",
    "Maguindanao del Sur",
    "Sulu",
    "Tawi-Tawi",
  ],
};

const PHOriginChoropleth = () => {
  const { selectedYear, onSelectChange } = useYearFilter("all");
  const {
    totals,
    years,
    loading,
    error: dataError,
  } = useParseOriginProvinceData(selectedYear);
  const isMobile = useIsMobile();

  const transform = useCallback((fc: any) => {
    const seen = new Set<string>();
    return (fc?.features || [])
      .filter(
        (feat: any) =>
          (feat?.properties?.ENGTYPE_1 || "").toUpperCase() === "PROVINCE" &&
          feat?.properties?.PROVINCE
      )
      .map((feat: any) => {
        const normalizedId = normalizeName(feat.properties.PROVINCE);
        if (seen.has(normalizedId)) {
          console.warn(`Duplicate province: ${feat.properties.PROVINCE}`);
          return null;
        }
        seen.add(normalizedId);
        return {
          ...feat,
          id: normalizedId,
        };
      })
      .filter((feat: any) => feat !== null);
  }, []);

  const {
    data: features,
    loading: geoLoading,
    error: geoError,
  } = useGeoJSON<any[]>("/data/Provinces.json", transform);

  const { provinceData, min, max } = useMemo(() => {
    console.log("📊 Raw totals from hook:", totals);

    const provinceMap: Record<string, number> = {};

    Object.entries(totals).forEach(([key, value]) => {
      console.log(`Processing key: "${key}" with value: ${value}`);

      const provinces = regionToProvinces[key];

      if (provinces && provinces.length > 0) {
        const valuePerProvince = value / provinces.length;
        provinces.forEach((province) => {
          const normalizedKey = normalizeName(province);
          provinceMap[normalizedKey] =
            (provinceMap[normalizedKey] || 0) + valuePerProvince;
        });
        console.log(
          `✅ Distributed "${key}" across ${provinces.length} provinces (${valuePerProvince.toFixed(2)} each)`
        );
      } else {
        const normalizedKey = normalizeName(key);
        provinceMap[normalizedKey] = (provinceMap[normalizedKey] || 0) + value;
        console.log(
          `⚠️ Treating "${key}" as direct province: ${normalizedKey}`
        );
      }
    });

    console.log("📍 Final province map:", provinceMap);

    const values = Object.values(provinceMap);
    return {
      provinceData: provinceMap,
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 100,
    };
  }, [totals]);

  if (geoError)
    return <div className="text-red-500 p-6">Error: {geoError}</div>;
  if (dataError)
    return <div className="text-red-500 p-6">Error: {dataError}</div>;
  if (loading || geoLoading || !features) return <LoadingScreen />;

  const data = Object.entries(provinceData).map(([name, total]) => ({
    id: name,
    value: total,
    total,
  }));

  console.log("🗺️ Map data:", data);
  console.log("🗺️ Features count:", features.length);
  console.log("🗺️ Feature IDs:", features.map((f: any) => f.id).slice(0, 10));

  return (
    <div className="bg-primary rounded-lg shadow-md p-6 border-2 border-highlights">
      <h2 className="text-lg text-center font-inter text-stroke text-white mb-4">
        {selectedYear === "all"
          ? "Emigrant Origin Density by Province (1988 - 2020)"
          : `Emigrant Origin Density by Province in ${selectedYear}`}
      </h2>

      <div className="mb-4 flex justify-center">
        <select
          value={selectedYear}
          onChange={onSelectChange}
          className="px-4 py-2 bg-secondary border border-highlights rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
        >
          <option value="all">All Years (1988-2020)</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className={isMobile ? "overflow-x-auto" : ""}>
        <div style={{ width: isMobile ? "600px" : "100%", height: "600px" }}>
          <ResponsiveChoropleth
            data={data}
            features={features}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            colors={["#1a0a2e", "#4c1d95", "#6d28d9", "#a855f7", "#d8b4fe"]}
            domain={[min, max]}
            unknownColor="#2d1b4e"
            label="properties.PROVINCE"
            valueFormat={(v) => Number(v).toLocaleString()}
            tooltip={({ feature }: any) => (
              <div
                style={{
                  background: "#2d1b4e",
                  border: "1px solid #a855f7",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "#ffffff",
                }}
              >
                <strong>{feature.properties?.PROVINCE}</strong>
                <br />
                ID: {feature.id}
                <br />
                Total: {feature.data?.total?.toLocaleString() || "N/A"}
              </div>
            )}
            projectionScale={2000}
            projectionTranslation={[0.5, 0.72]}
            projectionRotation={[-122, -8.5, 0]}
            enableGraticule={false}
            borderWidth={0.5}
            borderColor="#a855f7"
          />
        </div>
      </div>
    </div>
  );
};

export default PHOriginChoropleth;