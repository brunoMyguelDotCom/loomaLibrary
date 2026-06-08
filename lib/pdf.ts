"use client"

import type { PDFDocumentProxy } from "pdfjs-dist"

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

/**
 * Renderiza uma página do PDF em canvas e retorna um data URL (JPEG).
 * Em mobile usa escala menor para economizar memória e CPU.
 *
 * ⚠️  NÃO usar canvas compartilhado aqui — no desktop MAX_CONCURRENT=2
 * faz dois renders rodarem em paralelo; um canvas único corromperia ambos.
 * Cada chamada cria seu próprio canvas (descartado após toDataURL).
 */
export async function renderPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale = 1.5,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const mobile = isMobile()
  const effectiveScale = mobile ? Math.min(scale, 1.0) : scale

  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale: effectiveScale })

  const canvas = document.createElement("canvas")
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  // Sem { alpha: false } — evita incompatibilidade com Safari/WebKit
  const context = canvas.getContext("2d")!

  // Fundo branco obrigatório antes do render.
  // JPEG não tem canal alpha — sem isso pixels transparentes do PDF viram preto.
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({ canvasContext: context, viewport }).promise

  const quality = mobile ? 0.75 : 0.85
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
