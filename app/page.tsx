"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { BookOpen, Library, Search, X } from "lucide-react"
import { LoomaLogo } from "@/components/looma-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadButton } from "@/components/upload-button"
import { Shelf } from "@/components/shelf"
import { BookReader } from "@/components/reader/book-reader"
import { useReadingProgress } from "@/hooks/use-reading"
import type { Book } from "@/lib/books"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HomePage() {
  const { data, isLoading, mutate } = useSWR<{ books: Book[] }>(
    "/api/books",
    fetcher,
    { revalidateOnFocus: false },
  )
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<Book | null>(null)
  const { getProgress, saveProgress } = useReadingProgress()

  const books = data?.books ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return books
    return books.filter((b) => b.title.toLowerCase().includes(q))
  }, [books, query])

  const getProgressPct = (book: Book) => {
    const p = getProgress(book.id)
    if (!p || !p.total) return undefined
    return (p.page / p.total) * 100
  }

  async function handleDelete(book: Book) {
    if (!confirm(`Remover "${book.title}" da biblioteca?`)) return
    await fetch("/api/books/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname: book.pathname }),
    })
    mutate()
  }

  return (
    <main className="min-h-screen">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <LoomaLogo className="size-9 text-primary" />
            <div className="leading-none">
              <p className="font-heading text-lg font-semibold tracking-tight">
                LoomaLibrary
              </p>
              <p className="hidden text-[0.7rem] text-muted-foreground sm:block">
                sua biblioteca de Psicologia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <UploadButton onUploaded={() => mutate()} />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero / boas-vindas */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            <Library className="size-3.5 text-primary" />
            Leitura, mente e desenvolvimento humano
          </span>
          <h1 className="text-balance font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Bem-vindo à sua estante digital
          </h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Um cantinho tranquilo para guardar e folhear seus livros. Escolha um
            título e mergulhe — cada PDF se transforma em um livro que você vira
            página por página.
          </p>
        </div>

        {/* Pesquisa */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar livros…"
              className="w-full rounded-full border border-border bg-card/60 py-2.5 pl-10 pr-10 text-sm outline-none ring-primary/40 transition focus:ring-2"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {books.length > 0 &&
              `${filtered.length} de ${books.length} livro${books.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Upload no mobile */}
        <div className="mt-4 sm:hidden">
          <UploadButton onUploaded={() => mutate()} />
        </div>
      </section>

      {/* Conteúdo da estante */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {isLoading ? (
          <ShelfSkeleton />
        ) : filtered.length > 0 ? (
          <Shelf
            books={filtered}
            getProgressPct={getProgressPct}
            onOpen={setActive}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState hasBooks={books.length > 0} />
        )}
      </section>

      {/* Leitor */}
      {active && (
        <BookReader
          book={active}
          initialPage={getProgress(active.id)?.page ?? 1}
          onClose={() => mutate()}
          onCloseUI={() => setActive(null)}
          onProgress={(page, total) => saveProgress(active.id, page, total)}
        />
      )}
    </main>
  )
}

function ShelfSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="aspect-[2/3] w-full max-w-[170px] animate-pulse rounded-r-md rounded-l-sm bg-muted" />
          <div className="mt-3 h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ hasBooks }: { hasBooks: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
        <BookOpen className="size-7" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h2 className="font-heading text-xl font-semibold">
          {hasBooks ? "Nenhum livro encontrado" : "Sua estante está vazia"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {hasBooks
            ? "Tente pesquisar por outro título."
            : "Adicione seus PDFs e eles aparecerão aqui como livros prontos para folhear."}
        </p>
      </div>
    </div>
  )
}
