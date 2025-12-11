# Choropleth Map Integration Guide

This guide explains how to integrate the world countries choropleth map into your project.

## Required Dependencies

Install these npm packages:

```bash
npm install @nivo/geo @nivo/core react react-dom
```

## Required Files to Copy

### 1. Core Component Files

- `src/components/charts/choroplethMap.tsx` - Main choropleth map component
- `src/components/loadingScreen.tsx` - Loading screen component (or create a simple placeholder)

### 2. Custom Hooks

- `src/hooks/useGeoJSON.ts` - Hook for loading GeoJSON map data
- `src/hooks/useIsMobile.ts` - Hook for responsive design detection
- `src/hooks/useYearFilter.ts` - Hook for year filtering (optional, can be simplified)

### 3. Utility Functions

- `src/utils/countryMapping.ts` - Country name to ISO3 code mapping utility

### 4. GeoJSON Data File

- `public/data/worldCountries.json` or `dist/data/worldCountries.json` - World countries GeoJSON file
- Ensure this file is accessible via your build/public folder

## Data Requirements

Your data hook should return:

```typescript
{
  mapData: Array<{ country: string, total: number }>,
  loading: boolean,
  years: number[] // optional for year filtering
}
```

## Integration Steps

### Step 1: Install Dependencies

```bash
npm install @nivo/geo @nivo/core
```

### Step 2: Copy Required Files

Copy the component, hooks, and utility files to your project maintaining the same folder structure.

### Step 3: Add GeoJSON Data

Place `worldCountries.json` in your public folder (e.g., `public/data/worldCountries.json`) or ensure it's accessible via your build process.

### Step 4: Create/Adapt Your Data Hook

Create a hook similar to `useParseAllDestinationData.ts` that:

- Fetches your data (from API, database, or local source)
- Transforms it into the format: `{ country: string, total: number }[]`
- Returns `{ mapData, loading, years }`

### Step 5: Import and Use the Component

```tsx
import ChoroplethMap from './components/charts/choroplethMap'

function YourPage() {
  return (
    <div>
      <ChoroplethMap />
    </div>
  )
}
```

### Step 6: Customize for Your Data

Modify `choroplethMap.tsx`:

- Update the data hook import to use your custom hook
- Adjust color thresholds in the `nivoData` useMemo (lines 19-23)
- Customize colors array (line 71)
- Update title text (lines 45-48)
- Adjust legend labels (lines 102-123)

## Key Configuration Points

1. **Color Thresholds** (lines 19-23 in choroplethMap.tsx):

   - Adjust the numeric thresholds based on your data range

2. **Color Scheme** (line 71):

   - Array of 5 colors representing data intensity levels

3. **Projection Settings** (lines 91-93):

   - `projectionScale`: Map zoom level (default: 130)
   - `projectionTranslation`: Map centering (default: [0.5, 0.6])
   - `projectionRotation`: Map rotation (default: [0, 0, 0])

4. **GeoJSON Path** (line 14):

   - Update the path to match where you placed worldCountries.json

## Minimal Example Hook

If you don't use Firebase, create a simple hook:

```typescript
// src/hooks/useYourData.ts
import { useState, useEffect } from 'react'

export function useYourData(year: number | 'all') {
  const [mapData, setMapData] = useState<Array<{ country: string, total: number }>>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Fetch your data here
    // Transform to: [{ country: string, total: number }]
    setMapData(transformedData)
    setLoading(false)
  }, [year])
  
  return { mapData, loading, years: [2020, 2019, 2018] }
}
```

## File Structure Reference

After copying files, your project should have:

```
your-project/
├── public/
│   └── data/
│       └── worldCountries.json
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   └── choroplethMap.tsx
│   │   └── loadingScreen.tsx
│   ├── hooks/
│   │   ├── useGeoJSON.ts
│   │   ├── useIsMobile.ts
│   │   └── useYearFilter.ts
│   └── utils/
│       └── countryMapping.ts
```

## Code Examples

### Basic Usage

```tsx
import ChoroplethMap from './components/charts/choroplethMap'

function App() {
  return (
    <div className="container">
      <h1>My Choropleth Map</h1>
      <ChoroplethMap />
    </div>
  )
}
```

### Customizing the Component

```tsx
// In choroplethMap.tsx, modify the data hook:
import { useYourCustomData } from '../../hooks/useYourCustomData'

const ChoroplethMap = () => {
  const { selectedYear, onSelectChange } = useYearFilter('all')
  const { mapData, loading, years } = useYourCustomData(selectedYear)
  // ... rest of component
}
```

### Adjusting Color Thresholds

```tsx
// In choroplethMap.tsx, modify the nivoData useMemo:
const nivoData = useMemo(() => {
  return mapData.map(item => {
    let categoryValue = 0
    // Adjust these thresholds based on your data range:
    if (item.total >= 500000) categoryValue = 4      // Your highest threshold
    else if (item.total >= 100000) categoryValue = 3
    else if (item.total >= 50000) categoryValue = 2
    else if (item.total >= 10000) categoryValue = 1
    
    return {
      id: toIso3(item.country) || item.country,
      value: categoryValue,
      total: item.total
    }
  })
}, [mapData])
```

## Styling Notes

The component uses Tailwind CSS classes. Ensure you have:

- Tailwind CSS configured
- Or replace Tailwind classes with your CSS framework/styles

Common Tailwind classes used:
- `bg-primary`, `bg-secondary` - Background colors
- `text-white`, `text-gray-300` - Text colors
- `rounded-lg`, `border`, `p-6` - Layout/spacing
- `flex`, `justify-center`, `items-center` - Flexbox utilities

## Testing Checklist

- [ ] GeoJSON file loads successfully
- [ ] Country names match ISO3 codes in GeoJSON
- [ ] Data hook provides correct format
- [ ] Map renders without errors
- [ ] Tooltips show on hover
- [ ] Year filter works (if implemented)
- [ ] Responsive design works on mobile

## Troubleshooting

### Common Issues

1. **Countries not showing**: 
   - Check that country names match the mapping in `countryMapping.ts` or the GeoJSON feature IDs
   - Verify that your country names are being converted to ISO3 codes correctly
   - Check the browser console for any mapping errors

2. **GeoJSON not loading**: 
   - Verify the file path is correct and accessible
   - Check that the file is in the `public` folder (or configured in your build process)
   - Ensure the path in `useGeoJSON('/data/worldCountries.json')` matches your file location
   - Check browser Network tab to see if the file request is successful

3. **Type errors**: 
   - Ensure TypeScript types match your data structure
   - Check that your data hook returns the correct interface
   - Verify all imports are correct

4. **Map not displaying**:
   - Check that `@nivo/geo` is properly installed
   - Verify the `features` prop contains valid GeoJSON features
   - Ensure the `data` array matches the expected format with `id` and `value` properties

5. **Colors not showing correctly**:
   - Verify the `domain` prop matches your category value range (e.g., `[0, 4]`)
   - Check that `categoryValue` in your data transformation matches the domain
   - Ensure the colors array has enough elements for your domain range

## Additional Resources

- [Nivo Geo Documentation](https://nivo.rocks/geo/)
- [GeoJSON Format Specification](https://geojson.org/)
- [ISO 3166-1 alpha-3 Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Verify all file paths and imports are correct
3. Ensure all dependencies are installed
4. Compare your implementation with the original working code

