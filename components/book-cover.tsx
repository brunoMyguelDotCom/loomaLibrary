"use client"

import { useEffect, useRef, useState } from "react"
import { loadPdf, renderPageToDataUrl } from "@/lib/pdf"
import { coverHue, type Book } from "@/lib/books"
import { cn } from "@/lib/utils"

const cache = new Map<string, string>()

export function BookCover({
  book,
  className,
}: {
  book: Book
  className?: string
}) {
  const [cover, setCover] = useState<string | null>(cache.get(book.id) ?? null)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Renderiza somente quando entra na viewport (desempenho com muitos livros)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || cover) return
    let cancelled = false
    ;(async () => {
      try {
        const { doc } = await loadPdf(book.url)
        const { dataUrl } = await renderPageToDataUrl(doc, 1, 0.9)
        if (!cancelled) {
          cache.set(book.id, dataUrl)
          setCover(dataUrl)
        }
        doc.destroy()
      } catch (e) {
        console.error("[v0] Falha ao gerar capa:", book.title, e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [visible, cover, book])

  const hue = coverHue(book.title)

  return (
    <div
      ref={ref}
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      {cover ? (
        <img
          src={cover || "/placeholder.svg"}
          alt={`Capa do livro ${book.title}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        // Capa gerada (fallback) mantendo o tom da Psicologia
        <div
          className="flex h-full w-full flex-col justify-between p-3"
          style={{
            background: `linear-gradient(160deg, hsl(${hue} 45% 32%), hsl(${hue + 15} 55% 18%))`,
          }}
        >
          <div className="h-1 w-8 rounded-full bg-white/40" />
          <p className="font-heading text-pretty text-[0.8rem] font-semibold leading-tight text-white/95">
            {book.title}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            <span className="text-[0.55rem] uppercase tracking-widest text-white/55">
              LoomaLibrary
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
