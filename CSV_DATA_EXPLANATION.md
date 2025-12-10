# CSV Data Files Explanation

## Understanding Your Emigrant Data Files

---

## 📊 File 1: `Emigrant-1981-2020-AllCountries (1).csv`

### Structure

- **Rows:** Each row = a destination country
- **Columns:**
  - First column: `COUNTRY` (destination name)
  - Remaining columns: Years from 1981 to 2020
- **Values:** Number of Filipino emigrants who went to that country in that year

### Example Reading:

```
Row: AUSTRALIA, 2752, 2931, 2608, ...
Means:
- 1981: 2,752 Filipinos emigrated to Australia
- 1982: 2,931 Filipinos emigrated to Australia
- 1983: 2,608 Filipinos emigrated to Australia
- etc.
```

### Key Observations:

- **177 countries** listed (including Philippines itself with 0)
- **40 years** of data (1981-2020)
- Most countries have 0 or very low numbers
- Major destinations: USA, Canada, Japan, Australia, etc.

---

## 📊 File 2: `Emigrant-1981-2020-MajorCountry (1).csv`

### Structure

- **Rows:** Each row = a year (1981-2020)
- **Columns:**
  - First column: `YEAR`
  - Remaining columns: Major destination countries (USA, CANADA, JAPAN, etc.)
  - Last column: `OTHERS` (all other countries combined)
- **Values:** Number of Filipino emigrants who went to that country in that year

### Example Reading:

```
Row: 1981, 40307, 5226, 254, 2752, ...
Means:
- 1981: 40,307 Filipinos went to USA
- 1981: 5,226 Filipinos went to Canada
- 1981: 254 Filipinos went to Japan
- 1981: 2,752 Filipinos went to Australia
- etc.
```

### Key Observations:

- **41 rows** (header + 40 years)
- **11 major destinations** tracked separately
- **OTHERS column** aggregates all remaining countries
- USA dominates most years
- Shows trends over time clearly

---

## 🤔 Why "Emigrant" and Not "Immigrant"?

### The Key Difference:

| Term          | Perspective                          | Meaning                               |
| ------------- | ------------------------------------ | ------------------------------------- |
| **EMIGRANT**  | From origin country (Philippines)    | Person **LEAVING** their home country |
| **IMMIGRANT** | From destination country (USA, etc.) | Person **ARRIVING** in a new country  |

### Real-World Example:

**A Filipino moving to USA:**

- From **Philippines' perspective**: They are an **EMIGRANT** (leaving Philippines)
- From **USA's perspective**: They are an **IMMIGRANT** (arriving in USA)

**Same person, different terms depending on viewpoint!**

---

## 📍 What This Data Represents

### Your Data Tracks:

✅ **Filipinos LEAVING the Philippines**  
✅ **Going TO destination countries**  
✅ **From Philippines' perspective** (emigration statistics)

### The Data Shows:

1. **Where Filipinos are going** (destination countries)
2. **How many are going** (emigrant counts)
3. **When they're going** (yearly trends)
4. **Popular destinations** (USA, Canada, Japan, etc.)

---

## 📈 Data Interpretation Examples

### From AllCountries File:

**USA Row:**

```
UNITED STATES OF AMERICA, 40307, 44438, 34794, ...
```

- 1981: 40,307 Filipinos left Philippines → went to USA
- 1982: 44,438 Filipinos left Philippines → went to USA
- 1983: 34,794 Filipinos left Philippines → went to USA

**Australia Row:**

```
AUSTRALIA, 2752, 2931, 2608, ...
```

- 1981: 2,752 Filipinos left Philippines → went to Australia
- 1982: 2,931 Filipinos left Philippines → went to Australia

### From MajorCountry File:

**1981 Row:**

```
1981, 40307, 5226, 254, 2752, 4, 12, 88, 45, 14, 8, 157
```

- Total Filipinos who emigrated in 1981: ~50,000+
- Breakdown:
  - USA: 40,307 (largest)
  - Canada: 5,226
  - Japan: 254
  - Australia: 2,752
  - Others: 157

**2020 Row:**

```
2020, 6539, 4579, 1100, 777, 232, 477, 442, 304, 219, 162, 872
```

- Total Filipinos who emigrated in 2020: ~15,000+
- Notice: Much lower than 1981 (likely due to COVID-19 pandemic)

---

## 🗺️ Data Flow Visualization

```
┌─────────────────┐
│   PHILIPPINES   │  (Origin Country)
│                 │
│  Filipino       │
│  Citizens       │
└────────┬────────┘
         │
         │ EMIGRATION (Leaving)
         │
         ▼
    ┌─────────┐
    │ Numbers │  (Your CSV Data)
    │ 40,307  │  = Filipinos going to USA in 1981
    │  5,226  │  = Filipinos going to Canada in 1981
    │  2,752  │  = Filipinos going to Australia in 1981
    └────┬────┘
         │
         │ ARRIVAL
         │
         ▼
┌─────────────────┐
│  DESTINATION    │  (USA, Canada, etc.)
│  COUNTRIES      │
│                 │
│  These people   │
│  become         │
│  IMMIGRANTS     │
│  (from that     │
│  country's      │
│  perspective)   │
└─────────────────┘
```

