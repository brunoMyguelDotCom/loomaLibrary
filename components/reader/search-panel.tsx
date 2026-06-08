"use client"

import { useState } from "react"
import { Loader2, Search } from "lucide-react"

export function SearchPanel({
  searchText,
  onSelect,
}: {
  searchText: (term: string) => Promise<number[]>
  onSelect: (page: number) => void
}) {
  const [term, setTerm] = useState("")
  const [results, setResults] = useState<number[] | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(e: React.FormEvent) {
    e.preventDefault()
    if (!term.trim()) return
    setBusy(true)
    const hits = await searchText(term)
    setResults(hits)
    setBusy(false)
  }

  return (
    <aside className="scrollbar-thin h-full w-64 shrink-0 overflow-y-auto border-r border-border/50 bg-background/80 p-4 backdrop-blur-xl sm:w-72">
      <form onSubmit={run} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar no conteúdo…"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
        />
      </form>

      <div className="mt-4">
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Procurando…
          </div>
        )}

        {!busy && results && (
          <>
            <p className="mb-2 text-xs text-muted-foreground">
              {results.length === 0
                ? "Nenhum resultado encontrado."
                : `${results.length} página(s) com o termo`}
            </p>
            <ul className="flex flex-col gap-1.5">
              {results.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => onSelect(p)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-secondary"
                  >
                    Página {p}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {!busy && !results && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Digite uma palavra para localizá-la dentro do livro. A busca
            percorre o texto de todas as páginas.
          </p>
        )}
      </div>
    </aside>
  )
}
