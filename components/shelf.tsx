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
  // Agrupa os livros em prateleiras de tamanho responsivo via CSS grid
  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {books.map((book, i) => (
          <div
            key={book.id}
            className="animate-float-in"
            style={{ animationDelay: `${Math.min(i, 12) * 50}ms` }}
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
