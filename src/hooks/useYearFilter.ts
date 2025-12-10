import { useState } from 'react'

export type YearValue = number | 'all'

export function useYearFilter(initial: YearValue = 'all') {
  const [selectedYear, setSelectedYear] = useState<YearValue>(initial)

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value
    setSelectedYear(year === 'all' ? 'all' : parseInt(year, 10))
  }

  return { selectedYear, setSelectedYear, onSelectChange }
}