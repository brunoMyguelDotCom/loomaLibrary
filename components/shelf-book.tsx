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
        className="relative block w-full max-w-[170px] cursor-pointer transition-transform duration-500 ease-out [transform-style:preserve-3d] hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-none"
      >
        {/* Sombra projetada no chão da estante */}
        <span className="pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[78%] -translate-x-1/2 rounded-[100%] bg-black/40 blur-md transition-all duration-500 group-hover:w-[88%] group-hover:bg-black/50" />

        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-r-md rounded-l-sm shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] ring-1 ring-black/10 transition-shadow duration-500 group-hover:shadow-[0_22px_46px_-10px_rgba(0,0,0,0.65)]">
          <BookCover book={book} />
          {/* Lombada / brilho do livro físico */}
          <span className="book-spine pointer-events-none absolute inset-0" />
          <span className="pointer-events-none absolute inset-y-0 left-0 w-[7px] bg-gradient-to-r from-black/35 to-transparent" />
          {/* Brilho ao passar o mouse */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Barra de progresso de leitura */}
          {typeof progressPct === "number" && progressPct > 0 && (
            <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
              <span
                className="block h-full bg-primary"
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
          className="absolute right-1 top-1 z-10 grid size-7 place-items-center rounded-full bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}

      <p className="mt-3 line-clamp-2 max-w-[170px] text-center text-sm font-medium leading-snug text-foreground/90">
        {book.title}
      </p>
      {typeof progressPct === "number" && progressPct > 0 && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {progressPct >= 100 ? "Concluído" : `${Math.round(progressPct)}% lido`}
        </p>
      )}
    </div>
  )
}
