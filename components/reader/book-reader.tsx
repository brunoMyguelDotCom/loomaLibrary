"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import dynamic from "next/dynamic"
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  Rows3,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { FlipPage, FlipCover } from "@/components/reader/flip-page"
import { ThumbnailRail } from "@/components/reader/thumbnail-rail"
import { SearchPanel } from "@/components/reader/search-panel"
import { useBookPages } from "@/hooks/use-book-pages"
import { useBookmarks } from "@/hooks/use-reading"
import type { Book } from "@/lib/books"

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false })

/** Detecta dispositivos com pouca capacidade de renderização. */
function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.innerWidth < 820 ||
          /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
      )
    check()
    window.addEventListener("resize", check, { passive: true })
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

export function BookReader({
  book,
  initialPage,
  onClose,
  onCloseUI,
  onProgress,
}: {
  book: Book
  initialPage: number
  onClose: () => void
  onCloseUI: () => void
  onProgress: (page: number, total: number) => void
}) {
  const { state, getPage, searchText } = useBookPages(book.url)
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks(book.id)
  const isMobile = useMobileDetect()

  const flipRef = useRef<any>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [showThumbs, setShowThumbs] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [ready, setReady] = useState(false)
  const [stage, setStage] = useState({ w: 0, h: 0 })

  const total = state.numPages

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowRight") flipRef.current?.pageFlip()?.flipNext()
      if (e.key === "ArrowLeft") flipRef.current?.pageFlip()?.flipPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = useCallback(() => {
    onProgress(currentPage, total || 1)
    onClose()
    onCloseUI()
  }, [currentPage, total, onProgress, onClose, onCloseUI])

  const onInit = useCallback(() => {
    setReady(true)
    if (initialPage > 1) {
      requestAnimationFrame(() => {
        flipRef.current?.pageFlip()?.turnToPage(initialPage)
      })
    }
  }, [initialPage])

  const onFlip = useCallback(
    (e: { data: number }) => {
      const page = e.data + 1
      setCurrentPage(page)
      onProgress(page, total || 1)
    },
    [onProgress, total],
  )

  const goTo = useCallback((page: number) => {
    flipRef.current?.pageFlip()?.turnToPage(Math.max(0, page - 1))
  }, [])

  function toggleFullscreen() {
    const el = document.getElementById("looma-reader")
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.().catch(() => {})
      setFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  const pages = useMemo(() => {
    if (!total) return []
    const arr: number[] = []
    for (let i = 1; i <= total; i++) arr.push(i)
    return arr
  }, [total])

  const progressPct = total ? Math.round((currentPage / total) * 100) : 0

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      setStage({ w: rect.width, h: rect.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [state.loading])

  const pageSize = useMemo(() => {
    const pad = 32
    const availW = Math.max(260, stage.w - pad)
    const availH = Math.max(360, stage.h - pad)
    const aspect = state.aspect || 0.7
    const isWide = stage.w >= 820
    let pageW = isWide ? availW / 2 : availW
    let pageH = pageW / aspect
    if (pageH > availH) {
      pageH = availH
      pageW = pageH * aspect
    }
    return { w: Math.floor(pageW), h: Math.floor(pageH) }
  }, [stage, state.aspect])

  // Configurações adaptativas para mobile vs desktop
  // Mobile: animação mais rápida, sem sombras pesadas, swipe mais sensível
  const flipConfig = useMemo(() => ({
    flippingTime: isMobile ? 400 : 700,      // mobile: 400ms vs 700ms
    drawShadow: !isMobile,                    // mobile: sem sombra 3D (cálculo pesado)
    maxShadowOpacity: isMobile ? 0 : 0.4,
    useMouseEvents: !isMobile,               // mobile usa touch events, não mouse
    swipeDistance: isMobile ? 10 : 30,       // mobile: mais sensível ao swipe
    mobileScrollSupport: true,
  }), [isMobile])

  return (
    <div
      id="looma-reader"
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Barra superior */}
      <header className="flex items-center justify-between gap-2 border-b border-border/50 bg-background/70 px-3 py-2.5 backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Voltar à estante"
            className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
          <p className="truncate font-heading text-sm font-semibold sm:text-base">
            {book.title}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <ToolbarButton
            label="Pesquisar no livro"
            onClick={() => { setShowSearch((v) => !v); setShowThumbs(false) }}
            active={showSearch}
          >
            <Search className="size-[18px]" />
          </ToolbarButton>
          <ToolbarButton
            label="Miniaturas"
            onClick={() => { setShowThumbs((v) => !v); setShowSearch(false) }}
            active={showThumbs}
          >
            <Rows3 className="size-[18px]" />
          </ToolbarButton>
          <ToolbarButton
            label={isBookmarked(currentPage) ? "Remover marcador" : "Marcar página"}
            onClick={() => toggleBookmark(currentPage)}
            active={isBookmarked(currentPage)}
          >
            <Bookmark
              className={`size-[18px] ${isBookmarked(currentPage) ? "fill-current" : ""}`}
            />
          </ToolbarButton>
          <div className="mx-0.5 hidden items-center gap-1 sm:flex">
            <ToolbarButton
              label="Diminuir zoom"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            >
              <ZoomOut className="size-[18px]" />
            </ToolbarButton>
            <ToolbarButton
              label="Aumentar zoom"
              onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
            >
              <ZoomIn className="size-[18px]" />
            </ToolbarButton>
          </div>
          <ToolbarButton
            label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
            onClick={toggleFullscreen}
          >
            {fullscreen ? (
              <Minimize2 className="size-[18px]" />
            ) : (
              <Maximize2 className="size-[18px]" />
            )}
          </ToolbarButton>
        </div>
      </header>

      {/* Área do livro */}
      <div className="relative flex flex-1 overflow-hidden">
        {showThumbs && (
          <ThumbnailRail
            total={total}
            current={currentPage}
            bookmarks={bookmarks}
            getPage={getPage}
            onSelect={(p) => { goTo(p); setShowThumbs(false) }}
          />
        )}
        {showSearch && (
          <SearchPanel
            searchText={searchText}
            onSelect={(p) => { goTo(p); setShowSearch(false) }}
          />
        )}

        <div
          ref={stageRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8"
        >
          {state.loading && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm">Preparando seu livro…</p>
            </div>
          )}
          {state.error && (
            <p className="max-w-xs text-center text-sm text-destructive">
              {state.error}
            </p>
          )}

          {!state.loading && !state.error && total > 0 && pageSize.w > 0 && (
            <div
              className="flip-book transition-transform duration-300"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* @ts-expect-error -- react-pageflip não tem tipos completos */}
              <HTMLFlipBook
                key={`${pageSize.w}x${pageSize.h}`}
                ref={flipRef}
                width={pageSize.w}
                height={pageSize.h}
                size="fixed"
                minWidth={200}
                maxWidth={900}
                minHeight={300}
                maxHeight={1400}
                flippingTime={flipConfig.flippingTime}
                drawShadow={flipConfig.drawShadow}
                maxShadowOpacity={flipConfig.maxShadowOpacity}
                useMouseEvents={flipConfig.useMouseEvents}
                swipeDistance={flipConfig.swipeDistance}
                mobileScrollSupport={flipConfig.mobileScrollSupport}
                showCover
                clickEventForward
                startPage={0}
                onInit={onInit}
                onFlip={onFlip}
                className="flip-book-inner"
                style={{}}
              >
                {/* Capa */}
                <FlipCover title={book.title} variant="front" />

                {/* Páginas do PDF */}
                {pages.map((p) => (
                  <FlipPage
                    key={p}
                    pageNumber={p}
                    image={getPage(p)}
                    side={p % 2 === 0 ? "left" : "right"}
                    bookmarked={isBookmarked(p)}
                  />
                ))}

                {/* Contracapa */}
                <FlipCover title={book.title} variant="back" />
              </HTMLFlipBook>
            </div>
          )}
        </div>
      </div>

      {/* Navegação inferior + progresso */}
      <footer className="flex items-center gap-3 border-t border-border/50 bg-background/70 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => flipRef.current?.pageFlip()?.flipPrev()}
          aria-label="Página anterior"
          className="grid size-9 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
          disabled={!ready}
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {total ? `Página ${currentPage} de ${total} · ${progressPct}%` : "—"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => flipRef.current?.pageFlip()?.flipNext()}
          aria-label="Próxima página"
          className="grid size-9 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
          disabled={!ready}
        >
          <ChevronRight className="size-5" />
        </button>
      </footer>
    </div>
  )
}

function ToolbarButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-full transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  )
}
