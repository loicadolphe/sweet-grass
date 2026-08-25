'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './add.module.css'

interface Candidate {
  name: string
  commonNames: string[]
}

export default function AddPlant() {
  const router = useRouter()
  const [plantName, setPlantName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'identify' | 'details'>('upload')

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleIdentify = async () => {
    if (!photo) {
      setError('Please select a photo')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', photo)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/identify`,
        {
          method: 'POST',
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
          body: formData,
        }
      )

      if (!response.ok) throw new Error('Failed to identify plant')
      const data = await response.json()
      setCandidates(data.candidates || [])
      if (data.candidates?.length > 0) {
        setSelectedCandidate(data.candidates[0])
      }
      setStep('identify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to identify plant')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleConfirm = () => {
    if (selectedCandidate) {
      setPlantName(selectedCandidate.name)
      setStep('details')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plantName || !selectedCandidate) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create plant
      const createResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
          body: JSON.stringify({
            name: plantName,
            species: selectedCandidate.name,
          }),
        }
      )

      if (!createResponse.ok) throw new Error('Failed to create plant')
      const newPlant = await createResponse.json()

      router.push(`/plants/${newPlant.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plant')
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
            <Link href="/">← Back</Link>
            <h2>Add Plant</h2>
            <div style={{ width: 100 }} />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {step === 'upload' && (
            <div className={styles.form}>
              <h3>Take a photo of your plant</h3>
              <div className={styles.uploadArea}>
                {photoPreview && (
                  <img src={photoPreview} alt="preview" className={styles.preview} />
                )}
                {!photoPreview && (
                  <div className={styles.placeholder}>📷 Click to select a photo</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className={styles.fileInput}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleIdentify}
                disabled={!photo || loading}
                className={styles.fullWidth}
              >
                {loading ? 'Identifying...' : 'Identify Plant'}
              </button>
            </div>
          )}

          {step === 'identify' && candidates.length > 0 && (
            <div className={styles.form}>
              <h3>Is this your plant?</h3>
              <div className={styles.candidates}>
                {candidates.map((candidate, idx) => (
                  <div
                    key={idx}
                    className={`${styles.candidate} ${
                      selectedCandidate?.name === candidate.name ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectCandidate(candidate)}
                  >
                    <p className={styles.candidateName}>{candidate.name}</p>
                    {candidate.commonNames?.length > 0 && (
                      <p className={styles.commonNames}>
                        {candidate.commonNames.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleConfirm}
                disabled={!selectedCandidate || loading}
                className={styles.fullWidth}
              >
                Continue
              </button>
            </div>
          )}

          {step === 'details' && selectedCandidate && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h3>Give your plant a name</h3>
              <div className={styles.formGroup}>
                <label htmlFor="plantName">Plant Name</label>
                <input
                  id="plantName"
                  type="text"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="e.g., My Monstera"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Species</label>
                <p className={styles.speciesInfo}>{selectedCandidate.name}</p>
              </div>

              <button
                type="submit"
                disabled={!plantName || loading}
                className={styles.fullWidth}
              >
                {loading ? 'Creating...' : 'Add Plant'}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
