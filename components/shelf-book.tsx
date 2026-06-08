"use client"

import { BookCover } from "@/components/book-cover"
import type { Book } from "@/lib/books"
import { Trash2 } from "lucide-react"

export function ShelfBook({
  book,
  progressPct,
  onOpen,
  onDelete,
}: {
  book: Book
  progressPct?: number
  onOpen: (book: Book) => void
  onDelete?: (book: Book) => void
}) {
  return (
    <div className="group relative flex flex-col items-center">
      <button
        type="button"
        onClick={() => onOpen(book)}
        aria-label={`Abrir ${book.title}`}
        className="relative block w-full max-w-[170px] cursor-pointer [transform-style:preserve-3d] transition-transform duration-500 ease-out hover:-translate-y-3 focus-visible:-translate-y-3 focus-visible:outline-none"
      >
        {/* Sombra projetada dinâmica */}
        <span className="pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-[100%] bg-primary/30 blur-md transition-all duration-500 group-hover:w-[90%] group-hover:bg-primary/45 group-hover:blur-lg" />

        {/* Anel de destaque no hover */}
        <span className="pointer-events-none absolute -inset-[3px] rounded-[calc(0.375rem+3px)] opacity-0 ring-2 ring-primary/40 transition-opacity duration-400 group-hover:opacity-100" />

        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-r-md rounded-l-sm shadow-[0_8px_28px_-6px_rgba(0,0,0,0.50)] ring-1 ring-black/10 transition-shadow duration-500 group-hover:shadow-[0_20px_48px_-8px_oklch(0.42_0.12_240_/_0.45)]">
          <BookCover book={book} />
          {/* Lombada */}
          <span className="book-spine pointer-events-none absolute inset-0" />
          <span className="pointer-events-none absolute inset-y-0 left-0 w-[7px] bg-gradient-to-r from-black/35 to-transparent" />
          {/* Brilho hover */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/24 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Reflexo no topo */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

          {/* Barra de progresso */}
          {typeof progressPct === "number" && progressPct > 0 && (
            <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/25">
              <span
                className="block h-full bg-primary transition-all duration-700"
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </span>
          )}
        </div>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(book)}
          aria-label={`Remover ${book.title} da biblioteca`}
          className="absolute right-1 top-1 z-10 grid size-7 place-items-center rounded-full bg-background/85 text-muted-foreground opacity-0 backdrop-blur-sm ring-1 ring-border/50 transition-all duration-200 hover:text-destructive hover:scale-110 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}

      <p className="mt-3.5 line-clamp-2 max-w-[160px] text-center text-[0.8rem] font-semibold leading-snug text-foreground/85 transition-colors duration-200 group-hover:text-foreground">
        {book.title}
      </p>
      {typeof progressPct === "number" && progressPct > 0 && (
        <p className="mt-0.5 text-[0.7rem] font-medium text-primary/70">
          {progressPct >= 100 ? "✓ Concluído" : `${Math.round(progressPct)}% lido`}
        </p>
      )}
    </div>
  )
}
