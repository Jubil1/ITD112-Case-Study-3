import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Interface for CSV data structure
interface CSVData {
  fileName: string;
  headers: string[];
  data: Record<string, any>[];
  recordCount: number;
  uploadedAt: any;
  fileSize: number;
}

// Sample data structures for different CSV types (disabled)
/* const sampleCSVData = {
  destinationCountries: {
    fileName: "destination_countries_2020.csv",
    headers: ["Year", "Country", "Emigrants"],
    data: [
      { Year: 2020, Country: "UNITED STATES OF AMERICA", Emigrants: 1200000 },
      { Year: 2020, Country: "CANADA", Emigrants: 850000 },
      { Year: 2020, Country: "AUSTRALIA", Emigrants: 450000 },
      { Year: 2020, Country: "JAPAN", Emigrants: 280000 },
      { Year: 2020, Country: "UNITED KINGDOM", Emigrants: 180000 },
      { Year: 2020, Country: "NEW ZEALAND", Emigrants: 150000 },
      { Year: 2020, Country: "ITALY", Emigrants: 120000 },
      { Year: 2020, Country: "SOUTH KOREA", Emigrants: 95000 },
      { Year: 2020, Country: "GERMANY", Emigrants: 80000 },
      { Year: 2020, Country: "SPAIN", Emigrants: 65000 },
    ],
  },
  originProvinces: {
    fileName: "origin_provinces_2020.csv",
    headers: ["Year", "Province", "Emigrants"],
    data: [
      { Year: 2020, Province: "NCR", Emigrants: 250000 },
      { Year: 2020, Province: "CALABARZON", Emigrants: 180000 },
      { Year: 2020, Province: "CENTRAL LUZON", Emigrants: 150000 },
      { Year: 2020, Province: "WESTERN VISAYAS", Emigrants: 120000 },
      { Year: 2020, Province: "CENTRAL VISAYAS", Emigrants: 110000 },
      { Year: 2020, Province: "NORTHERN MINDANAO", Emigrants: 95000 },
      { Year: 2020, Province: "SOCCSKSARGEN", Emigrants: 85000 },
      { Year: 2020, Province: "DAVAO REGION", Emigrants: 80000 },
    ],
  },
  ageGroups: {
    fileName: "age_groups_2020.csv",
    headers: ["Year", "Age_Group", "Emigrants"],
    data: [
      { Year: 2020, Age_Group: "18-25", Emigrants: 450000 },
      { Year: 2020, Age_Group: "26-35", Emigrants: 800000 },
      { Year: 2020, Age_Group: "36-45", Emigrants: 600000 },
      { Year: 2020, Age_Group: "46-55", Emigrants: 400000 },
      { Year: 2020, Age_Group: "55+", Emigrants: 250000 },
    ],
  },
  genderDistribution: {
    fileName: "gender_distribution_2020.csv",
    headers: ["Year", "Gender", "Emigrants"],
    data: [
      { Year: 2020, Gender: "Male", Emigrants: 1300000 },
      { Year: 2020, Gender: "Female", Emigrants: 1200000 },
    ],
  },
  educationLevel: {
    fileName: "education_level_2020.csv",
    headers: ["Year", "Education_Level", "Emigrants"],
    data: [
      { Year: 2020, Education_Level: "High School", Emigrants: 600000 },
      { Year: 2020, Education_Level: "Bachelor's Degree", Emigrants: 800000 },
      { Year: 2020, Education_Level: "Master's Degree", Emigrants: 300000 },
      { Year: 2020, Education_Level: "PhD", Emigrants: 100000 },
      { Year: 2020, Education_Level: "Vocational", Emigrants: 200000 },
    ],
  },
  civilStatus: {
    fileName: "civil_status_2020.csv",
    headers: ["Year", "Civil_Status", "Emigrants"],
    data: [
      { Year: 2020, Civil_Status: "Single", Emigrants: 1000000 },
      { Year: 2020, Civil_Status: "Married", Emigrants: 1200000 },
      { Year: 2020, Civil_Status: "Divorced", Emigrants: 200000 },
      { Year: 2020, Civil_Status: "Widowed", Emigrants: 100000 },
    ],
  },
  incomeDistribution: {
    fileName: "income_distribution_2020.csv",
    headers: ["Year", "Income_Range", "Emigrants"],
    data: [
      { Year: 2020, Income_Range: "Below 30k", Emigrants: 400000 },
      { Year: 2020, Income_Range: "30k-50k", Emigrants: 600000 },
      { Year: 2020, Income_Range: "50k-80k", Emigrants: 800000 },
      { Year: 2020, Income_Range: "80k-120k", Emigrants: 500000 },
      { Year: 2020, Income_Range: "Above 120k", Emigrants: 200000 },
    ],
  },
  monthlyTrends: {
    fileName: "monthly_trends_2020.csv",
    headers: ["Year", "Month", "Emigrants"],
    data: [
      { Year: 2020, Month: "January", Emigrants: 180000 },
      { Year: 2020, Month: "February", Emigrants: 190000 },
      { Year: 2020, Month: "March", Emigrants: 200000 },
      { Year: 2020, Month: "April", Emigrants: 210000 },
      { Year: 2020, Month: "May", Emigrants: 220000 },
      { Year: 2020, Month: "June", Emigrants: 230000 },
      { Year: 2020, Month: "July", Emigrants: 240000 },
      { Year: 2020, Month: "August", Emigrants: 250000 },
      { Year: 2020, Month: "September", Emigrants: 260000 },
      { Year: 2020, Month: "October", Emigrants: 270000 },
      { Year: 2020, Month: "November", Emigrants: 280000 },
      { Year: 2020, Month: "December", Emigrants: 290000 },
    ],
  },
}; */

export const populateFirebaseWithCSVData = async () => {
  // Disabled per product decision: sample data population is removed.
  return;
};

// Function to parse actual CSV content
export const parseCSVContent = (
  csvContent: string,
  fileName: string
): CSVData => {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const data = lines
    .slice(1)
    .map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        // Try to parse as number if possible
        const value = values[index] || "";
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      return row;
    })
    .filter((row) => Object.values(row).some((value) => value !== ""));

  return {
    fileName,
    headers,
    data,
    recordCount: data.length,
    uploadedAt: serverTimestamp(),
    fileSize: csvContent.length,
  };
};

// Function to upload parsed CSV data
export const uploadParsedCSVData = async (csvData: CSVData) => {
  try {
    await addDoc(collection(db, "uploadedCSVFiles"), csvData);
    console.log(`✅ Successfully uploaded ${csvData.fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${csvData.fileName}:`, error);
    throw error;
  }
};

// Make functions available globally for easy access
if (typeof window !== "undefined") {
  (window as any).populateFirebaseWithCSVData = populateFirebaseWithCSVData;
  (window as any).parseCSVContent = parseCSVContent;
  (window as any).uploadParsedCSVData = uploadParsedCSVData;
}
