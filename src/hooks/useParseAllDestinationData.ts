import { useState, useEffect, useMemo } from 'react'
import { getAllAllDestinationData } from '../api/destinationService'

interface CountryData {
  country: string
  total: number
  category: string
  color: string
}

interface UseParseAllDestinationDataReturn {
  mapData: CountryData[]
  years: number[]
  loading: boolean
  error: string | null
}

export const useParseAllDestinationData = (year: number | 'all' = 'all'): UseParseAllDestinationDataReturn => {
  const [mapData, setMapData] = useState<CountryData[]>([])
  const [allRows, setAllRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFromFirebase()
  }, [])

  useEffect(() => {
    if (allRows.length === 0) return

    const rows = year === 'all' ? allRows : allRows.filter((r: any) => r.Year === year)
  
    // Get all country names - collect unique countries from all rows
    const countrySet = new Set<string>()
    rows.forEach((row: any) => {
      Object.keys(row).forEach(key => {
        if (key !== 'Year') {
          countrySet.add(key)
        }
      })
    })
    const allCountries = Array.from(countrySet)

    // Calculate totals for each country
    // UPDATED: Handle nested structure { Year: 2020, "COUNTRY_NAME": { emigrants: 12345 }, ... }
    const countryTotals = allCountries.map(country => {
      let total = 0
      rows.forEach(row => {
        const value = row[country]
        
        // Handle nested structure
        const emigrants =
          typeof value === "object" &&
          value !== null &&
          "emigrants" in value
            ? (value as { emigrants: number }).emigrants
            : typeof value === "number"
            ? value
            : 0

        if (Number.isFinite(emigrants) && emigrants > 0) {
          total += emigrants
        }
      })

      return { country, total }
    }).filter(item => item.total > 0) // Filter out countries with zero totals

    // Classify countries into categories for Choropleth Map
    const categorizedData = countryTotals.map(({ country, total }) => {
      let category = ''
      let color = ''

      if (total >= 1000000) {
        category = 'Extreme Concentration'
        color = '#5EEAD4'
      } else if (total >= 500000) {
        category = 'Significant Concentration'
        color = '#2DD4BF'
      } else if (total >= 100000) {
        category = 'Moderate Concentration'
        color = '#0D9488'
      } else if (total >= 10000) {
        category = 'Slight Concentration'
        color = '#155E75'
      } else {
        category = 'Nil Concentration'
        color = '#1E293B'
      }

      return { country, total, category, color}
    })

    setMapData(categorizedData)
    setLoading(false)
  }, [year, allRows])

  const years = useMemo(() => {
    return Array.from(new Set(allRows.map(r => r.Year))).sort((a, b) => b - a)
  }, [allRows])

  const fetchFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching all destination data from Firebase...')
      const data = await getAllAllDestinationData()

      if (data.length === 0) {
        setError('No all destination data found in Firebase. Please upload data first.')
        setLoading(false)
        return
      }

      setAllRows(data)
      setLoading(false)
      console.log('Successfully loaded data from Firebase')
    } catch (err) {
      console.error('Error fetching all destination data from Firebase:', err)
      setError('Failed to load all destination data from Firebase')
      setLoading(false)
    }
  }

  return {
    mapData,
    years,
    loading,
    error
  }
}
