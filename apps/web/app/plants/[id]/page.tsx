'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './detail.module.css'

interface Plant {
  id: string
  name: string
  species: string
  photoUrl: string | null
}

interface Reading {
  id: string
  moisture: number
  timestamp: string
  advice: string
}

export default function PlantDetail() {
  const params = useParams()
  const router = useRouter()
  const plantId = params.id as string

  const [plant, setPlant] = useState<Plant | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (plantId) {
      fetchPlant()
      fetchReadings()
    }
  }, [plantId])

  const fetchPlant = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plants/${plantId}`,
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch plant')
      const data = await response.json()
      setPlant(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plant')
    } finally {
      setLoading(false)
    }
  }

  const fetchReadings = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plants/${plantId}/readings`,
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch readings')
      const data = await response.json()
      setReadings(data)
    } catch (err) {
      console.error('Failed to load readings:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this plant?')) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plants/${plantId}`,
        {
          method: 'DELETE',
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to delete plant')
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plant')
    }
  }

  if (loading) return <p className={styles.message}>Loading...</p>
  if (error) return <p className={styles.error}>Error: {error}</p>
  if (!plant) return <p className={styles.message}>Plant not found</p>

  return (
    <>
      <header>
        <h1>🌱 Sweet Grass</h1>
      </header>
      <main>
        <div className={styles.container}>
          <Link href="/" className={styles.back}>
            ← Back
          </Link>

          <div className={styles.plantCard}>
            {plant.photoUrl && (
              <img src={plant.photoUrl} alt={plant.name} className={styles.photo} />
            )}
            <div className={styles.info}>
              <h2>{plant.name}</h2>
              <p className={styles.species}>{plant.species}</p>

              <div className={styles.actions}>
                <Link href={`/plants/${plantId}/log`} className={styles.logButton}>
                  📊 Log Reading
                </Link>
                <button
                  onClick={handleDelete}
                  className={styles.deleteButton}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>

          <div className={styles.readingsSection}>
            <h3>Recent Readings</h3>
            {readings.length === 0 ? (
              <p className={styles.message}>No readings yet. <Link href={`/plants/${plantId}/log`}>Log your first reading!</Link></p>
            ) : (
              <div className={styles.readingsList}>
                {readings.map((reading) => (
                  <div key={reading.id} className={styles.readingCard}>
                    <div className={styles.readingHeader}>
                      <span className={styles.moisture}>
                        💧 {reading.moisture}%
                      </span>
                      <span className={styles.date}>
                        {new Date(reading.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={styles.advice}>{reading.advice}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
