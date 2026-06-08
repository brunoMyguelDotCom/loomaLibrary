"use client"

import { useEffect, useState } from "react"
import { Bookmark } from "lucide-react"

export function ThumbnailRail({
  total,
  current,
  bookmarks,
  getPage,
  onSelect,
}: {
  total: number
  current: number
  bookmarks: number[]
  getPage: (page: number) => string | null
  onSelect: (page: number) => void
}) {
  // força re-render conforme as miniaturas terminam de renderizar
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 600)
    return () => clearInterval(id)
  }, [])

  return (
    <aside className="scrollbar-thin h-full w-28 shrink-0 overflow-y-auto border-r border-border/50 bg-background/80 p-2 backdrop-blur-xl sm:w-36">
      <div className="flex flex-col gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const page = i + 1
          const src = getPage(page)
          const isCurrent = page === current
          return (
            <button
              key={page}
              type="button"
              onClick={() => onSelect(page)}
              className={`relative overflow-hidden rounded-md border transition-all ${
                isCurrent
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="aspect-[2/3] w-full bg-muted">
                {src ? (
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`Miniatura da página ${page}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full animate-pulse bg-muted" />
                )}
              </div>
              {bookmarks.includes(page) && (
                <Bookmark className="absolute right-1 top-0 size-3.5 fill-primary text-primary" />
              )}
              <span className="absolute bottom-0 right-1 text-[0.6rem] text-muted-foreground">
                {page}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
