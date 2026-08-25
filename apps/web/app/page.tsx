'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface Plant {
  id: string
  name: string
  species: string
  photoUrl: string | null
}

export default function Home() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlants()
  }, [])

  const fetchPlants = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plants`,
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch plants')
      const data = await response.json()
      setPlants(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plants')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header>
        <h1>🌱 Sweet Grass</h1>
      </header>
      <main>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>My Plants</h2>
            <Link href="/add" className={styles.addButton}>
              + Add Plant
            </Link>
          </div>

          {loading && <p className={styles.message}>Loading plants...</p>}
          {error && <p className={styles.error}>Error: {error}</p>}

          {!loading && plants.length === 0 && (
            <p className={styles.message}>No plants yet. <Link href="/add">Add your first plant!</Link></p>
          )}

          {!loading && plants.length > 0 && (
            <div className={styles.grid}>
              {plants.map((plant) => (
                <Link key={plant.id} href={`/plants/${plant.id}`} className={styles.card}>
                  {plant.photoUrl && (
                    <img src={plant.photoUrl} alt={plant.name} />
                  )}
                  <div className={styles.cardContent}>
                    <h3>{plant.name}</h3>
                    <p>{plant.species}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
