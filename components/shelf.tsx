"use client"

import { ShelfBook } from "@/components/shelf-book"
import type { Book } from "@/lib/books"

export function Shelf({
  books,
  getProgressPct,
  onOpen,
  onDelete,
}: {
  books: Book[]
  getProgressPct: (book: Book) => number | undefined
  onOpen: (book: Book) => void
  onDelete: (book: Book) => void
}) {
  return (
    <div className="relative">
      {/* Separador decorativo acima da estante */}
      <div className="mb-10 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60">
          sua coleção
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {books.map((book, i) => (
          <div
            key={book.id}
            className="animate-float-in"
            style={{ animationDelay: `${Math.min(i, 14) * 45}ms` }}
          >
            <ShelfBook
              book={book}
              progressPct={getProgressPct(book)}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
