"use client"

import type { PDFDocumentProxy } from "pdfjs-dist"

// Carrega o pdfjs-dist apenas no cliente e configura o worker uma única vez.
let pdfjsLib: typeof import("pdfjs-dist") | null = null

export async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib
  const lib = await import("pdfjs-dist")
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
  pdfjsLib = lib
  return lib
}

export type LoadedPdf = {
  doc: PDFDocumentProxy
  numPages: number
}

export async function loadPdf(url: string): Promise<LoadedPdf> {
  const lib = await getPdfjs()
  const task = lib.getDocument({
    url,
    disableAutoFetch: true,
    disableStream: false,
  })
  const doc = await task.promise
  return { doc, numPages: doc.numPages }
}

/** Detecta se estamos num dispositivo com pouca memória/CPU. */
function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < 820 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
}

/** Canvas único reutilizável para evitar alocações repetidas. */
let sharedCanvas: HTMLCanvasElement | null = null
function getCanvas(): HTMLCanvasElement {
  if (!sharedCanvas) sharedCanvas = document.createElement("canvas")
  return sharedCanvas
}

/**
 * Renderiza uma página do PDF em canvas e retorna um data URL (JPEG).
 * Em mobile usa escala menor e qualidade JPEG para economizar memória e CPU.
 */
export async function renderPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale = 1.5,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const mobile = isMobile()

  // Em mobile: reduz a escala para diminuir o tamanho do canvas em memória.
  const effectiveScale = mobile ? Math.min(scale, 1.0) : scale

  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale: effectiveScale })

  const canvas = getCanvas()
  const context = canvas.getContext("2d", {
    // Desativa alpha: economiza ~25% de memória e acelera compositing.
    alpha: false,
    // Sugere ao browser priorizar velocidade sobre fidelidade de cores.
    colorSpace: "srgb",
  })!

  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  await page.render({ canvasContext: context, viewport }).promise

  // JPEG é ~3-5x menor que PNG para conteúdo de livro (texto + imagens).
  // Qualidade 0.82 é imperceptível para leitura e drasticamente mais leve.
  const quality = mobile ? 0.72 : 0.82
  const dataUrl = canvas.toDataURL("image/jpeg", quality)

  page.cleanup()
  return { dataUrl, width: canvas.width, height: canvas.height }
}

/** Extrai o texto de uma página para a pesquisa interna. */
export async function getPageText(
  doc: PDFDocumentProxy,
  pageNumber: number,
): Promise<string> {
  const page = await doc.getPage(pageNumber)
  const content = await page.getTextContent()
  const text = content.items
    .map((item) => ("str" in item ? item.str : ""))
    .join(" ")
  page.cleanup()
  return text
}
