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
    // Reduz uso de memória em PDFs grandes / mobile
    disableAutoFetch: true,
    disableStream: false,
  })
  const doc = await task.promise
  return { doc, numPages: doc.numPages }
}

/**
 * Renderiza uma página do PDF em um canvas e retorna um data URL (PNG).
 * scale ajusta a resolução (qualidade x desempenho).
 */
export async function renderPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale = 1.4,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")!
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  const dataUrl = canvas.toDataURL("image/png")
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
