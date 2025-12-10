# Project Structure

## CS2-SirPaul

```
CS2-SirPaul/
├── src/                          # Main source code
│   ├── api/                      # API service layer
│   │   ├── baseService.ts
│   │   ├── destinationService.ts
│   │   └── originService.ts
│   │
│   ├── components/               # React/Solid components
│   │   ├── charts/              # Chart components
│   │   │   ├── choroplethMap.tsx
│   │   │   └── originChoropleth.tsx
│   │   ├── DataPopulationButton.tsx
│   │   ├── header.tsx
│   │   ├── loadingScreen.tsx
│   │   └── navBar.tsx
│   │
│   ├── context/                  # React context providers
│   │   └── navBarContext.tsx
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useComparisonData.ts
│   │   ├── useCompositionData.ts
│   │   ├── useDashboardStats.ts
│   │   ├── useDistributionData.ts
│   │   ├── useGeoJSON.ts
│   │   ├── useIsMobile.ts
│   │   ├── useNavBarWidth.ts
│   │   ├── useParseAllDestinationData.ts
│   │   ├── useParseOriginProvinceData.ts
│   │   ├── useRelationshipData.ts
│   │   ├── useTrendData.ts
│   │   └── useYearFilter.ts
│   │
│   ├── routes/                   # Application routes/pages
│   │   ├── __root.tsx           # Root route
│   │   ├── comparison.tsx
│   │   ├── composition.tsx
│   │   ├── distribution.tsx
│   │   ├── geographic.tsx
│   │   ├── index.tsx            # Home/index page
│   │   ├── parallel.tsx
│   │   ├── radar.tsx
│   │   ├── relationships.tsx
│   │   ├── trends.tsx           # Currently open file
│   │   └── upload.tsx
│   │
│   ├── utils/                    # Utility functions
│   │   ├── countryMapping.ts
│   │   ├── csvDataPopulation.ts
│   │   └── normalizeProvince.ts
│   │
│   ├── firebase.ts              # Firebase configuration
│   ├── main.tsx                 # Application entry point
│   ├── reportWebVitals.ts
│   ├── routeTree.gen.ts         # Generated route tree (TanStack Router)
│   └── styles.css               # Global styles
│
├── public/                       # Static assets
│   ├── data/                    # Data files
│   │   ├── Provinces.json
│   │   └── worldCountries.json
│   └── robots.txt
│
├── dist/                         # Build output directory
├── .tanstack/                    # TanStack Router cache
├── node_modules/                 # Dependencies (excluded from view)
├── package.json                  # Project dependencies & scripts
└── package-lock.json             # Lock file
```

## Project Overview

**Framework:** React/Solid.js with TanStack Router

**Purpose:** Data visualization dashboard with charts and geographic data

**Key Features:**
- Multiple chart types (choropleth, radar, parallel, etc.)
- Geographic data visualization
- Data comparison and analysis
- Trend analysis
- Data upload functionality
- Firebase integration

**Data:** Province and world country JSON files

**Styling:** CSS (with Tailwind CSS in dependencies)

## Directory Descriptions

### `src/api/`
Contains API service layer files for handling data operations related to destinations and origins.

### `src/components/`
Reusable UI components including:
- **charts/**: Specialized chart components for data visualization
- Navigation and layout components (header, navBar)
- Utility components (loadingScreen, DataPopulationButton)

### `src/context/`
React Context providers for global state management (e.g., navbar state).

### `src/hooks/`
Custom React hooks for:
- Data fetching and parsing (useComparisonData, useCompositionData, etc.)
- UI utilities (useIsMobile, useNavBarWidth)
- Data filtering (useYearFilter)
- Geographic data handling (useGeoJSON)

### `src/routes/`
Application pages/routes using TanStack Router:
- **index.tsx**: Home page
- **__root.tsx**: Root layout route
- Various visualization pages (trends, comparison, distribution, etc.)
- **upload.tsx**: Data upload interface

### `src/utils/`
Utility functions for:
- Country/province mapping
- CSV data processing
- Data normalization

### `public/`
Static assets served directly:
- **data/**: JSON data files for provinces and countries
- **robots.txt**: SEO configuration

## Notes

- The project uses TanStack Router for routing (evident from `routeTree.gen.ts`)
- Firebase integration is configured in `firebase.ts`
- Chart components suggest this is a data analytics/visualization application
- Geographic data focus indicates mapping and location-based visualizations
