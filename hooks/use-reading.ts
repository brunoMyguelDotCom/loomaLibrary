"use client"

import { useCallback, useEffect, useState } from "react"

type Progress = Record<string, { page: number; total: number; updatedAt: number }>
type Bookmarks = Record<string, number[]>

const PROGRESS_KEY = "looma-progress"
const BOOKMARKS_KEY = "looma-bookmarks"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function useReadingProgress() {
  const [progress, setProgress] = useState<Progress>({})

  useEffect(() => {
    setProgress(read<Progress>(PROGRESS_KEY, {}))
  }, [])

  const saveProgress = useCallback(
    (bookId: string, page: number, total: number) => {
      setProgress((prev) => {
        const next = {
          ...prev,
          [bookId]: { page, total, updatedAt: Date.now() },
        }
        try {
          window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
        } catch {}
        return next
      })
    },
    [],
  )

  const getProgress = useCallback(
    (bookId: string) => progress[bookId],
    [progress],
  )

  return { progress, saveProgress, getProgress }
}

export function useBookmarks(bookId: string) {
  const [all, setAll] = useState<Bookmarks>({})

  useEffect(() => {
    setAll(read<Bookmarks>(BOOKMARKS_KEY, {}))
  }, [])

  const pages = all[bookId] ?? []

  const persist = useCallback((next: Bookmarks) => {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next))
    } catch {}
  }, [])

  const toggleBookmark = useCallback(
    (page: number) => {
      setAll((prev) => {
        const current = prev[bookId] ?? []
        const exists = current.includes(page)
        const updated = exists
          ? current.filter((p) => p !== page)
          : [...current, page].sort((a, b) => a - b)
        const next = { ...prev, [bookId]: updated }
        persist(next)
        return next
      })
    },
    [bookId, persist],
  )

  const isBookmarked = useCallback(
    (page: number) => pages.includes(page),
    [pages],
  )

  return { bookmarks: pages, toggleBookmark, isBookmarked }
}
