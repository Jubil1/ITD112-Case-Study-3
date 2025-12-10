import { useState, useEffect } from 'react'

type UseGeoJSONReturn<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

export function useGeoJSON<T = any> (
  path: string,
  transform?: (raw: any) => T
): UseGeoJSONReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load map data')
      return res.json()
    })
    .then((raw) => {
      if (cancelled) return
      
      const value = transform ? transform(raw) : raw
      setData(value as T)
    })
    .catch(err => {
      if (!cancelled) {
        console.error('Error loading GeoJSON:', err)
        setError(err.message)
      }
    })
    .finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [path, transform])

  return { data, loading, error }
}