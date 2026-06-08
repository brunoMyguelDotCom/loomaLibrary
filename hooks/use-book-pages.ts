"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { getPageText, loadPdf, renderPageToDataUrl } from "@/lib/pdf"

export type BookState = {
  loading: boolean
  error: string | null
  numPages: number
  /** proporção (largura/altura) da primeira página, para dimensionar o livro */
  aspect: number
}

/**
 * Carrega o PDF e renderiza páginas sob demanda em imagens, com cache.
 * Retorna utilitários para o leitor flipbook.
 */
export function useBookPages(url: string, scale = 1.5) {
  const docRef = useRef<PDFDocumentProxy | null>(null)
  const cache = useRef<Map<number, string>>(new Map())
  const pending = useRef<Map<number, Promise<string>>>(new Map())
  const textCache = useRef<Map<number, string>>(new Map())

  const [state, setState] = useState<BookState>({
    loading: true,
    error: null,
    numPages: 0,
    aspect: 0.66,
  })
  // contador para forçar re-render quando uma página termina
  const [, force] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    cache.current.clear()
    pending.current.clear()
    textCache.current.clear()
    ;(async () => {
      try {
        const { doc, numPages } = await loadPdf(url)
        if (cancelled) {
          doc.destroy()
          return
        }
        docRef.current = doc
        const first = await doc.getPage(1)
        const vp = first.getViewport({ scale: 1 })
        first.cleanup()
        if (cancelled) return
        setState({
          loading: false,
          error: null,
          numPages,
          aspect: vp.width / vp.height,
        })
      } catch (e) {
        console.error("[v0] Erro ao carregar livro:", e)
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error: "Não foi possível abrir este livro.",
          }))
      }
    })()
    return () => {
      cancelled = true
      docRef.current?.destroy()
      docRef.current = null
    }
  }, [url])

  const getPage = useCallback(
    (pageNumber: number): string | null => {
      if (pageNumber < 1) return null
      const cached = cache.current.get(pageNumber)
      if (cached) return cached
      const doc = docRef.current
      if (!doc || pageNumber > doc.numPages) return null
      if (pending.current.has(pageNumber)) return null

      const p = renderPageToDataUrl(doc, pageNumber, scale)
        .then(({ dataUrl }) => {
          cache.current.set(pageNumber, dataUrl)
          pending.current.delete(pageNumber)
          force((n) => n + 1)
          return dataUrl
        })
        .catch((e) => {
          console.error("[v0] Erro ao renderizar página", pageNumber, e)
          pending.current.delete(pageNumber)
          return ""
        })
      pending.current.set(pageNumber, p)
      return null
    },
    [scale],
  )

  const searchText = useCallback(
    async (term: string): Promise<number[]> => {
      const doc = docRef.current
      if (!doc || !term.trim()) return []
      const q = term.trim().toLowerCase()
      const hits: number[] = []
      for (let i = 1; i <= doc.numPages; i++) {
        let text = textCache.current.get(i)
        if (text === undefined) {
          text = (await getPageText(doc, i)).toLowerCase()
          textCache.current.set(i, text)
        }
        if (text.includes(q)) hits.push(i)
      }
      return hits
    },
    [],
  )

  return { state, getPage, searchText }
}
