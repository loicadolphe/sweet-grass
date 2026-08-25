'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './log.module.css'

interface Plant {
  id: string
  name: string
}

export default function LogReading() {
  const params = useParams()
  const router = useRouter()
  const plantId = params.id as string

  const [plant, setPlant] = useState<Plant | null>(null)
  const [moisture, setMoisture] = useState('50')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string | null>(null)

  useEffect(() => {
    if (plantId) {
      fetchPlant()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plant) return

    try {
      setSubmitting(true)
      setError(null)
      setAdvice(null)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plants/${plantId}/readings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
          body: JSON.stringify({
            moisture: parseInt(moisture),
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to log reading')
      const data = await response.json()
      setAdvice(data.advice)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/plants/${plantId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log reading')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className={styles.message}>Loading...</p>
  if (error && !advice) return <p className={styles.error}>Error: {error}</p>
  if (!plant) return <p className={styles.message}>Plant not found</p>

  return (
    <>
      <header>
        <h1>🌱 Sweet Grass</h1>
      </header>
      <main>
        <div className={styles.container}>
          <Link href={`/plants/${plantId}`} className={styles.back}>
            ← Back
          </Link>

          <div className={styles.form}>
            <h2>Log Moisture Reading</h2>
            <p className={styles.plantName}>{plant.name}</p>

            {advice && (
              <div className={styles.advice}>
                <p className={styles.adviceText}>{advice}</p>
                <p className={styles.redirecting}>Redirecting...</p>
              </div>
            )}

            {!advice && (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="moisture">Soil Moisture Level (%)</label>
                  <div className={styles.sliderContainer}>
                    <input
                      id="moisture"
                      type="range"
                      min="0"
                      max="100"
                      value={moisture}
                      onChange={(e) => setMoisture(e.target.value)}
                      disabled={submitting}
                      className={styles.slider}
                    />
                    <span className={styles.value}>{moisture}%</span>
                  </div>
                  <div className={styles.sliderLabels}>
                    <span>Dry</span>
                    <span>Wet</span>
                  </div>
                </div>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitButton}
                >
                  {submitting ? 'Logging...' : 'Log Reading'}
                </button>
              </form>
            )}
          </div>

          <div className={styles.help}>
            <h3>How to measure soil moisture</h3>
            <ul>
              <li>Use a soil moisture meter (recommended)</li>
              <li>Insert probe into soil 2-3 inches deep</li>
              <li>Wait 5-10 seconds for reading to stabilize</li>
              <li>Record the percentage displayed</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
