"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { BookOpen, Library, Search, X, LayoutGrid, List, BookMarked, Brain, Sparkles } from "lucide-react"
import { LoomaLogo } from "@/components/looma-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadButton } from "@/components/upload-button"
import { Shelf } from "@/components/shelf"
import { BookReader } from "@/components/reader/book-reader"
import { useReadingProgress } from "@/hooks/use-reading"
import type { Book } from "@/lib/books"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export type ViewMode = "grid" | "list"

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function RevealSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "scroll-reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading, mutate } = useSWR<{ books: Book[] }>(
    "/api/books",
    fetcher,
    { revalidateOnFocus: false },
  )
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<Book | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<"name" | "recent">("name")
  const { getProgress, saveProgress } = useReadingProgress()

  const books = data?.books ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? books.filter((b) => b.title.toLowerCase().includes(q)) : books
    if (sortBy === "name") return [...base].sort((a, b) => a.title.localeCompare(b.title))
    return base
  }, [books, query, sortBy])

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
    <>
      {/* Textura de fundo com orbs azuis */}
      <div className="bg-texture" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <main className="min-h-screen">
        {/* Cabeçalho */}
        <header className="header-glass sticky top-0 z-30">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <img src="/favicon.png" alt="LoomaLibrary logo" className="size-6 object-contain" />
              </div>
              <div className="leading-none">
                <p className="font-heading text-[1.05rem] font-800 tracking-tight text-foreground">
                  LoomaLibrary
                </p>
                <p className="hidden text-[0.68rem] font-600 tracking-wide text-muted-foreground sm:block">
                  sua biblioteca de Psicologia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 animate-slide-up-fade" style={{ animationDelay: '180ms' }}>
              <div className="hidden sm:block">
                <UploadButton onUploaded={() => mutate()} />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section className="hero-section relative overflow-hidden">
          {/* Fundo hero gradiente */}
          <div className="hero-bg" aria-hidden="true" />

          {/* Favicon como fundo decorativo com blur e baixa opacidade */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <img
              src="/favicon.png"
              alt=""
              className="w-[420px] max-w-[70vw] object-contain"
              style={{ opacity: 0.2, filter: 'blur(6px)' }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 md:py-36 text-center">
            {/* Badge */}
            <div
              className="hero-badge animate-badge-pop inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-700 tracking-wide text-primary/80 mb-6"
              style={{ animationDelay: '250ms' }}
            >
              <Library className="size-3.5 text-primary" />
              Leitura, mente e desenvolvimento humano
            </div>

            {/* Título principal */}
            <h1
              className="animate-slide-up-fade font-heading text-4xl font-900 leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl mb-6"
              style={{ animationDelay: '420ms' }}
            >
              Sua biblioteca<br />
              <span className="text-gradient">de Psicologia</span>
            </h1>

            {/* Subtítulo */}
            <p
              className="animate-slide-up-fade mx-auto max-w-2xl text-pretty text-lg font-500 leading-relaxed text-muted-foreground mb-10"
              style={{ animationDelay: '620ms' }}
            >
              Um cantinho tranquilo para guardar e folhear seus livros.
              Cada PDF se transforma em um livro que você vira página por página.
            </p>

            {/* Stats herói */}
            <div
              className="animate-slide-up-fade flex flex-wrap justify-center gap-8 mb-12"
              style={{ animationDelay: '820ms' }}
            >
              {[
                { icon: BookMarked, label: "Livros salvos", value: books.length > 0 ? books.length : "—" },
                { icon: Brain, label: "Leitura focada", value: "PDF" },
                { icon: Sparkles, label: "Gratuito", value: "100%" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="hero-stat flex flex-col items-center gap-1">
                  <Icon className="size-5 text-primary mb-1" />
                  <span className="text-2xl font-800 text-foreground">{value}</span>
                  <span className="text-xs font-600 tracking-wide text-muted-foreground uppercase">{label}</span>
                </div>
              ))}
            </div>

            {/* Scroll cue */}
            <div className="animate-bounce-slow flex justify-center" style={{ animationDelay: '1100ms' }}>
              <div className="scroll-cue flex flex-col items-center gap-1.5 text-muted-foreground/50">
                <span className="text-[0.65rem] font-600 tracking-widest uppercase">Ver coleção</span>
                <div className="scroll-cue-line" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── BARRA DE CONTROLES ─────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
          <RevealSection delay={0} className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Pesquisa */}
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar livros…"
                  className="search-input w-full rounded-full py-2.5 pl-10 pr-10 text-sm font-500 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar pesquisa"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Controles direita */}
              <div className="flex items-center gap-3">
                {/* Ordenação */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
                  className="sort-select rounded-full px-3 py-2 text-xs font-600 outline-none cursor-pointer"
                >
                  <option value="name">A → Z</option>
                  <option value="recent">Recentes</option>
                </select>

                {/* Toggle grid/list */}
                <div className="view-toggle flex rounded-full p-1 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Visualizar em grade"
                    className={`view-toggle-btn ${viewMode === "grid" ? "view-toggle-btn--active" : ""}`}
                  >
                    <LayoutGrid className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="Visualizar em lista"
                    className={`view-toggle-btn ${viewMode === "list" ? "view-toggle-btn--active" : ""}`}
                  >
                    <List className="size-3.5" />
                  </button>
                </div>

                {/* Contagem */}
                {books.length > 0 && (
                  <p className="text-sm font-600 text-muted-foreground whitespace-nowrap">
                    {filtered.length} de {books.length} livro{books.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </RevealSection>

          {/* Upload no mobile */}
          <div className="mt-4 sm:hidden">
            <UploadButton onUploaded={() => mutate()} />
          </div>
        </section>

        {/* ─── CONTEÚDO DA ESTANTE ────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 pb-20">
          {isLoading ? (
            <ShelfSkeleton viewMode={viewMode} />
          ) : filtered.length > 0 ? (
            <Shelf
              books={filtered}
              getProgressPct={getProgressPct}
              onOpen={setActive}
              onDelete={handleDelete}
              viewMode={viewMode}
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
    </>
  )
}

function ShelfSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-shimmer h-16 w-full rounded-2xl" style={{ animationDelay: `${i * 40}ms` }} />
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="animate-shimmer aspect-[2/3] w-full max-w-[170px] rounded-r-md rounded-l-sm" />
          <div className="animate-shimmer mt-3 h-3 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ hasBooks }: { hasBooks: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-border/60 bg-card/40 py-24 text-center backdrop-blur-sm">
      <div className="animate-icon-pulse grid size-18 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <BookOpen className="size-8" />
      </div>
      <div className="max-w-sm space-y-2">
        <h2 className="font-heading text-xl font-800 text-center">
          {hasBooks ? "Nenhum livro encontrado" : "Sua estante está vazia"}
        </h2>
        <p className="text-sm font-500 leading-relaxed text-muted-foreground text-center">
          {hasBooks
            ? "Tente pesquisar por outro título."
            : "Adicione seus PDFs e eles aparecerão aqui como livros prontos para folhear."}
        </p>
      </div>
    </div>
  )
}