---

## 📊 Why This Data Structure?

### AllCountries File (Wide Format):

**Best for:**

- ✅ Comparing destinations side-by-side
- ✅ Finding specific country data
- ✅ Geographic analysis
- ✅ Filtering by country

**Format:**

```
COUNTRY | 1981 | 1982 | 1983 | ...
USA     | 40307| 44438| 34794| ...
CANADA  | 5226 | 4898 | 3946 | ...
```

### MajorCountry File (Time Series):

**Best for:**

- ✅ Analyzing trends over time
- ✅ Comparing years
- ✅ Seeing growth/decline patterns
- ✅ Quick overview of major destinations

**Format:**

```
YEAR | USA   | CANADA | JAPAN | ...
1981 | 40307 | 5226   | 254   | ...
1982 | 44438 | 4898   | 310   | ...
```

---

## 🔍 Key Insights from Your Data

### 1. **USA is the Dominant Destination**

- Consistently highest numbers across all years
- 1981: 40,307 emigrants
- Peak years: 2006 (49,522), 2010 (42,007)

### 2. **Major Destinations (Top 5 typically):**

1. **USA** - 30,000-50,000 per year
2. **Canada** - 5,000-35,000 per year
3. **Japan** - 1,000-10,000 per year
4. **Australia** - 2,000-5,000 per year
5. **Italy** - 200-4,500 per year

### 3. **Trends Over Time:**

- **1980s-1990s:** Steady growth
- **2000s:** Peak emigration years
- **2010s:** Continued high numbers
- **2020:** Significant drop (COVID-19 impact)

### 4. **Geographic Patterns:**

- **English-speaking countries** dominate (USA, Canada, Australia, UK)
- **Asian countries** also popular (Japan, South Korea)
- **European countries** growing (Italy, Spain, Germany)

---

## 💡 Common Questions Answered

### Q: Why is Philippines listed with 0?

**A:** Because this tracks people LEAVING Philippines. You can't emigrate to your own country!

### Q: Why are some countries 0?

**A:** Either no Filipinos emigrated there, or the numbers were too small to track separately (might be in "OTHERS" column).

### Q: Are these permanent moves?

**A:** The data doesn't specify, but typically emigration statistics track people who left with intent to stay abroad (work visas, permanent residency, etc.).

### Q: Why 2020 numbers are lower?

**A:** Likely due to:

- COVID-19 travel restrictions
- Closed borders
- Reduced visa processing
- Economic uncertainty

---

## 🔄 How This Relates to Your Dashboard

### Your Dashboard Uses This Data For:

1. **Geographic Visualization** (`/geographic`)
   - Shows world map with countries colored by emigrant count
   - Uses AllCountries data

2. **Comparison Charts** (`/comparison`)
   - Ranks countries by emigrant numbers
   - Shows USA vs Canada vs Japan, etc.

3. **Trend Analysis** (`/trends`)
   - Shows how emigration to each country changed over time
   - Uses MajorCountry data structure

4. **Composition Charts** (`/composition`)
   - Shows what percentage goes to each country
   - USA might be 60%, Canada 15%, etc.

---

## 📝 Data Format for Upload

### Current Format (Wide):

```csv
COUNTRY,1981,1982,1983,...
USA,40307,44438,34794,...
```

### Converted Format (for Upload):

Your upload system can handle this, but it might be easier to convert to:

**Tall Format:**

```csv
Year,Country,Emigrants
1981,USA,40307
1981,CANADA,5226
1982,USA,44438
1982,CANADA,4898
```

**Or Wide Format (per year):**

```csv
Year,USA,CANADA,JAPAN,AUSTRALIA
1981,40307,5226,254,2752
1982,44438,4898,310,2931
```

---

## 🎯 Summary

### What the Data Is:

- ✅ **Filipino emigration statistics** (1981-2020)
- ✅ **Destination countries** (where they went)
- ✅ **Yearly counts** (how many per year)
- ✅ **From Philippines' perspective** (tracking people leaving)

### Why "Emigrant":

- ✅ Because these are people **LEAVING** Philippines
- ✅ From Philippines' viewpoint, they're **emigrants**
- ✅ From destination countries' viewpoint, they're **immigrants**
- ✅ Same people, different terminology based on perspective

### The Numbers Mean:

- **40,307** in USA column for 1981 = 40,307 Filipinos left Philippines and went to USA in 1981
- **2,752** in Australia column for 1981 = 2,752 Filipinos left Philippines and went to Australia in 1981

---

**Last Updated:** November 13, 2024  
**Data Source:** Philippine emigration statistics (1981-2020)
