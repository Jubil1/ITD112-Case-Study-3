/**
 * CSV Converter for Filipino Emigrants Dashboard
 * Converts new clean wide-format CSVs to clean tall format
 *
 * Usage: node convert-csvs.js
 */

import fs from "fs";
import path from "path";

// Helper: Parse CSV line properly handling quoted fields with commas
function parseCSVLine(line) {
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
}

// Helper: Clean and parse numbers from CSV values
function cleanNumber(str) {
  if (!str || str.trim() === "") return null;

  // Remove quotes and leading/trailing spaces
  let cleaned = str.replace(/^["\s]+|["\s]+$/g, "");

  // Remove commas (thousands separators) and any remaining spaces
  cleaned = cleaned.replace(/[,\s]/g, "");

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Convert Age CSV (New Format)
function convertAgeCSV() {
  console.log("\n📊 Converting Age CSV...");
  const input = fs.readFileSync("Emigrant-1981-2020-Age (1).csv", "utf8");
  const lines = input.split("\n").filter((line) => line.trim());

  // Get years from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const years = headerParts.slice(1).map((y) => y.trim());

  const output = ["Year,Age_Group,Emigrants"];

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const ageGroup = parts[0].trim();

    years.forEach((year, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${ageGroup}",${value}`);
      }
    });
  }

  fs.writeFileSync("Age-Clean.csv", output.join("\n"));
  console.log("✅ Created: Age-Clean.csv");
}

// Convert Sex CSV (New Format)
function convertSexCSV() {
  console.log("\n👥 Converting Sex CSV...");
  const input = fs.readFileSync("Emigrant-1981-2020-Sex (1).csv", "utf8");
  const lines = input.split("\n").filter((line) => line.trim());

  // Get sex categories from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const sexCategories = headerParts.slice(1).map((cat) => cat.trim());

  const output = ["Year,Sex,Emigrants"];

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const year = parts[0].trim();
    if (!year || year === "") continue;

    sexCategories.forEach((sex, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${sex}",${value}`);
      }
    });
  }

  fs.writeFileSync("Sex-Clean.csv", output.join("\n"));
  console.log("✅ Created: Sex-Clean.csv");
}

// Convert All Countries CSV (New Format)
function convertCountriesCSV() {
  console.log("\n🌍 Converting Countries CSV (this may take a moment)...");
  const input = fs.readFileSync(
    "Emigrant-1981-2020-AllCountries (1).csv",
    "utf8"
  );
  const lines = input.split("\n").filter((line) => line.trim());

  // Get years from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const years = headerParts.slice(1).map((y) => y.trim());

  const output = ["Year,Country,Emigrants"];

  // Process each country row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const country = parts[0].trim();
    if (!country || country === "") continue;

    years.forEach((year, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${country}",${value}`);
      }
    });
  }

  fs.writeFileSync("Countries-Clean.csv", output.join("\n"));
  console.log("✅ Created: Countries-Clean.csv");
}

// Convert Education CSV (New Format)
function convertEducationCSV() {
  console.log("\n🎓 Converting Education CSV...");
  const input = fs.readFileSync("Emigrant-1988-2020-Educ (1).csv", "utf8");
  const lines = input.split("\n").filter((line) => line.trim());

  // Get years from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const years = headerParts.slice(1).map((y) => y.trim());

  const output = ["Year,Education_Level,Emigrants"];

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const educationLevel = parts[0].trim();
    if (!educationLevel || educationLevel === "") continue;

    years.forEach((year, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${educationLevel}",${value}`);
      }
    });
  }

  fs.writeFileSync("Education-Clean.csv", output.join("\n"));
  console.log("✅ Created: Education-Clean.csv");
}

