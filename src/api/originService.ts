import {
  postDataToFirestore,
  getDataByYear,
  getAllData,
  updateDataByYear,
  deleteDataByYear,
  getAvailableYears,
  getCategories
} from './baseService'

/**
 * Origin Service - Province-based emigrant data
 * 
 * This service handles province-level emigrant data stored in Firebase.
 * Note: The CSV source data (PlaceOfOrigin-Clean.csv) contains regional data,
 * which is distributed across provinces in the UI layer (see originChoropleth.tsx).
 */

const PROVINCE_COLLECTION = 'emigrantData_province'

// ====== PROVINCE (by Year) ======

export interface ProvinceData {
  Year: number
  [province: string]: number
}

export const postProvinceData = async (year: number, data: Record<string, number>) => {
  await postDataToFirestore(PROVINCE_COLLECTION, year, data as Record<string, number>)
}

export const getProvinceDataByYear = async (year: number): Promise<Record<string, number> | null> => {
  return await getDataByYear(PROVINCE_COLLECTION, year) as Record<string, number> | null
}

export const getAllProvinceData = async (): Promise<ProvinceData[]> => {
  return await getAllData(PROVINCE_COLLECTION) as ProvinceData[]
}

export const updateProvinceData = async (year: number, updates: Record<string, number>) => {
  await updateDataByYear(PROVINCE_COLLECTION, year, updates as Record<string, number>)
}

export const deleteProvinceData = async (year: number) => {
  await deleteDataByYear(PROVINCE_COLLECTION, year)
}

export const getAvailableProvinceYears = async (): Promise<number[]> => {
  return await getAvailableYears(PROVINCE_COLLECTION)
}

export const getProvinces = async (): Promise<string[]> => {
  return await getCategories(PROVINCE_COLLECTION)
}

export const addNewProvinceYear = async (year: number, provinces: string[]) => {
  const existing = await getProvinceDataByYear(year)

  if (existing) throw new Error(`Province data for year ${year} already exists`)

  const data: Record<string, number> = {}
  provinces.forEach(province => {
    data[province] = 0
  })

  await postProvinceData(year, data)
}