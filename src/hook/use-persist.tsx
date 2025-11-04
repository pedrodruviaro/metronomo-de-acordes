import { useCallback, useEffect, useState } from "react"

export function usePersist<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error)
    }
  }, [key, storedValue])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      return value instanceof Function ? value(prev) : value
    })
  }, [])

  return [storedValue, setValue]
}
