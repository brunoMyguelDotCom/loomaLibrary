"use client"

import { useRef, useState } from "react"
import { Loader2, Plus, UploadCloud } from "lucide-react"

export function UploadButton({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const pdfs = Array.from(files).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf"),
    )
    if (pdfs.length === 0) {
      setStatus("Selecione arquivos PDF.")
      return
    }

    setBusy(true)
    let done = 0
    for (const file of pdfs) {
      setStatus(`Enviando ${file.name}…`)
      try {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/books/upload", {
          method: "POST",
          body: fd,
        })
        if (!res.ok) throw new Error(await res.text())
        done++
      } catch (e) {
        console.error("[v0] Upload falhou:", file.name, e)
        setStatus(`Falha ao enviar ${file.name}.`)
      }
    }
    setBusy(false)
    setStatus(done > 0 ? `${done} livro(s) adicionado(s).` : null)
    if (done > 0) onUploaded()
    setTimeout(() => setStatus(null), 3500)
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="btn-primary-glow inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Adicionar livro
      </button>
      {status && (
        <span className="hidden animate-slide-up-fade items-center gap-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
          <UploadCloud className="size-3.5 text-primary" />
          {status}
        </span>
      )}
    </div>
  )
}
