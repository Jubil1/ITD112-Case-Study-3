import { db } from '../firebase'
import { collection, getDoc, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'

// POST
export const postDataToFirestore = async (
  collectionPath: string,
  year: number,
  data: Record<string, number>
) => {
  const docRef = doc(db, collectionPath, year.toString())
  await setDoc(docRef, data)
}

// GET
export const getDataByYear = async (
  collectionPath: string,
  year: number
): Promise<Record<string, number> | null> => {
  const docRef = doc(db, collectionPath, year.toString())
  const snapshot = await getDoc(docRef)
  return snapshot.exists() ? (snapshot.data() as Record<string, number>) : null
}

// GET ALL
export const getAllData = async (collectionPath: string) => {
  const collectionRef = collection(db, collectionPath)
  const snapshot = await getDocs(collectionRef)

  const data = snapshot.docs.map(doc => ({
    Year: parseInt(doc.id),
    ...doc.data()
  }))

  return data.sort((a, b) => a.Year - b.Year)
}

// PUT
export const updateDataByYear = async (
  collectionPath: string,
  year: number,
  updates: Record<string, number>
) => {
  const docRef = doc(db, collectionPath, year.toString())
  await setDoc(docRef, updates, { merge: true })
}

// DELETE
export const deleteDataByYear = async (
  collectionPath: string,
  year: number
) => {
  const docRef = doc(db, collectionPath, year.toString())
  await deleteDoc(docRef)
}

// DELETE ALL
export const deleteAllData = async (collectionPath: string) => {
  const collectionRef = collection(db, collectionPath)
  const snapshot = await getDocs(collectionRef)

  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}

// GET available years for a collection
export const getAvailableYears = async (collectionPath: string): Promise<number[]> => {
  const collectionRef = collection(db, collectionPath)
  const snapshot = await getDocs(collectionRef)

  return snapshot.docs.map(doc => parseInt(doc.id)).sort((a, b) => a - b )
}

// GET categories
export const getCategories = async (collectionPath: string): Promise<string[]> => {
  const collectionRef = collection(db, collectionPath)
  const snapshot = await getDocs(collectionRef)

  if (snapshot.empty) return []

  const firstDoc = snapshot.docs[0]
  const data = firstDoc.data()

  return Object.keys(data)
}