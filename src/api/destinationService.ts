import {
  postDataToFirestore,
  getDataByYear,
  getAllData,
  updateDataByYear,
  deleteDataByYear,
  getAvailableYears,
  getCategories
} from './baseService'

// Collections Paths in Firebase Cloud DB - UPDATED: Use simpler collection paths
const MAJOR_DESTINATION_COLLECTION = 'emigrantData_majorDestination'
const ALL_DESTINATION_COLLECTION = 'emigrantData_destination'


// ====== MAJOR DESTINATION (by Year) ======

export interface MajorDestinationData {
  Year: number
  USA: number
  CANADA: number
  JAPAN: number
  AUSTRALIA: number
  ITALY: number
  'NEW ZEALAND': number
  'UNITED KINGDOM': number
  GERMANY: number
  'SOUTH KOREA': number
  SPAIN: number
  OTHERS: number
  [key: string]: number
}

export const postMajorDestinationData = async (year: number, data: Omit<MajorDestinationData, 'Year'>) => {
  await postDataToFirestore(MAJOR_DESTINATION_COLLECTION, year, data as Record<string, number>)
}

export const getMajorDestinationDataByYear = async (year: number): Promise<Omit<MajorDestinationData, 'Year'> | null> => {
  return await getDataByYear(MAJOR_DESTINATION_COLLECTION, year) as Omit<MajorDestinationData, 'Year'> | null
}

export const getAllMajorDestinationData = async (): Promise<MajorDestinationData[]> => {
  return await getAllData(MAJOR_DESTINATION_COLLECTION) as MajorDestinationData[]
}

export const updateMajorDestinationData = async (year: number, updates: Partial<Omit<MajorDestinationData, 'Year'>>) => {
  await updateDataByYear(MAJOR_DESTINATION_COLLECTION, year, updates as Record<string, number>)
}

export const deleteMajorDestinationData = async (year: number) => {
  await deleteDataByYear(MAJOR_DESTINATION_COLLECTION, year)
}

export const getAvailableMajorDestinationYears = async (): Promise<number[]> => {
  return await getAvailableYears(MAJOR_DESTINATION_COLLECTION)
}

export const getMajorDestinationCountries = async (): Promise<string[]> => {
  return await getCategories(MAJOR_DESTINATION_COLLECTION)
}

export const addNewMajorDestinationYear = async (year: number, data: Omit<MajorDestinationData, 'Year'>) => {
  const existing = await getMajorDestinationDataByYear(year)

  if (existing) throw new Error(`Major destination data for year ${year} already exists`)
  
  await postMajorDestinationData(year, data)
}

// ====== ALL DESTINATIONS (by Year) ======

export interface AllDestinationData {
  Year: number
  [country: string]: number
}

export const postAllDestinationData = async (year: number, data: Record<string, number>) => {
  await postDataToFirestore(ALL_DESTINATION_COLLECTION, year, data as Record<string, number>)
}

export const getAllDestinationDataByYear = async (year: number): Promise<Record<string, number> | null> => {
  return await getDataByYear(ALL_DESTINATION_COLLECTION, year) as Record<string, number> | null
}

export const getAllAllDestinationData = async (): Promise<AllDestinationData[]> => {
  return await getAllData(ALL_DESTINATION_COLLECTION) as AllDestinationData[]
}

export const updateAllDestinationData = async (year: number, updates: Record<string, number>) => {
  await updateDataByYear(ALL_DESTINATION_COLLECTION, year, updates as Record<string, number>)
}

export const deleteAllDestinationData = async (year: number) => {
  await deleteDataByYear(ALL_DESTINATION_COLLECTION, year)
}

export const getAvailableAllDestinationYears = async (): Promise<number[]> => {
  return await getAvailableYears(ALL_DESTINATION_COLLECTION)
}

export const getAllDestinationCountries = async (): Promise<string[]> => {
  return await getCategories(ALL_DESTINATION_COLLECTION)
}

export const addNewAllDestinationYear = async (year: number, data: Record<string, number>) => {
  const existing = await getAllDestinationDataByYear(year)

  if (existing) throw new Error(`Destination data for year ${year} already exists`)

  await postAllDestinationData(year, data)
}