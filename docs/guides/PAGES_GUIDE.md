# Dashboard Pages Guide

Complete reference guide for all visualization and management pages in the Filipino Emigrants Dashboard.

---

## Table of Contents

1. [Dashboard (Home)](#1-dashboard-home)
2. [Geographic Visualization](#2-geographic-visualization)
3. [Comparison Charts](#3-comparison-charts)
4. [Composition Charts](#4-composition-charts)
5. [Trend Analysis](#5-trend-analysis)
6. [Distribution Charts](#6-distribution-charts)
7. [Relationship Analysis](#7-relationship-analysis)
8. [Ranking (Radar Chart)](#8-ranking-radar-chart)
9. [Flow/Process (Parallel Sets)](#9-flowprocess-parallel-sets)
10. [Upload Data](#10-upload-data)
11. [Data Management (CRUD)](#11-data-management-crud)

---

## 1. Dashboard (Home)

**Route:** `/`  
**Purpose:** Main landing page with overview statistics and navigation

### What It Shows

- Quick statistics cards:
  - Total Countries (destinations)
  - Data Years (span of available data)
  - Total Emigrants (in millions)
- Navigation cards to all other pages
- Visual overview of available features

### Data Source

- Aggregates from `emigrantData_destination` collection

### Use Cases

- Starting point for exploration
- Quick overview of data scope
- Navigation hub

### No Axes

This is a dashboard/landing page, not a chart.

---

## 2. Geographic Visualization

**Route:** `/geographic`  
**Type:** Choropleth Maps  
**Chart Library:** Nivo Geo

### What It Shows

Two interactive world maps:

#### A. Destination Countries Map

- **X-Axis:** Longitude (geographic)
- **Y-Axis:** Latitude (geographic)
- **Data Dimension:** Emigrant count (color intensity)
- **Color Scale:** Light (low) → Dark (high emigration)

#### B. Origin Provinces Map (Philippines)

- **X-Axis:** Longitude (within Philippines)
- **Y-Axis:** Latitude (within Philippines)
- **Data Dimension:** Emigrant count (color intensity)
- **Color Scale:** Light (low) → Dark (high emigration)

### Data Sources

- **Destination Map:** `emigrantData_destination` collection
- **Origin Map:** `emigrantData_province` collection

### Filters

- **Year Selector:** View data for specific year
- Maps update dynamically based on selection

### Interactions

- **Hover:** Show country/province name and emigrant count
- **Color Coding:** Darker = more emigrants
- **Tooltip:** Displays exact numbers

### Insights Revealed

- Primary destination countries at a glance
- Regional patterns in Philippine provinces
- Geographic concentration of emigration
- Changes in destination preferences over time

### Relationship with Other Pages

- **Comparison Charts:** Provides specific numbers for top destinations
- **Trends:** Shows how geographic patterns change over time
- **Composition:** Breaks down the proportions shown on map

---

## 3. Comparison Charts

**Route:** `/comparison`  
**Type:** Bar Charts  
**Chart Library:** Nivo Bar

### What It Shows

Horizontal bar charts comparing different categories

### Chart Structure

#### Primary Chart

- **X-Axis:** Number of Emigrants
- **Y-Axis:** Category (Country, Age Group, etc.)
- **Bars:** Horizontal, length represents emigrant count
- **Color:** Single color per category

### Data Sources

Multiple collections available via selector:

- `emigrantData_destination` (Countries)
- `emigrantData_age` (Age Groups)
- `emigrantData_sex` (Gender)
- `emigrantData_civilStatus` (Civil Status)
- `emigrantData_education` (Education Level)
- `emigrantData_occupation` (Occupation)
- `emigrantData_province` (Provinces)

### Filters

- **Collection Type:** Switch between different data categories
- **Year:** Select specific year or All Years
- **Top N:** Show top 5, 10, 15, 20 items

### Interactions

- **Hover:** Show exact numbers
- **Sort:** Automatic from highest to lowest
- **Color Coding:** Consistent colors per category

### Insights Revealed

- **Ranking:** Which categories have the most emigrants
- **Magnitude:** How much larger one category is vs. another
- **Disparities:** Unequal distribution across categories
- **Top Performers:** Dominant categories at a glance

### Relationship with Other Pages

- **Geographic:** Same data but in map form
- **Composition:** Same categories but as proportions
- **Trends:** How these rankings change over time
- **Distribution:** How the values are distributed

**Example Insights:**

- USA might be 3x larger than Canada
- Age group 25-29 might dominate
- Most emigrants are college-educated

---

## 4. Composition Charts

**Route:** `/composition`  
**Type:** Pie/Donut Charts  
**Chart Library:** Nivo Pie

### What It Shows

Three pie charts showing proportional breakdowns:

1. **Destination Countries Distribution**
2. **Age Groups Distribution**
3. **Civil Status Distribution**

### Chart Structure

- **Slices:** Each represents a category
- **Angle/Size:** Proportional to percentage of total
- **Inner Radius:** Donut style (hollow center)
- **Labels:** Category names with percentages

### No Traditional Axes

Pie charts show proportions, not axis-based data:

- **Dimension:** Category (Country, Age, Status)
- **Measure:** Percentage of total emigrants
- **Visual:** Slice size and angle

### Data Sources

- `emigrantData_destination` (top 8 countries)
- `emigrantData_age` (all age groups)
- `emigrantData_civilStatus` (all statuses)

### Filters

- **Year Selector:** View composition for specific year

### Interactions

- **Hover:** Show category name, count, and percentage
- **Arc Links:** Lines connecting slices to labels
- **Color Coding:** Unique color per slice

### Insights Revealed

- **Proportions:** What percentage each category represents
- **Dominance:** Which categories make up majority
- **Diversity:** How spread out the distribution is
- **Balance:** Equal vs. unequal distribution

### Relationship with Other Pages

- **Comparison:** Same data but emphasizes ranking vs. proportion
- **Trends:** How composition changes over time
- **Geographic:** Where these proportions go geographically

**Example Insights:**

- 45% of emigrants go to USA
- 60% of emigrants are aged 20-40
- 70% of emigrants are single

---

## 5. Trend Analysis

**Route:** `/trends`  
**Type:** Line Charts  
**Chart Library:** Nivo Line

### What It Shows

Multiple trend lines showing how emigration changes over time

### Chart Structure

- **X-Axis:** Year (temporal, e.g., 1981-2020)
- **Y-Axis:** Number of Emigrants
- **Lines:** Each represents a category (country, age group, etc.)
- **Points:** Data points for each year

### Data Sources

All collections available:

- `emigrantData_destination`
- `emigrantData_age`
- `emigrantData_sex`
- `emigrantData_civilStatus`
- `emigrantData_education`
- `emigrantData_occupation`
- `emigrantData_province`

### Filters

- **Collection Type:** Switch data categories
- **Top Categories:** Show top 5 or 10 items only
- **Year Range:** View specific time period

### Interactions

- **Hover:** Show year, category, and exact count
- **Multi-line:** Compare multiple categories simultaneously
- **Zoom:** Focus on specific time periods
- **Legend:** Click to show/hide specific lines

### Insights Revealed

- **Growth Patterns:** Increasing, decreasing, or stable trends
- **Peaks and Valleys:** When emigration was highest/lowest
- **Crossovers:** When one category surpasses another
- **Seasonality:** Recurring patterns
- **Events:** Sudden changes (may indicate historical events)

### Relationship with Other Pages

- **Comparison:** Shows current state, Trends shows history
- **Composition:** How proportions shift over time
- **Geographic:** How destination preferences evolved
- **Distribution:** How spread changes temporally

**Example Insights:**

- Emigration to USA grew steadily from 1981-2000
- 2008 shows a dip (global financial crisis)
- Canada overtook Japan as 2nd destination in 1995
- Age group 25-29 has been dominant since 1990

---

## 6. Distribution Charts

**Route:** `/distribution`  
**Type:** Area Charts / Stream Graphs  
**Chart Library:** Nivo Area/Stream

### What It Shows

Stacked area charts showing how total emigration is distributed across categories over time

### Chart Structure

- **X-Axis:** Year (temporal)
- **Y-Axis:** Number of Emigrants (cumulative/stacked)
- **Areas:** Stacked layers, each represents a category
- **Colors:** Different color per category
- **Height:** Thickness shows volume for that category

### Data Sources

All collections:

- `emigrantData_destination`
- `emigrantData_age`
- `emigrantData_sex`
- `emigrantData_education`
- `emigrantData_occupation`
- `emigrantData_province`

### Filters

- **Collection Type:** Switch categories
- **Visualization Style:**
  - Stacked (cumulative)
  - Stream (centered flow)
  - Percent (normalized to 100%)

### Interactions

- **Hover:** Show year, category, count, percentage
- **Stacking:** See total and individual contributions
- **Legend:** Toggle categories on/off

### Insights Revealed

- **Total Volume:** Overall emigration over time
- **Contribution:** How much each category contributes
- **Proportion Changes:** Shifting composition over time
- **Dominance Shifts:** When categories gain/lose share
- **Overall Patterns:** Growth, decline, stability of total

### Relationship with Other Pages

- **Trends:** Both show time, but Distribution shows contribution
- **Composition:** Distribution is composition over time
- **Comparison:** Shows same categories but temporally

**Visual Explanation:**

```
Stacked Area:
 [CATEGORY C]
 [CATEGORY B]
 [CATEGORY A]
 ─────────────── (Timeline)
```

**Example Insights:**

- USA's share of total emigration has grown
- Total emigration doubled between 1981 and 2020
- Age distribution has remained relatively stable
- Education level composition shifted toward higher education

---

## 7. Relationship Analysis

**Route:** `/relationships`  
**Type:** Scatter Plot  
**Chart Library:** Nivo ScatterPlot

### What It Shows

Scatter plots showing correlations between two variables

### Available Relationships

#### A. Age vs Income

- **X-Axis:** Age (years)
- **Y-Axis:** Annual Income ($ - simulated)
- **Points:** Each represents an age group
- **Size:** Number of emigrants in that age group

#### B. Education vs Income

- **X-Axis:** Education Level (1-11 scale)
  - 1 = No formal education
  - 11 = Post-graduate degree
- **Y-Axis:** Annual Income ($ - simulated)
- **Points:** Each represents an education level
- **Size:** Number of emigrants with that education

#### C. Distance vs Emigrants

- **X-Axis:** Distance from Philippines (km)
- **Y-Axis:** Number of Emigrants
- **Points:** Each represents a destination country
- **Size:** Emigrant count

### Data Sources

- `emigrantData_age` (for age relationships)
- `emigrantData_education` (for education relationships)
- `emigrantData_destination` (for distance relationships)

### Filters

- **Relationship Type:** Switch between three correlation types

### Special Features

- **Correlation Matrix:** Shows correlation coefficients
  - +1.0 = Perfect positive correlation
  - 0.0 = No correlation
  - -1.0 = Perfect negative correlation
- **Strength Indicators:** Weak, Moderate, Strong
- **Visual Bar:** Shows correlation strength visually

### Insights Revealed

- **Correlations:** How two variables relate
- **Patterns:** Linear, curved, clustered
- **Outliers:** Unusual combinations
- **Trends:** Positive, negative, or no relationship
- **Strength:** How strong the relationship is

### Relationship with Other Pages

- **Comparison:** Provides the individual data points
- **Trends:** Shows temporal changes in relationships
- **Composition:** Breaks down the aggregates shown here

**Example Insights:**

- Income increases with education (strong positive correlation)
- Income peaks around age 45 (bell curve pattern)
- Distance has weak negative correlation with emigration
- Nearby countries don't necessarily attract more emigrants

**Note:** Income data is simulated for demonstration purposes since actual income data isn't typically available in emigration databases.

---

## 8. Ranking (Radar Chart)

**Route:** `/radar`  
**Type:** Radar/Spider Chart  
**Chart Library:** Nivo Radar

### What It Shows

Multi-dimensional comparison using a spider/web chart

### Chart Structure

- **Axes:** Multiple axes radiating from center (one per dimension)
- **Dimensions:** Different metrics or categories
- **Polygon:** Connected points forming a shape
- **Multiple Polygons:** Compare multiple items
- **Area Fill:** Shows overall profile

### No Traditional X/Y Axes

Radar charts have multiple axes:

- Each spoke = a dimension/metric
- Distance from center = value
- Shape = overall profile

**Example Dimensions:**

- Total Emigrants
- Average Age
- Education Level
- Civil Status Mix
- Gender Ratio
- Year-over-Year Growth

### Data Sources

Aggregates from multiple collections to create profiles

### Interactions

- **Hover:** Show metric name and value
- **Overlay:** Compare multiple years or countries
- **Legend:** Show/hide specific items

### Insights Revealed

- **Profiles:** Overall characteristic pattern
- **Comparison:** Which dimensions are stronger/weaker
- **Balance:** Well-rounded vs. specialized
- **Strengths/Weaknesses:** At a glance assessment
- **Similarity:** How alike two profiles are

### Relationship with Other Pages

- **Comparison:** Same data but multi-dimensional view
- **Composition:** Contributing factors to the profile
- **Trends:** How profiles evolve over time

**Example Insights:**

- USA destination: Strong in all dimensions
- 2020 profile: More educated, older than 1981
- Province comparison: NCR well-rounded, others specialized

---

## 9. Flow/Process (Parallel Sets)

**Route:** `/parallel`  
**Type:** Sankey/Parallel Sets Diagram  
**Chart Library:** Nivo Sankey

### What It Shows

Data flow between categories showing relationships and volumes

### Chart Structure

- **Nodes:** Vertical columns representing categories
- **Links/Flows:** Ribbons connecting nodes
- **Width:** Thickness represents volume
- **Path:** Shows movement from source to destination

### Typical Flow Patterns

#### Example: Province → Education → Destination

```
[Provinces]  →  [Education Level]  →  [Destination Country]
   NCR ────────── College Grad ──────────── USA
   CALABARZON ─── High School ───────────── Canada
   ...            ...                        ...
```

### No Traditional Axes

Flow charts show connections:

- **Left → Right:** Progression/Flow direction
- **Vertical Position:** Categories within each stage
- **Width:** Volume of flow

### Data Sources

Multiple collections combined:

- `emigrantData_province` (origin)
- `emigrantData_education` (intermediate)
- `emigrantData_destination` (final)
- `emigrantData_age` (intermediate)
- `emigrantData_sex` (breakdown)

### Interactions

- **Hover:** Show source, destination, and flow volume
- **Click:** Highlight specific flows
- **Trace:** Follow a path through the system

### Insights Revealed

- **Pathways:** Common routes through categories
- **Bottlenecks:** Where flow concentrates
- **Splits:** How one category divides to many
- **Joins:** How many categories converge to one
- **Dominant Paths:** Most common combinations
- **Relationships:** How categories connect

### Relationship with Other Pages

- **Geographic:** Where flows originate/end geographically
- **Composition:** Breaks down the flows into proportions
- **Trends:** How flow patterns change over time
- **Relationships:** Statistical correlation of flow connections

**Example Insights:**

- Most NCR emigrants with college degrees go to USA
- High school graduates distribute more evenly across countries
- Younger emigrants prefer English-speaking countries
- Province education level predicts destination choice

---

## 10. Upload Data

**Route:** `/upload`  
**Type:** Data Management Tool  
**Purpose:** Bulk CSV file upload to Firebase

### What It Does

- Accepts CSV files (multiple at once)
- Parses and validates data
- Transforms to Firebase format
- Uploads to appropriate collections
- Shows progress and results

### Supported CSV Formats

#### Tall Format (Recommended)

```csv
Year,Country,Emigrants
2020,USA,45000
2020,CANADA,32000
2021,USA,48000
```

#### Wide Format

```csv
Year,USA,CANADA,JAPAN
2020,45000,32000,12000
2021,48000,33000,13000
```

### Supported Data Types

- Destination Countries
- Origin Provinces
- Age Groups
- Gender/Sex Distribution
- Education Levels
- Civil Status
- Occupation

### Data Processing

1. **Detection:** Automatically detects data type from filename/headers
2. **Validation:** Checks format and required fields
3. **Transformation:** Converts to standardized format
4. **Pivot:** Converts tall to wide if needed
5. **Upload:** Writes to correct Firebase collection

### Target Collections

Maps files to collections:

- `*countries*` → `emigrantData_destination`
- `*age*` → `emigrantData_age`
- `*education*` → `emigrantData_education`
- `*sex*` or `*gender*` → `emigrantData_sex`
- `*civil*` → `emigrantData_civilStatus`
- `*occupation*` → `emigrantData_occupation`
- `*province*` or `*origin*` → `emigrantData_province`

### Features

- **Drag & Drop:** Drag files onto upload area
- **Multiple Files:** Upload several files at once
- **Progress Bar:** Shows upload progress
- **Error Handling:** Reports issues clearly
- **Success Feedback:** Confirms successful uploads
- **File History:** Lists uploaded files

### Relationship with Other Pages

- **All Pages:** Provides the data they visualize
- **CRUD:** Alternative to CRUD for bulk operations
- **Complementary:** Use Upload for bulk, CRUD for corrections

### Best Practices

- Clean CSVs before uploading (remove extra headers)
- Use consistent naming conventions
- One data type per file
- Include Year column
- Remove blank rows/columns

See [CSV_FORMAT_GUIDE.md](./CSV_FORMAT_GUIDE.md) for detailed format specifications.

---

## 11. Data Management (CRUD)

**Route:** `/crud`  
**Type:** Data Management Tool  
**Purpose:** Create, Read, Update, Delete individual records

### What It Does

Interactive interface for managing emigrant data records directly

### Four Main Operations

#### A. Create (➕)

- **Purpose:** Add new year records
- **Process:**
  1. Click "Create New Record"
  2. Enter year
  3. Add categories and values
  4. Save to Firebase
- **Use Case:** Adding latest annual data

#### B. Read (📖)

- **Purpose:** View existing data
- **Display:** Table format with columns
- **Columns:**
  - Year
  - Top 5 categories
  - Action buttons
- **Features:** Sortable, scrollable

#### C. Update (✏️)

- **Purpose:** Edit existing records
- **Process:**
  1. Click blue Edit button
  2. Modify values
  3. Add/remove fields
  4. Save changes
- **Use Case:** Correcting errors, adding missing data

#### D. Delete (🗑️)

- **Purpose:** Remove records
- **Process:**
  1. Click red Delete button
  2. Confirm deletion
  3. Record permanently removed
- **Warning:** Cannot be undone!

### Available Collections

All 7 data collections:

1. Destination Countries
2. Age Groups
3. Gender/Sex
4. Civil Status
5. Education Level
6. Occupation
7. Province/Origin

### Data Structure

Each record:

```
Year: 2020
CATEGORY_1: 45000
CATEGORY_2: 32000
CATEGORY_3: 12000
...
```

### Features

- **Collection Selector:** Switch between data types
- **Modal Dialogs:** Clean interfaces for operations
- **Dynamic Fields:** Add/remove categories on the fly
- **Validation:** Prevents errors (duplicate years, missing data)
- **Feedback:** Success/error messages
- **Real-time:** Changes reflect immediately

### Relationship with Other Pages

- **Upload:** Alternative for bulk operations
- **All Charts:** Provides and maintains their data
- **Complementary:** Use CRUD for single-record operations

### Use Cases

1. **Annual Updates:** Add new year when data becomes available
2. **Corrections:** Fix typos or incorrect values
3. **Additions:** Add missing categories to existing years
4. **Cleanup:** Remove test or erroneous data
5. **Maintenance:** Keep database accurate and current

### Best Practices

- Use Edit instead of Delete+Create (safer)
- Verify data before saving
- Follow naming conventions
- Check charts after changes
- Document major changes

See [CRUD_GUIDE.md](./CRUD_GUIDE.md) and [CRUD_QUICK_REFERENCE.md](./CRUD_QUICK_REFERENCE.md) for detailed instructions.

---

## Page Relationships Matrix

How each page relates to others:

| From Page     | To Page      | Relationship                  |
| ------------- | ------------ | ----------------------------- |
| Dashboard     | All          | Navigation hub                |
| Geographic    | Comparison   | Same data, different view     |
| Geographic    | Composition  | Proportions of map data       |
| Comparison    | Trends       | Rankings over time            |
| Comparison    | Distribution | Same data with time dimension |
| Composition   | Trends       | How proportions change        |
| Trends        | Distribution | Individual vs. stacked trends |
| Relationships | Comparison   | Source data for correlations  |
| Radar         | Comparison   | Multi-dimensional view        |
| Parallel      | All          | Shows data flow/connections   |
| Upload        | All Charts   | Data source                   |
| CRUD          | All Charts   | Data maintenance              |

---

## Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐
│   Upload    │────▶│   Firebase  │
│    (CSV)    │     │  Firestore  │
└─────────────┘     └──────┬──────┘
                           │
┌─────────────┐            │
│    CRUD     │◀───────────┤
│ (Individual)│────────────▶
└─────────────┘            │
                           ▼
        ┌──────────────────────────────────┐
        │      Data Collections             │
        │  • destination • age • sex        │
        │  • civilStatus • education        │
        │  • occupation • province          │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │     Visualization Pages           │
        │  Geographic • Comparison          │
        │  Composition • Trends             │
        │  Distribution • Relationships     │
        │  Radar • Parallel                 │
        └───────────────────────────────────┘
```

---

## Choosing the Right Page

### Question to Ask Yourself → Recommended Page

**"Where do emigrants go?"**
→ Geographic (Destination Map)

**"Which country has the most?"**
→ Comparison (Bar Chart)

**"What percentage goes to USA?"**
→ Composition (Pie Chart)

**"How has emigration changed over time?"**
→ Trends (Line Chart)

**"What's the total emigration trend?"**
→ Distribution (Area Chart)

**"Does education affect destination choice?"**
→ Relationships (Scatter Plot)

**"How do 2020 and 1990 compare overall?"**
→ Radar (Multi-dimensional)

**"What path do NCR college graduates take?"**
→ Parallel (Flow Diagram)

**"I need to add 2024 data"**
→ Upload or CRUD

**"I need to fix a typo in 2020 data"**
→ CRUD

---

## Chart Type Reference

| Chart Type  | Pages         | Best For                  | Axes                   |
| ----------- | ------------- | ------------------------- | ---------------------- |
| **Map**     | Geographic    | Geographic distribution   | Lat/Long               |
| **Bar**     | Comparison    | Ranking categories        | Y: Category, X: Count  |
| **Pie**     | Composition   | Proportions               | Angle: Percentage      |
| **Line**    | Trends        | Change over time          | X: Year, Y: Count      |
| **Area**    | Distribution  | Stacked temporal data     | X: Year, Y: Cumulative |
| **Scatter** | Relationships | Correlations              | X: Var1, Y: Var2       |
| **Radar**   | Ranking       | Multi-dimensional profile | Multiple radial axes   |
| **Sankey**  | Parallel      | Flow between categories   | Node connections       |

---

## Quick Reference Table

| Page          | Primary Question  | Key Insight       | Data Granularity      |
| ------------- | ----------------- | ----------------- | --------------------- |
| Dashboard     | What's available? | Overview          | Aggregated            |
| Geographic    | Where?            | Location patterns | By country/province   |
| Comparison    | Which most?       | Rankings          | By category           |
| Composition   | What percentage?  | Proportions       | By category           |
| Trends        | How changed?      | Temporal patterns | Yearly                |
| Distribution  | How distributed?  | Volume over time  | Yearly stacked        |
| Relationships | How related?      | Correlations      | Aggregated pairs      |
| Radar         | Overall profile?  | Multi-metric      | Aggregated dimensions |
| Parallel      | What path?        | Category flows    | Multi-category        |
| Upload        | Add bulk data     | Data import       | Bulk records          |
| CRUD          | Manage records    | Data maintenance  | Individual records    |

---

## Tips for Users

### For Analysts

1. Start with **Dashboard** for overview
2. Use **Geographic** to spot regional patterns
3. Check **Trends** for temporal changes
4. Verify with **Comparison** for rankings
5. Use **Relationships** for correlations

### For Administrators

1. **Upload** for bulk annual updates
2. **CRUD** for corrections and maintenance
3. **Comparison** to verify data quality
4. **Trends** to check for anomalies

### For Presenters

1. **Geographic** for impressive visuals
2. **Composition** for clear proportions
3. **Trends** for storytelling over time
4. **Parallel** for complex relationships
5. **Radar** for holistic comparisons

---

## Technical Notes

### Data Refresh

- Charts load data on page load
- Use browser refresh to see updates after CRUD changes
- Filters update charts without full refresh

### Performance

- Large datasets may take a few seconds to load
- Geographic maps are most resource-intensive
- Filters are applied client-side for responsiveness

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive (best on tablet or larger)
- JavaScript required

---

**Last Updated:** November 13, 2024  
**Version:** 2.0  
**Contributors:** Dashboard Development Team

For additional help, see:

- [README.md](./README.MD) - Project overview
- [CSV_FORMAT_GUIDE.md](./CSV_FORMAT_GUIDE.md) - Data upload formats
- [CRUD_GUIDE.md](./CRUD_GUIDE.md) - CRUD operations guide
