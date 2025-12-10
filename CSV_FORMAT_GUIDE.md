# CSV Upload Format Guide for Dashboard Charts

## Problem Identified

Your existing CSVs have:

- ❌ Extra header rows with descriptions
- ❌ Extra commas/blank columns
- ❌ Formatted numbers with spaces/commas (e.g., `"2,752"`)
- ❌ Complex wide format that needs pivoting

## What Each Chart Type Needs

### 1. **DESTINATION COUNTRIES** (Geographic, Comparison, Composition, Trends, Distribution)

**Collection**: `emigrantData/allDestination/years`

**Expected Document Format** (per year):

```javascript
{
  Year: 2020,
  "UNITED STATES OF AMERICA": 6539,
  "CANADA": 4579,
  "JAPAN": 1100,
  "AUSTRALIA": 777,
  // ... more countries
}
```

**CSV Format Option A - Tall Format** (RECOMMENDED):

```csv
Year,Country,Emigrants
2020,UNITED STATES OF AMERICA,6539
2020,CANADA,4579
2020,JAPAN,1100
2020,AUSTRALIA,777
2021,UNITED STATES OF AMERICA,35839
2021,CANADA,23014
```

**CSV Format Option B - Wide Format**:

```csv
Year,UNITED STATES OF AMERICA,CANADA,JAPAN,AUSTRALIA
2020,6539,4579,1100,777
2021,35839,23014,3962,2937
```

---

### 2. **AGE GROUPS** (Composition, Distribution, Trends)

**Collection**: `emigrantData/age/years`

**CSV Format - Tall** (RECOMMENDED):

```csv
Year,Age_Group,Emigrants
2020,14 - Below,3109
2020,15 - 19,1512
2020,20 - 24,1394
2020,25 - 29,2180
2021,14 - Below,13323
2021,15 - 19,6454
```

**CSV Format - Wide**:

```csv
Year,14 - Below,15 - 19,20 - 24,25 - 29,30 - 34
2020,3109,1512,1394,2180,2360
2021,13323,6454,5791,7592,9108
```

---

### 3. **GENDER/SEX** (Composition charts can support)

**Collection**: `emigrantData/sex/years`

**CSV Format - Tall** (RECOMMENDED):

```csv
Year,Sex,Emigrants
2020,MALE,5928
2020,FEMALE,9775
2021,MALE,25165
2021,FEMALE,39999
```

**CSV Format - Wide**:

```csv
Year,MALE,FEMALE
2020,5928,9775
2021,25165,39999
```

---

### 4. **CIVIL STATUS** ✅ (Already working!)

**Collection**: `emigrantData/civilStatus/years`

**CSV Format - Wide** (Your format is correct!):

```csv
Year,SINGLE,MARRIED,DIVORCED,WIDOWED
2020,1000000,1200000,200000,100000
2021,1050000,1260000,210000,105000
```

---

### 5. **EDUCATION** (Composition, if we add support)

**Collection**: `emigrantData/education/years`

**CSV Format - Tall**:

```csv
Year,Education_Level,Emigrants
2020,Elementary Level,1589
2020,High School Level,1949
2020,College Level,2383
2020,College Graduate,5311
2021,Elementary Level,6821
2021,High School Level,8257
```

---

### 6. **PROVINCES** (Geographic choropleth)

**Collection**: `emigrantData/province/years`

**CSV Format - Tall**:

```csv
Year,Province,Emigrants
2020,NCR,250000
2020,CALABARZON,180000
2020,CENTRAL LUZON,150000
2021,NCR,260000
2021,CALABARZON,190000
```

---

## How to Convert Your Existing CSVs

### Step 1: Clean the Age CSV

Your `Emigrant-1981-2020-Age.csv` needs to be:

1. Remove first 3 rows (headers/descriptions)
2. Remove "TOTAL" and "%" columns
3. Convert to tall format

**Should become**:

```csv
Year,Age_Group,Emigrants
1981,14 - Below,9588
1981,15 - 19,4712
1981,20 - 24,5846
...
2020,14 - Below,3109
2020,15 - 19,1512
```

### Step 2: Clean the Countries CSV

Your `Emigrant-1981-2020-AllCountries.csv` needs to be:

1. Remove first 3 rows
2. Remove blank columns
3. Remove spaces/commas from numbers
4. Pivot to tall format

**Should become**:

```csv
Year,Country,Emigrants
1981,AUSTRALIA,2752
1981,CANADA,5226
1981,JAPAN,254
...
2020,AUSTRALIA,777
2020,CANADA,4579
```

### Step 3: Clean the Sex CSV

Your `Emigrant-1981-2020-Sex.csv` already has good structure!
Just needs minor cleanup:

```csv
Year,Sex,Emigrants
1981,MALE,20350
1981,FEMALE,28517
...
2020,MALE,5928
2020,FEMALE,9775
```

---

## Quick Fix Tool

I can create a Python/Node script to auto-convert your CSVs if you want!

Or manually:

1. Open CSV in Excel/Google Sheets
2. Delete extra header rows
3. Delete blank columns
4. Remove commas from numbers (Find & Replace: `,` → empty)
5. If wide format, use Power Query or pivot to tall format
6. Save as clean CSV
7. Upload via `/upload` page

---

## Current Status

✅ **Civil Status**: Working! Shows in Composition page pie chart  
❌ **Age**: CSV has wrong format (wide with extra rows)  
❌ **Countries**: CSV has wrong format (wide with extra rows)  
❌ **Sex**: CSV needs minor cleanup  
❌ **Education**: CSV needs conversion to tall format

Would you like me to create a CSV converter script or manually transform one of these files as an example?
