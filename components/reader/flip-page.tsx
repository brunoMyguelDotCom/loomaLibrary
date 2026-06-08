"use client"

import { forwardRef } from "react"
import { Bookmark, Loader2 } from "lucide-react"

/** Página de conteúdo (renderização do PDF). */
export const FlipPage = forwardRef<
  HTMLDivElement,
  {
    image: string | null
    pageNumber: number
    bookmarked?: boolean
    side: "left" | "right"
  }
>(function FlipPage({ image, pageNumber, bookmarked, side }, ref) {
  return (
    <div
      ref={ref}
      className="relative h-full w-full bg-[#fbfaf6] text-neutral-900"
      data-density="soft"
    >
      {/* Sombra da dobra junto à lombada */}
      <span
        className={
          side === "left"
            ? "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black/18 to-transparent"
            : "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black/18 to-transparent"
        }
      />
      {image ? (
        <img
          src={image || "/placeholder.svg"}
          alt={`Página ${pageNumber}`}
          className="h-full w-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="size-6 animate-spin text-neutral-400" />
        </div>
      )}

      {bookmarked && (
        <Bookmark className="absolute right-3 top-0 size-6 fill-primary text-primary drop-shadow" />
      )}

      <span className="absolute bottom-2 left-0 right-0 text-center text-[0.65rem] text-neutral-400">
        {pageNumber}
      </span>
    </div>
  )
})

/** Capa dura do livro. */
export const FlipCover = forwardRef<
  HTMLDivElement,
  { title: string; subtitle?: string; variant?: "front" | "back" }
>(function FlipCover({ title, subtitle, variant = "front" }, ref) {
  return (
    <div
      ref={ref}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-8 text-white"
      data-density="hard"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.4 0.07 235), oklch(0.24 0.05 245))",
      }}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/10" />
      <span
        className={
          variant === "front"
            ? "pointer-events-none absolute inset-y-0 left-0 w-3 bg-black/30"
            : "pointer-events-none absolute inset-y-0 right-0 w-3 bg-black/30"
        }
      />
      {variant === "front" ? (
        <>
          <div className="h-1 w-12 rounded-full bg-white/40" />
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              LoomaLibrary
            </p>
            <h2 className="text-balance font-heading text-2xl font-semibold leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-white/70">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/50">
            <span className="h-px w-8 bg-white/40" />
            <span className="text-[0.7rem] uppercase tracking-widest">
              Boa leitura
            </span>
          </div>
        </>
      ) : (
        <div className="m-auto text-center text-white/50">
          <p className="font-heading text-lg">Fim</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em]">
            LoomaLibrary
          </p>
        </div>
      )}
    </div>
  )
})