// Convert Civil Status CSV (New Format)
function convertCivilStatusCSV() {
  console.log("\n💍 Converting Civil Status CSV...");
  const input = fs.readFileSync(
    "Emigrant-1988-2020-CivilStatus (1).csv",
    "utf8"
  );
  const lines = input.split("\n").filter((line) => line.trim());

  // Get civil status categories from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const civilStatusCategories = headerParts.slice(1).map((cat) => cat.trim());

  const output = ["Year,Civil_Status,Emigrants"];

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const year = parts[0].trim();
    if (!year || year === "") continue;

    civilStatusCategories.forEach((civilStatus, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${civilStatus}",${value}`);
      }
    });
  }

  fs.writeFileSync("CivilStatus-Clean.csv", output.join("\n"));
  console.log("✅ Created: CivilStatus-Clean.csv");
}

// Convert Place of Origin CSV (New Format)
function convertPlaceOfOriginCSV() {
  console.log("\n🏠 Converting Place of Origin CSV...");
  const input = fs.readFileSync(
    "Emigrant-1988-2020-PlaceOfOrigin (1).csv",
    "utf8"
  );
  const lines = input.split("\n").filter((line) => line.trim());

  // Get years from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const years = headerParts.slice(1).map((y) => y.trim());

  const output = ["Year,Region,Emigrants"];

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const region = parts[0].trim();
    if (!region || region === "") continue;

    years.forEach((year, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${region}",${value}`);
      }
    });
  }

  fs.writeFileSync("PlaceOfOrigin-Clean.csv", output.join("\n"));
  console.log("✅ Created: PlaceOfOrigin-Clean.csv");
}

// Convert Occupation CSV (New Format)
function convertOccupationCSV() {
  console.log("\n💼 Converting Occupation CSV...");
  const input = fs.readFileSync("Emigrant-1981-2020-Occu (1).csv", "utf8");
  const lines = input.split("\n").filter((line) => line.trim());

  // Get years from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const years = headerParts.slice(1).map((y) => y.trim());

  const output = ["Year,Occupation,Emigrants"];

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const occupation = parts[0].trim();
    if (!occupation || occupation === "") continue;

    years.forEach((year, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${occupation}",${value}`);
      }
    });
  }

  fs.writeFileSync("Occupation-Clean.csv", output.join("\n"));
  console.log("✅ Created: Occupation-Clean.csv");
}

// Convert Major Countries CSV (New Format)
function convertMajorCountriesCSV() {
  console.log("\n🌎 Converting Major Countries CSV...");
  const input = fs.readFileSync(
    "Emigrant-1981-2020-MajorCountry (1).csv",
    "utf8"
  );
  const lines = input.split("\n").filter((line) => line.trim());

  // Get years from header row
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  const years = headerParts.slice(1).map((y) => y.trim());

  const output = ["Year,Country,Emigrants"];

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const country = parts[0].trim();
    if (!country || country === "") continue;

    years.forEach((year, idx) => {
      const value = cleanNumber(parts[idx + 1]);
      if (value && value > 0) {
        output.push(`${year},"${country}",${value}`);
      }
    });
  }

  fs.writeFileSync("MajorCountries-Clean.csv", output.join("\n"));
  console.log("✅ Created: MajorCountries-Clean.csv");
}

// Main execution
console.log("🚀 CSV Converter Starting...\n");
console.log("This will create clean CSV files ready for upload.\n");

try {
  convertAgeCSV();
  convertSexCSV();
  convertCountriesCSV();
  convertEducationCSV();
  convertCivilStatusCSV();
  convertPlaceOfOriginCSV();
  convertOccupationCSV();
  convertMajorCountriesCSV();

  console.log("\n✨ All conversions complete!");
  console.log("\n📁 New files created:");
  console.log("   - Age-Clean.csv");
  console.log("   - Sex-Clean.csv");
  console.log("   - Countries-Clean.csv");
  console.log("   - Education-Clean.csv");
  console.log("   - CivilStatus-Clean.csv");
  console.log("   - PlaceOfOrigin-Clean.csv");
  console.log("   - Occupation-Clean.csv");
  console.log("   - MajorCountries-Clean.csv");
  console.log("\n📤 Upload these files via the /upload page in your app!");
} catch (error) {
  console.error("\n❌ Error:", error.message);
  console.error(
    "\nMake sure all CSV files are in the same directory as this script."
  );
}
