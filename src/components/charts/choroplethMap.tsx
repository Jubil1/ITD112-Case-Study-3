import { useMemo } from 'react'
import { ResponsiveChoropleth } from '@nivo/geo'
import { useParseAllDestinationData } from '../../hooks/useParseAllDestinationData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useGeoJSON } from '../../hooks/useGeoJSON'
import { useYearFilter } from '../../hooks/useYearFilter'
import { toIso3 } from '../../utils/countryMapping'
import LoadingScreen from '../loadingScreen'

const ChoroplethMap = () => {
  const { selectedYear, onSelectChange } = useYearFilter('all')
  const { mapData, loading, years } = useParseAllDestinationData(selectedYear)
  const isMobile = useIsMobile()
  const { data: geoData, loading: geoLoading, error: geoError } = useGeoJSON('/data/worldCountries.json')

  const nivoData = useMemo(() => {
    return mapData.map(item => {
      let categoryValue = 0
      if (item.total >= 1000000) categoryValue = 4
      else if (item.total >= 500000) categoryValue = 3
      else if (item.total >= 100000) categoryValue = 2
      else if (item.total >= 10000) categoryValue = 1
      
      return {
        id: toIso3(item.country) || item.country,
        value: categoryValue,
        total: item.total
      }
    })
  }, [mapData])

  if (geoError) return (
    <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-lg p-4 m-8">
      <p className="font-bold">⚠️ Error Loading Data</p>
      <p>{geoError}</p>
    </div>
  )

  if (loading || geoLoading || !geoData) return <LoadingScreen />

  return (
    <div className="bg-primary rounded-lg shadow-md p-6 border-2 border-highlights">
      <h2 className="text-lg text-center font-inter text-stroke text-white mb-4">
        {selectedYear === 'all' 
          ? 'Emigrant Destination of Filipinos by Country (1981 - 2020)' 
          : `Emigrant Destination of Filipinos by Country in ${selectedYear}`
        }
      </h2>

      <div className="mb-4 flex justify-center">
        <select
          value={selectedYear}
          onChange={onSelectChange}
          className="px-4 py-2 bg-secondary border border-highlights rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
        >
          <option value="all">All Years (1981-2020)</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className={isMobile ? 'overflow-x-auto' : ''}>
        <div style={{ width: isMobile ? '900px' : '100%', height: '650px' }}>
          <ResponsiveChoropleth
            data={nivoData}
            features={geoData.features}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            colors={['#2d1b4e', '#4c1d95', '#6d28d9', '#a855f7', '#d8b4fe']}
            domain={[0, 4]}
            unknownColor="#2d1b4e"
            label="properties.name"
            valueFormat={(value) => {
              const country = nivoData.find(item => item.value === value)
              return country ? country.total.toLocaleString() : value.toString()
            }}
            tooltip={({ feature }) => (
              <div style={{
                background: '#2d1b4e',
                border: '1px solid #a855f7',
                borderRadius: '8px',
                padding: '10px',
                color: '#ffffff'
              }}>
                <strong>{feature.label}</strong><br />
                Total: {feature.data?.total?.toLocaleString() || 'N/A'}
              </div>
            )}
            projectionScale={130}
            projectionTranslation={[0.5, 0.6]}
            projectionRotation={[0, 0, 0]}
            enableGraticule={false}
            borderWidth={0.5}
            borderColor="#a855f7"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6" style={{ backgroundColor: '#d8b4fe' }}></div>
          <span className="text-white text-sm">Extreme (≥1M)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6" style={{ backgroundColor: '#a855f7' }}></div>
          <span className="text-white text-sm">Significant (≥500K)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6" style={{ backgroundColor: '#6d28d9' }}></div>
          <span className="text-white text-sm">Moderate (≥100K)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6" style={{ backgroundColor: '#4c1d95' }}></div>
          <span className="text-white text-sm">Slight (≥10K)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6" style={{ backgroundColor: '#2d1b4e' }}></div>
          <span className="text-white text-sm">Nil (&lt;10K)</span>
        </div>
      </div>
    </div>
  )
}

export default ChoroplethMap