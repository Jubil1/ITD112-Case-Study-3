import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  AiOutlineUpload,
  AiOutlineFile,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setError("");
    setSuccess("");
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length });

      if (!file.name.endsWith(".csv")) {
        results.push({
          fileName: file.name,
          success: false,
          error: "Not a CSV file",
        });
        continue;
      }

      try {
        await uploadCSVFile(file);
        results.push({ fileName: file.name, success: true });
        setUploadedFiles((prev) => [...prev, file.name]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({
          fileName: file.name,
          success: false,
          error: errorMessage,
        });
      }
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    // Show results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (successful.length > 0) {
      setSuccess(
        `Successfully uploaded ${successful.length} file(s): ${successful.map((r) => r.fileName).join(", ")}`
      );
    }

    if (failed.length > 0) {
      const errorMessages = failed
        .map((r) => `${r.fileName}: ${r.error}`)
        .join("; ");
      setError(`Failed to upload ${failed.length} file(s): ${errorMessages}`);
    }
  };

  const uploadCSVFile = async (file: File) => {
    const text = await file.text();

    // Handle different line endings and remove empty lines
    const lines = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (lines.length === 0) {
      throw new Error("CSV file is empty or contains no valid data");
    }

    // Parse headers - handle quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).filter((h) => h !== "");

    if (headers.length === 0) {
      throw new Error("CSV file has no valid headers");
    }

    const data = lines
      .slice(1)
      .map((line) => {
        const values = parseCSVLine(line);
        const row: any = {};
        headers.forEach((header, index) => {
          // Only add non-empty values, use null for empty fields
          const value = values[index]?.trim();
          row[header] = value && value !== "" ? value : null;
        });
        return row;
      })
      .filter((row) => {
        // Only keep rows that have at least one non-null value
        return Object.values(row).some(
          (value) => value !== null && value !== ""
        );
      });

    if (data.length === 0) {
      throw new Error("No valid data rows found in CSV file");
    }

    // Upload raw CSV payload to uploadedCSVFiles for audit
    const uploadData = {
      fileName: file.name,
      headers: headers,
      data: data,
      recordCount: data.length,
      uploadedAt: serverTimestamp(),
      fileSize: file.size,
      uploadStatus: "completed",
      processedAt: serverTimestamp(),
    };

    // Validate that uploadData doesn't contain empty fields
    const validatedData = Object.fromEntries(
      Object.entries(uploadData).filter(([, value]) => {
        if (value === null || value === undefined) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        return true;
      })
    );

    await addDoc(collection(db, "uploadedCSVFiles"), validatedData);

    // Also transform and persist into the collections used by visualizations
    const lowerName = file.name.toLowerCase();

    // Detect tall vs wide format and pivot if needed
    const headerSet = new Set(headers.map((h) => (h || "").trim()));
    const possibleDimensionHeaders = [
      "Country",
      "Province",
      "Region",
      "Age",
      "Age_Group",
      "Gender",
      "Sex",
      "Civil_Status",
      "Month",
      "Education_Level", // ADDED: Education-specific dimension
      "Education",
      "Occupation",
    ];
    const possibleValueHeaders = ["Emigrants", "Count", "Value", "Total"];

    const dimensionHeader = possibleDimensionHeaders.find((h) =>
      headerSet.has(h)
    );
    const valueHeader = possibleValueHeaders.find((h) => headerSet.has(h));

    console.log("🔍 Upload detection:", {
      fileName: file.name,
      headers,
      dimensionHeader,
      valueHeader,
      isTallFormat: !!(dimensionHeader && valueHeader),
    });

    const byYear = new Map<number, Record<string, number | string>>();

    const upcase = (s: any) =>
      String(s ?? "")
        .trim()
        .toUpperCase();
    const normalizeLabel = (raw: any) =>
      upcase(raw).replace(/\s+/g, " ").trim();

    if (dimensionHeader && valueHeader) {
      // Tall format: e.g., Year, Country, Emigrants OR Year, Education_Level, Emigrants
      console.log(
        `📊 Processing tall format with dimension: ${dimensionHeader}`
      );

      data.forEach((row: any) => {
        const year = Number(row.Year ?? row.year);
        if (!year || Number.isNaN(year)) return;
        const labelRaw = row[dimensionHeader];
        const valueRaw = row[valueHeader];
        const label = normalizeLabel(labelRaw);
        const value = Number(valueRaw);
        if (!label || !Number.isFinite(value)) return;

        if (!byYear.has(year)) byYear.set(year, { Year: year });
        const target = byYear.get(year)!;
        const current =
          typeof target[label] === "number" ? (target[label] as number) : 0;
        target[label] = current + value;
      });

      console.log(
        `✅ Transformed ${data.length} rows into ${byYear.size} year records`
      );
      if (byYear.size > 0) {
        const firstYear = Array.from(byYear.values())[0];
        console.log("📋 Sample year record:", firstYear);
      }
    } else {
      // Wide format: per-year row already has many numeric columns
      console.log("📊 Processing wide format");

      data.forEach((row: any) => {
        const year = Number(row.Year ?? row.year);
        if (!year || Number.isNaN(year)) return;
        if (!byYear.has(year)) byYear.set(year, { Year: year });
        const target = byYear.get(year)!;
        Object.entries(row).forEach(([k, v]) => {
          const key = String(k).trim();
          if (key.toLowerCase() === "year") return;
          const n = typeof v === "number" ? v : Number(v);
          if (!Number.isFinite(n)) return;
          target[normalizeLabel(key)] = n;
        });
      });
    }

    // Choose target collection based on file name or detected dimension
    const dim = (dimensionHeader || "").toLowerCase();
    let targetCollection: string | null = null;

    console.log("🔍 Detection details:", {
      fileName: file.name,
      lowerName,
      dimensionHeader,
      dim,
      headerSet: Array.from(headerSet),
    });

    // Enhanced detection logic - now uses simpler paths
    if (
      lowerName.includes("destination") ||
      lowerName.includes("countries") ||
      lowerName.includes("country") ||
      dim === "country"
    ) {
      targetCollection = "emigrantData_destination";
      console.log("✅ Detected as DESTINATION data");
    } else if (
      lowerName.includes("origin") ||
      lowerName.includes("province") ||
      dim === "province" ||
      dim === "region"
    ) {
      targetCollection = "emigrantData_province";
      console.log("✅ Detected as PROVINCE data");
    } else if (
      lowerName.includes("age") ||
      dim === "age" ||
      dim === "age_group"
    ) {
      targetCollection = "emigrantData_age";
      console.log("✅ Detected as AGE data");
    } else if (
      lowerName.includes("gender") ||
      lowerName.includes("sex") ||
      dim === "gender" ||
      dim === "sex"
    ) {
      targetCollection = "emigrantData_sex";
      console.log("✅ Detected as GENDER/SEX data");
    } else if (lowerName.includes("civil") || dim === "civil_status") {
      targetCollection = "emigrantData_civilStatus";
      console.log("✅ Detected as CIVIL STATUS data");
    } else if (
      lowerName.includes("education") ||
      lowerName.includes("educ") ||
      dim === "education" ||
      dim === "education_level"
    ) {
      targetCollection = "emigrantData_education";
      console.log("✅ Detected as EDUCATION data");
    } else if (
      lowerName.includes("occupation") ||
      lowerName.includes("occu") ||
      dim === "occupation"
    ) {
      targetCollection = "emigrantData_occupation";
      console.log("✅ Detected as OCCUPATION data");
    }

    console.log("🎯 Target collection:", targetCollection);

    if (targetCollection) {
      for (const docData of byYear.values()) {
        const yearId = String(docData.Year);

        // Transform data structure for relationship visualizations
        const transformedData: Record<string, any> = { Year: docData.Year };

        Object.entries(docData).forEach(([key, value]) => {
          if (key === "Year") return;

          // Store as nested object with 'emigrants' property
          transformedData[key] = {
            emigrants: value,
          };
        });

        console.log(`📝 Writing to ${targetCollection}/${yearId}:`, {
          year: yearId,
          fieldCount: Object.keys(transformedData).length - 1,
          sampleFields: Object.keys(transformedData)
            .filter((k) => k !== "Year")
            .slice(0, 3),
        });

        await setDoc(doc(db, targetCollection, yearId), transformedData, {
          merge: true,
        });
      }
      console.log(
        `✅ Successfully uploaded ${byYear.size} year documents to ${targetCollection}`
      );
    } else {
      console.warn("⚠️ No target collection matched for this file");
      console.warn(
        "💡 Ensure filename contains: age, education, countries/destination, gender/sex, civil, occupation, or province/origin"
      );
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const addCivilStatus2020 = async () => {
    setError("");
    setSuccess("");
    try {
      const payload = {
        Year: 2020,
        SINGLE: 1000000,
        MARRIED: 1200000,
        DIVORCED: 200000,
        WIDOWED: 100000,
      } as const;
      await setDoc(
        doc(db, "emigrantData_civilStatus", String(payload.Year)),
        payload,
        { merge: true }
      );
      setSuccess("Added civilStatus 2020 document successfully.");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(`Failed to add civilStatus 2020: ${message}`);
    }
  };

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Upload CSV Data
          </h1>
          <p className="text-gray-300 text-lg">
            Upload CSV files to populate the Firebase database
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-secondary rounded-lg p-8 border border-gray-700 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-highlights bg-highlights/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="flex flex-col items-center">
              <AiOutlineUpload className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Drop CSV files here or click to browse
              </h3>
              <p className="text-gray-400 mb-6">
                Supports multiple CSV files. Each file will be processed and
                stored in Firebase.
              </p>
              <button
                onClick={triggerFileInput}
                disabled={uploading}
                className="bg-highlights text-white px-6 py-3 rounded-lg hover:bg-highlights/90 disabled:opacity-50 transition-colors"
              >
                {uploading ? "Uploading..." : "Choose Files"}
              </button>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={addCivilStatus2020}
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Add Civil Status 2020 (manual)
                </button>
              </div>

              {uploading && uploadProgress.total > 0 && (
                <div className="mt-4 w-full max-w-md">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Uploading files...</span>
                    <span>
                      {uploadProgress.current} / {uploadProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-highlights h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 mb-6">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Uploaded Files
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((fileName, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-primary rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <AiOutlineFile className="text-highlights text-xl" />
                    <span className="text-white">{fileName}</span>
                  </div>
                  <AiOutlineCheckCircle className="text-green-500 text-xl" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            Upload Instructions
          </h3>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">
                CSV Format Requirements:
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>First row must contain column headers</li>
                <li>Data should be comma-separated</li>
                <li>No empty rows between data</li>
                <li>File size limit: 10MB per file</li>
                <li>
                  Supports both tall format (Year, Dimension, Value) and wide
                  format (Year, Col1, Col2...)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">
                Supported Data Types:
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Destination Countries Data</li>
                <li>Origin Provinces Data</li>
                <li>Age Group Data</li>
                <li>Gender Distribution Data</li>
                <li>Education Level Data (tall or wide format)</li>
                <li>Income Distribution Data</li>
                <li>Civil Status Data</li>
                <li>Custom emigrant data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Processing:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Files are automatically processed and validated</li>
                <li>Data is stored in Firebase Firestore</li>
                <li>Charts will update automatically with new data</li>
                <li>Duplicate files will be overwritten</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample CSV Structure */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mt-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Sample CSV Structure
          </h3>
          <div className="bg-primary rounded-lg p-4 overflow-x-auto">
            <pre className="text-gray-300 text-sm">
              {`Tall Format:
Year,Education_Level,Emigrants
2020,College Graduate,1200000
2020,High School Graduate,850000
2020,Elementary Level,450000

Wide Format:
Year,College Graduate,High School Graduate,Elementary Level
2020,1200000,850000,450000`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
