import { useEffect, useState, useCallback } from 'react'
import { apiGet } from '../api/client'

/**
 * Fetches an API endpoint. Re-fetches when `deps` change.
 * Returns { data, loading, error, refetch }.
 */
export default function useApi(path, deps = [], params = undefined) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    apiGet(path, params)
      .then((res) => {
        if (active) setData(res)
        setError(null)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps])

  const refetch = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, error, refetch }
}
